'use strict';
/* eslint import/no-unresolved:0 */
import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';
import DatePicker from 'react-datepicker';
import TimePicker from 'rc-time-picker';
import moment from 'moment';
import Select from 'react-select';
import * as uuid from 'uuid';
import * as util from '../helpers/util';
import * as influxdbAction from '../actions/influxdb';
import * as navigationAction from '../actions/navigation';
import InfluxdbVisualizationView from '../components/influxdb-visualization-view';
import Dialog from '../components/dialog';
import DateTimePicker from '../components/date-time-picker';
import ParallelSelector from '../components/parallel-selector';

class VisualizationSaveDialog extends Dialog {
  constructor(props) {
    super(props);
    const conf = _.get(props, 'orginalData.configure');
    this.state = {
      title: conf ? 'Update Visualization' : 'Save Visualization',
      classes: {
        visualizationSaveDialog: true,
      },
      status: '',
    };
  }
  onKeyUp(e) {
    this.setState({
      error: '',
    });
    switch(e.keyCode) {
      case 27:
        return this.onClose(e);
    }
  }
  componentDidMount() {
    const props = this.props;
    _.forEach(this.refs, (ref, k) => {
      const v = _.get(props, `orginalData.${k}`);
      if(v) {
        ref.value = v;
      }
    });
  }
  getData() {
    const refs = this.refs;
    return {
      name: (refs.name.value || '').trim(),
      desc: (refs.desc.value || '').trim(),
    };
  }
  onClose(e) {
    const { onClose } = this.props;
    e.preventDefault();
    onClose();
  }
  submit(e) {
    e.preventDefault();
    const props = this.props;
    const { status } = this.state;
    const { dispatch, data } = props;
    if (status === 'processing') {
      return;
    }
    const inputs = this.getData();
    if (!inputs.name || !inputs.desc) {
      return this.setState({
        error: 'name and description catn\'t be empty',
      });
    }
    inputs.configure = data;
    this.setState({
      status: 'processing',
    });
    const id = _.get(props, 'orginalData._id');
    let fn;
    if (id) {
      const token = props.orginalData.token;
      fn = dispatch(influxdbAction.updateConfigure(id, token, inputs));
    } else {
      fn = dispatch(influxdbAction.addConfigure(inputs));
    }
    fn.then(data => {
      dispatch(navigationAction.showVisualizations());
    }).catch(err => {
      this.setState({
        status: '',
        error: util.getError(err),
      });
    });
  }
  getContent() {
    const { status, error } = this.state;
    return (
      <form className="pure-form pure-form-aligned"><fieldset>
        <div className="pure-control-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            autoFocus="true"
            onKeyUp={e => this.onKeyUp(e)}
            placeholder="Visualization Name"
            ref="name"
          />
        </div>
        <div className="pure-control-group">
          <label htmlFor="desc">Description</label>
          <textarea
            id="desc"
            onKeyUp={e => this.onKeyUp(e)}
            placeholder="Visualization Description"
            ref="desc"
          >
          </textarea>
        </div>
        { error && 
          <div className="warning">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <span>{error}</span>
          </div>
        }
        <div className="pure-controls">
          <a
            className="pure-button pure-button-primary submit"
            href="#"
            onClick={e => this.submit(e)}
          >Submit
            { status === 'processing' && <span>...</span> }
          </a>
        </div>
      </fieldset></form>
    );
  }
}

class InfluxdbRadioSelector extends Component {
  select(e, option) {
    const { onSelect } = this.props;
    e.preventDefault();
    onSelect(option);
  }
  renderOptions() {
    const { selected, options } = this.props;
    const cur = selected || options[0];
    return _.map(options, option => {
      const cls = {
        fa: true,
      };
      if (cur === option) {
        cls['fa-check-square-o'] = true;
      } else {
        cls['fa-square-o'] = true;
      }
      return (
        <a
          key={option}
          href="#"
          onClick={e => this.select(e, option)}
        >
          <i className={classnames(cls)}></i>
          {option}
        </a>
      );
    });
  }
  render() {
    const { desc, options } = this.props;
    return (
      <div className="radioSelector">
        <span>{desc}</span>
        {this.renderOptions()}
      </div>
    );
  }
}

