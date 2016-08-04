'use strict';
/* eslint  import/no-unresolved:0 */
import React, { PropTypes, Component } from 'react';
import * as echarts from 'echarts';
import * as formater from 'aslant/helpers/echarts-formater';

class Chart extends Component {
  componentDidMount() {
    const chart = echarts.init(this.refs.chart);
    this.chart = chart;
    chart.setOption(this.getOption());
  }
  componentWillReceiveProps(nextProps) {
    const chart = this.chart;
    if (nextProps.type !== this.props.type && chart) {
      chart.clear();
    }
  }
  componentDidUpdate() {
    const chart = this.chart;
    chart.setOption(this.getOption());
  }
  getOption() {
    const { type, series, setting } = this.props;
    let fn;
    switch (type) {
      case 'pie-chart':
        fn = formater.getPieOption;
        break;
      case 'bar-chart':
        fn = formater.getBarOption;
        break;
      case 'gauge-chart':
        fn = formater.getGaugeOption;
        break;
      default:
        fn = formater.getLineOption;
        break;
    }
    return fn(series, this.props.name, setting);
  }
  render() {
    return (
      <div className="chartContainer">
        <div
          ref="chart"
          style={{
            height: '100%',
          }}
        >
        </div>
      </div>
    );
  }
}

Chart.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  series: PropTypes.array.isRequired,
};

export default Chart;
