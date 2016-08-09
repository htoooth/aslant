'use strict';
/* eslint import/no-unresolved:0 */
import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import * as util from 'aslant/helpers/util';
import * as influxdbAction from 'aslant/actions/influxdb';
import SeriesTable from 'aslant/components/series-table';
import Chart from 'aslant/components/chart';
import { STATS_VIEW_TYPES } from 'aslant/constants/common';
import RadioSelector from 'aslant/components/radio-selector';
import classnames from 'classnames';

class InfluxdbVisualizationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doingQuery: false,
      originalQL: '',
      timer: null,
      type: '',
    };
  }
  componentWillUnmount() {
    clearInterval(this.state.timer);
  }
  getPoints(ql) {
    const { configure } = this.props;
    return influxdbAction.getPoints(configure.server, configure.database, ql).then(series => {
      const extracts = configure.extracts;
      if (extracts && extracts.length) {
        const extractDescList = _.compact(_.map(extracts, extract => {
          if (!extract.value || !extract.key) {
            return '';
          }
          return `${extract.value}(${extract.key})`;
        })).sort();
        _.forEach(series, item => {
          const columns = item.columns;
          _.forEach(extractDescList, (desc, i) => {
            columns[i + 1] = desc;
          });
        });
      }
      return series;
    });
  }
  getQL() {
    const { configure, offsetTime } = this.props;
    let tmp = configure;
    if (offsetTime && offsetTime !== 'Custom') {
      tmp = Object.assign({}, configure, {
        offsetTime,
      });
    }
    return util.getInfluxQL(tmp);
  }
  checkToStartAutoRefresh() {
    const { autoRefresh, offsetTime } = this.props;
    const state = this.state;
    if (!autoRefresh) {
      clearInterval(this.state.timer);
      return;
    }
    if (autoRefresh !== state.autoRefresh || offsetTime !== state.offsetTime) {
      this.autoRefresh(this.getQL());
      state.autoRefresh = autoRefresh;
      state.offsetTime = offsetTime;
    }
  }
  autoRefresh(ql) {
    const { autoRefresh } = this.props;
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
    this.state.timer = setInterval(() => {
      this.getPoints(ql).then(series => {
        this.setState({
          series,
        });
      });
    }, util.toSeconds(autoRefresh) * 1000);
  }
  updateSeries() {
    const state = this.state;
    const ql = this.getQL();
    if (!ql || state.doingQuery || ql === state.originalQL) {
      return;
    }
    this.setState({
      doingQuery: true,
      originalQL: ql,
      error: '',
    });
    this.getPoints(ql).then(series => {
      this.setState({
        series,
        error: '',
        doingQuery: false,
      });
    }).catch(err => {
      this.setState({
        series: null,
        doingQuery: false,
        error: util.getError(err),
      });
    });
  }
  renderSeriesTable() {
    const { series } = this.state;
    const { hideEmptyPoint } = this.props.configure;
    return _.map(series, (item, index) => <SeriesTable
      key={`series-table-${index}`}
      seriesItem={item}
      hideEmptyPoint={hideEmptyPoint}
    />);
  }
  renderCharts(type) {
    const { series } = this.state;
    const { configure } = this.props;
    return (
      <Chart
        series={series}
        type={type}
        setting={configure.echart}
      />
    );
  }
  renderStatsViewSelector() {
    return (
      <RadioSelector
        className="statsViewSelector"
        desc={'stats view:'}
        options={STATS_VIEW_TYPES}
        selected={this.state.type || this.props.type || STATS_VIEW_TYPES[0]}
        onSelect={option => {
          if (this.state.type !== option) {
            this.setState({
              type: option,
            });
          }
        }}
      />
    );
  }

  render() {
    setTimeout(() => this.updateSeries(), 100);
    this.checkToStartAutoRefresh();
    const { disableViewSelector, configure } = this.props;
    const { series, doingQuery } = this.state;
    const type = this.state.type || this.props.type || STATS_VIEW_TYPES[0];
    if (!series || doingQuery) {
      return null;
    }
    if (!series.length) {
      return (
        <p className="tac">There is not stats data, please change influx ql.</p>
      );
    }
    let view;
    switch (type) {
      case 'table':
        view = this.renderSeriesTable();
        break;
      default:
        view = this.renderCharts(type);
        break;
    }
    const nameCls = {
      name: true,
    };
    const name = _.get(configure, 'name', '');
    const nameContainerWidth = name.length * 14 + 20;

    let nameStyle = {
      width: `${nameContainerWidth}px`,
    };
    if (type === 'table') {
      nameCls.table = true;
    } else {
      nameStyle['margin-left'] = `${-(nameContainerWidth / 2)}px`;
      nameCls.chart = true;
    }
    return (
      <div
        className="visualizationView"
      >
        {configure && configure.name && <div
          className={classnames(nameCls)}
          style={nameStyle}
        >{configure.name}</div>}
        {!disableViewSelector && this.renderStatsViewSelector()}
        {
          doingQuery && <p className="tac">
            <i className="fa fa-spinner" aria-hidden="true"></i>
            Loading...
          </p>
        }
        {view}
      </div>
    );
  }
}

InfluxdbVisualizationView.propTypes = {
  disableViewSelector: PropTypes.bool,
  autoRefresh: PropTypes.string,
  offsetTime: PropTypes.string,
  type: PropTypes.string,
  configure: PropTypes.object.isRequired,
};

export default InfluxdbVisualizationView;