class InfluxdbVisualizationEditor extends Component {
  constructor(props) {
    super(props);
    const conf = _.get(props, 'data.configure');
    this.state = _.extend({
      originalQL: '',
      conditionSelectorCount: 1,
      extractSelectorCount: 1,
      groupSelectorCount: 1,
      showSubmitDialog: false,
      showBasicSelector: false,
      showGroupSelector: false,
      showDateTimeSelector: false,
      hideEmptyPoint: false,
      server: '',
      db: '',
      rp: '',
      measurement: '',
      conditions: [],
      extracts: [],
      groups: [],
      fields: [],
      groupByTime: '',
      offsetTime: '-15m',
      orderByTime: 'asc',
      statsView: 'table',
      date: {
        start: null,
        end: null,
      },
      dateTimePickerValue: {
        start: null,
        end: null,
      },
      error: '',
    }, conf);
    this.restore();
  }
  restore() {
    const { data, dispatch } = this.props;
    if (!data) {
      return;
    }
    const conf = data.configure;
    const { server, db, measurement } = conf;
    if (!server) {
      return;
    }
    dispatch(influxdbAction.listDatabase(server));
    if (!db) {
      return;
    }
    dispatch(influxdbAction.listRP(server, db));
    dispatch(influxdbAction.listMeasurement(server, db));
    if (!measurement) {
      return;
    }
    dispatch(influxdbAction.listTagInfos(server, db, measurement));
    dispatch(influxdbAction.listField(server, db, measurement));
  }
  clearError() {
    this.setState({
      error: '',
    });
  }
  setError(err) {
    this.setState({
      error: util.getError(err),
    });
  }
  setDateTimeValue(date, type) {
    const data = this.state.dateTimePickerValue;
    data[type] = date;
    this.setState({
      dateTimePickerValue: data,
    });
  }
  setDate(e) {
    e.preventDefault();
    const data = _.pick(this.state.dateTimePickerValue, ['start', 'end']);
    this.setState({
      offsetTime: 'Custom',
      showDateTimeSelector: false,
      date: data,
    });
  }
  renderServerSelector() {
    const { dispatch } = this.props;
    const convert = item => {
      return {
        label: item.name,
        value: item._id,
      };
    };
    return this.renderSelecotr({
      pickKey: 'props.influxdbServer.list',
      key: 'server',
      convert,
      onChange: item => {
        dispatch(influxdbAction.listDatabase(item.value))
          .catch(this.setError.bind(this));
        this.clearError();
      },
    });
  }
  renderDatabaseSelector() {
    const { server } = this.state;
    const { dispatch } = this.props;
    return this.renderSelecotr({
      pickKey: `props.influxdbServer.databases[${server}]`,
      key: 'db',
      onChange: item => {
        dispatch(influxdbAction.listRP(server, item.value))
          .catch(this.setError.bind(this));
        dispatch(influxdbAction.listMeasurement(server, item.value))
          .catch(this.setError.bind(this));
        this.clearError();
      },
    });
  }
  renderRPSelector() {
    const { server, db } = this.state;
    return this.renderSelecotr({
      pickKey: `props.influxdbServer.rps[${server + db}]`,
      key: 'rp'
    });
  }
  renderMeasurementSelector() {
    const { server, db } = this.state;
    const { dispatch } = this.props;
    return this.renderSelecotr({
      pickKey: `props.influxdbServer.measurements[${server + db}]`,
      key: 'measurement',
      placeholder: 'Select a measurement',
      onChange: item => {
        dispatch(influxdbAction.listTagInfos(server, db, item.value))
          .catch(this.setError.bind(this));
        dispatch(influxdbAction.listField(server, db, item.value))
          .catch(this.setError.bind(this));
        this.clearError();
      },
    });
  }
  renderTagKeySelector(index) {
    const { server, db, measurement, conditions } = this.state;
    const { dispatch } = this.props;
    const key = `props.influxdbServer.tagInfos[${server + db + measurement}]`;
    const tagInfos = _.get(this, key);
    const keys = _.map(tagInfos, item => item.tag);
    const condition = conditions[index];
    const found = _.find(tagInfos, item => {
      return item.tag === (condition && condition.key);
    });
    const values = found && found.value;
    return this.renderParallelSelector({
      index,
      keys,
      values,
      id: _.get(conditions, `[${index}].id`),
      defaultKey: _.get(conditions, `[${index}].key`),
      defaultValue: _.get(conditions, `[${index}].value`),
      listKey: 'conditions',
      countKey: 'conditionSelectorCount',
    });
  }
  renderFieldKeySelector(index) {
    const values = 'clear count sum mean median min max spread stddev first last'.split(' ');
    const { server, db, measurement, extracts } = this.state;
    const key = `props.influxdbServer.fields[${server + db + measurement}]`;
    return this.renderParallelSelector({
      index,
      keys: _.get(this, key),
      values,
      id: _.get(extracts, `[${index}].id`),
      defaultKey: _.get(extracts, `[${index}].key`),
      defaultValue: _.get(extracts, `[${index}].value`),
      listKey: 'extracts',
      countKey: 'extractSelectorCount',
    });
  }
  renderGroupbySelector(index) {
    const { server, db, measurement, groups } = this.state;
    const { dispatch } = this.props;
    const key = `props.influxdbServer.tagInfos[${server + db + measurement}]`;
    const tagInfos = _.get(this, key);
    const values = _.map(tagInfos, item => item.tag);
    return this.renderParallelSelector({
      hidden: ['key'],
      index,
      values,
      id: _.get(groups, `[${index}].id`),
      defaultKey: _.get(groups, `[${index}].key`),
      defaultValue: _.get(groups, `[${index}].value`),
      listKey: 'groups',
      countKey: 'groupSelectorCount',
    });
  }
  renderGroupbyTimeSelector() {
    if (!_.get(this, 'state.extracts.length')) {
      return null;
    }
    const options = _.map('10s 30s 1m 5m 10m 15m 30m 1h 2h 6h 12h 1d 2d 7d 30d'.split(' '), v => {
      return {
        label: v,
        value: v,
      };
    });
    return (
      <Select
        value={this.state.groupByTime}
        className="mbottom10"
        options={options}
        onChange={item => {
          const value = (item && item.value) || '';
          this.setState({
            groupByTime: value,
          });
          this.clearError();
        }}
      />
    );
  }
  renderParallelSelector(opts) {
    const { index, keys, id, values, defaultKey, defaultValue, listKey, countKey, hidden } = opts;
    return <ParallelSelector
      hidden={hidden}
      key={id || uuid.v4()}
      keys={keys}
      values={values}
      defaultKey={defaultKey}
      defaultValue={defaultValue}
      onSelect={item => {

        const arr = this.state[listKey].slice(0);
        arr[index] = Object.assign({
          id: uuid.v4(),
        }, item);
        const data = {};
        data[listKey] = arr;
        this.setState(data);
        this.clearError();
      }}
      toggleType={index === 0 ? "add" : "remove"}
      onToggle={type => {
        const list = this.state[listKey];
        const count = this.state[countKey];
        const data = {};
        data[countKey] = count + 1;
        if (type === 'remove') {
          data[countKey] = count - 1;
          let clone = list.slice(0);
          clone.splice(index, 1);
          data[listKey] = clone;
        }
        this.setState(data);
        this.clearError();
      }}
    />
  }
  renderSelecotr(opts) {
    const { pickKey, key } = opts;
    const defaultConvert = item => {
      return {
        label: item,
        value: item,
      };
    };
    const convert = opts.convert || defaultConvert;
    const onChange = opts.onChange || _.noop;

    const data = _.get(this, pickKey, []);
    const options = _.map(data, convert);
    return <Select
      className="influxdbSelector"
      options={options}
      value={this.state[key]}
      placeholder={opts.placeholder}
      onChange={item => {
        const data = {};
        if (!item) {
          data[key] = '';
          this.setState(data);
          return;
        }
        data[key] = item.value;
        this.setState(data);
        onChange(item);
      }}
    />
  }
  getInfluxQL() {
    const state = this.state;
    if (!state.measurement || state.error) {
      return '';
    }
    const count = Math.abs(util.toSeconds(state.offsetTime)) / util.toSeconds(state.groupByTime);
    if (count > 300) {
      this.setState({
        series: null,
        error: `There are too many points(${count}), please change influx ql group by time`,
      });
      return '';
    }
    return util.getInfluxQL(state);
  }
  renderQueryBar() {
    const { showDateTimeSelector } = this.state;
    return <div
      className="queryBarContainer"
    >
      <a
        onClick={e => this.onClickToggle(e, 'basicSelector')}
        href="#"
        className="pure-button pullLeft tac showServerSelector"
      >
        <i className="fa fa-server" aria-hidden="true"></i>
      </a>
      <div className="pullRight timeSelectorContainer">
        {this.renderTimeSelector()}
      </div>
      <div 
        className="influxQl"
      >
        <input
          style={{
            width: '100%',
            padding: '9px',
          }}
          value={this.getInfluxQL()}
          placeholder="it will create influx ql auto"
          type="text"
        />
      </div>
      { showDateTimeSelector && this.renderDatePickerSelector()}
    </div>
  }
  renderBasicSelector() {
    const { showBasicSelector } = this.state;
    if (!showBasicSelector) {
      return null;
    }
    return <div className="basicSelector"
      onClick={e => e.disableToggle = true}
      style={{
        marginTop: '-6px',
      }}
    >
      <label className="mtop10">Servers</label>
      {this.renderServerSelector()}
      <label className="mtop10">Databases</label>
      {this.renderDatabaseSelector()}
      <label className="mtop10">Retention Policies</label>
      {this.renderRPSelector()}
    </div>
  }
  renderFilterSelector() {
    const { conditionSelectorCount } = this.state;
    const arr = [];
    for (let i = 0; i < conditionSelectorCount; i++) {
      arr.push(this.renderTagKeySelector(i));
    }
    return <div className="filterSelector">
      <label>Filter By</label>
      {this.renderMeasurementSelector()}
      {arr}
    </div>
  }
  renderTimeSelector() {
    const arr = ['now', 'now'];
    const { start, end } = this.state.date;
    if (start) {
      arr[0] = start;
    }
    if (end) {
      arr[1] = end;
    }
    const options = [
      {
        label: 'Past 5 minutes',
        value: '-5m',
      },
      {
        label: 'Past 15 minutes',
        value: '-15m',
      },
      {
        label: 'Past 30 minutes',
        value: '-30m',
      },
      {
        label: 'Past 1 hour',
        value: '-1h',
      },
      {
        label: 'Past 2 hours',
        value: '-2h',
      },
      {
        label: 'Past 6 hour',
        value: '-6h',
      },
      {
        label: 'Past 12 hour',
        value: '-12h',
      },
      {
        label: 'Past 1 day',
        value: '-1d',
      },
      {
        label: 'Past 2 days',
        value: '-2d',
      },
      {
        label: 'Past 7 days',
        value: '-7d',
      },
      {
        label: 'Past 30 days',
        value: '-30d',
      },
      {
        label: 'Custom',
        value: 'Custom',
      },
    ];
    const defaultValue = this.state.offsetTime;
    return (
      <Select
        value={defaultValue}
        options={options}
        onChange={item => {
          const value = (item && item.value) || '';
          if (value && value.charAt(0) !== '-') {
            return this.setState({
              showDateTimeSelector: true,
            });
          }
          this.setState({
            offsetTime: value,
          });
        }}
      />
    );
  }
  renderDatePickerSelector() {
    const arr = _.map(['start', 'end'], key => {
      return (
        <div className="pure-u-1-2">
          <DateTimePicker
            onSelect={value => {
              this.setDateTimeValue(value, key);
              this.clearError();
            }}
          />
        </div>
      );
    });
    return (
      <div
        className="datePickerSelector pure-g"
        onClick={e => e.disableToggle = true}
      >
        {arr}
        <a
          href="#"
          className="pure-button pure-u-1 apply"
          onClick={e => this.setDate(e)}
        >
          Apply
        </a>
      </div>
    );
  }
  renderExtractSelecotr() {
    const { extractSelectorCount, groupSelectorCount, showGroupSelector } = this.state;
    const arr = [];
    for (let i = 0; i < extractSelectorCount; i++) {
      arr.push(this.renderFieldKeySelector(i));
    }
    const groupArr = [];
    if (showGroupSelector) {
      for(let i = 0; i < groupSelectorCount; i++) {
        groupArr.push(this.renderGroupbySelector(i));
      }
      groupArr.push(this.renderGroupbyTimeSelector());
    }
    return <div className="extractSelector">
      <label>Extract By</label>
      {arr}
      <div className="groupByContainer clearfix">
        <a
          href="#"
          className="pullRight"
          onClick={e => this.onClickToggle(e, 'groupBySelector')}
        >
          <i className="fa fa-cubes" aria-hidden="true"></i>
          Group By
        </a>
        {
          showGroupSelector && <div
            className="groupBySelector"
            onClick={e => e.disableToggle = true}
          >

            {groupArr}
          </div>
        }
      </div>
    </div>
  }
  renderShowFieldSelector() {
    const { server, db, measurement, conditions } = this.state;
    const { dispatch } = this.props;
    const tagInfos = _.get(this, `props.influxdbServer.tagInfos[${server + db + measurement}]`);
    const fields = _.get(this, `props.influxdbServer.fields[${server + db + measurement}]`);
    if (!fields) {
      return null;
    }
    const arr = fields.concat(_.map(tagInfos, item => item.tag));
    const showFields = this.state.fields;
    const list = _.map(arr, v => {
      const cls = {
        fa: true,
      };
      if (_.indexOf(showFields, v) === -1) {
        cls['fa-square-o'] = true;
      } else {
        cls['fa-check-square-o'] = true;
      }
      const id = `show-filed-${v}`;
      return (
        <li
          key={v}
        >
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              const arr = this.state.fields.slice(0);
              const index = _.indexOf(arr, v);
              if (index !== -1) {
                arr.splice(index, 1);
              } else {
                arr.push(v);
              }
              this.setState({
                fields: arr,
              });
            }}
          >
            <i className={classnames(cls)} aria-hidden="true"></i>
            {v}
          </a>
        </li>
      );
    });
    return (
      <ul
        className="fieldShowSelector"
      >
        <li>Fields:</li>
        {list}
      </ul>
    );
  }
  renderExtraSelector() {
    const { hideEmptyPoint, orderByTime } = this.state;
    const conf = _.get(this.props, 'data.configure'); 
    const emptyPointCls = {
      fa: true,
    };
    if (!hideEmptyPoint) {
      emptyPointCls['fa-square-o'] = true;
    } else {
      emptyPointCls['fa-check-square-o'] = true;
    }
    return (
      <div className="extraSelector">
        <label>Extra Setting</label>
        <InfluxdbRadioSelector
          desc={'stats view:'}
          options={['table', 'line-chart', 'pie-chart']}
          selected={this.state.statsView}
          onSelect={option => {
            if (this.state.statsView !== option) {
              this.setState({
                statsView: option,
              });
            }
          }}
        />
        <InfluxdbRadioSelector
          desc={'order by time:'}
          options={['asc', 'desc']}
          selected={this.state.orderByTime}
          onSelect={option => {
            if (this.state.orderByTime !== option) {
              this.setState({
                orderByTime: option,
              });
            }
          }}
        />
        <a
          href="#"
          className='hideEmptyPoint'
          onClick={e => {
            e.preventDefault();
            this.setState({
              hideEmptyPoint: !this.state.hideEmptyPoint,
            });
          }}
        >
          <i className={classnames(emptyPointCls)} aria-hidden="true"></i>
          Hide Empty Point
        </a>
        {this.renderShowFieldSelector()}
        <a
          className="pure-button pure-button-primary submit"
          href="#"
          onClick={e => {
            e.preventDefault();
            this.setState({
              showSubmitDialog: true,
            });
          }}
        >
          { conf ? 'Update' : 'Save' }
        </a>
      </div>
    )
  }
  getConfigure() {
    const keys = 'server db rp measurement groupByTime offsetTime conditions extracts groups fields date hideEmptyPoint orderByTime statsView'.split(' ');
    return _.pick(this.state, keys);
  }
  renderSubmitDialog() {
    const { dispatch } = this.props;
    const data = this.getConfigure();
    return (
      <VisualizationSaveDialog
        onClose={() => this.setState({
          showSubmitDialog: false,
        })}
        orginalData={this.props.data}
        dispatch={dispatch}
        data={data}
      />
    );
  }
  onClickToggle(e, type) {
    e.disableToggle = true;
    e.preventDefault();
    const data = {};
    const state = this.state;
    const keyDict = {
      basicSelector: 'showBasicSelector',
      groupBySelector: 'showGroupSelector',
    };
    const key = keyDict[type];
    if (!key) {
      return;
    }
    data[key] = !state[key];
    this.setState(data);
  }
  renderErrorTips() {
    const { error } = this.state;
    if (!error) {
      return null;
    }
    return (
      <div className="warning">
        <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
        <span>{error}</span>
      </div>
    );
  }
  hideSelector() {
    const state = this.state;
    const data = {};
    _.forEach(['showBasicSelector', 'showGroupSelector', 'showDateTimeSelector'], key => {
      if (state[key]) {
        data[key] = false;
      }
    });
    if (!_.isEmpty(data)) {
      this.setState(data);
    }
  }
  renderStatsView() {
    const { dispatch } = this.props;
    const state = this.state;
    if (!this.getInfluxQL()) {
      return null;
    }
    return (
      <InfluxdbVisualizationView
        dispatch={dispatch}
        configure={this.getConfigure()}
        type={state.statsView}
      />
    );
  }
  render() {
    const { showSubmitDialog } = this.state;
    return <div
      className="influxdbVisualizationEditor"
      onClick={e => {
        if (!e.disableToggle) {
          this.hideSelector();
        }
        delete e.disableToggle;
      }}
    >
      {this.renderQueryBar()}
      {this.renderBasicSelector()}
      <div className="pure-g">
        <div className="pure-u-1-3">
          {this.renderFilterSelector()}
        </div>
        <div className="pure-u-1-3">
          {this.renderExtractSelecotr()}
        </div>
        <div className="pure-u-1-3">
          {this.renderExtraSelector()}
        </div>
      </div>
      {
        this.renderStatsView()
      }
      {
        this.renderErrorTips()
      }
      {
        showSubmitDialog && this.renderSubmitDialog()
      }
    </div>
  }
}

export default InfluxdbVisualizationEditor;
