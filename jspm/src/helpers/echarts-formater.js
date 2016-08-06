'use strict';
/* eslint import/no-unresolved:0 */
import * as _ from 'lodash';
import * as util from 'aslant/helpers/util';

function getDefaultLineOption(name) {
  return {
    name,
    type: 'line',
    smooth: true,
    symbol: 'none',
    itemStyle: {
      normal: {},
    },
    areaStyle: {
      normal: {},
    },
    data: [],
  };
}

export function getLineOption(data, name, setting) {
  const result = _.map(data, util.convertSeriesData);
  const series = _.map(data, item => {
    let desc = item.name;
    if (item.tags) {
      desc = _.map(item.tags, (v, k) => {
        return `${k}(${v})`;
      }).join(' ');
    }
    return getDefaultLineOption(desc);
  });
  const dateList = [];
  _.forEach(result, (arr, index) => {
    const values = arr.slice(1);
    _.forEach(values, value => {
      const time = value.shift();
      if (index === 0) {
        dateList.push(time);
      }
      series[index].data.push(value.pop());
    });
  });
  const onePageSize = Math.ceil(Math.min(50 / dateList.length, 1) * 100);
  return _.extend({
    tooltip: {
      trigger: 'axis',
    },
    title: {
      left: 'center',
      text: name,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateList,
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%'],
    },
    grid: {
      left: 40,
      right: 40,
      top: 15,
    },
    dataZoom: [{
      type: 'inside',
      start: 100 - onePageSize,
      end: 100,
    }, {
      start: 100 - onePageSize,
      end: 100,
      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    }],
    series,
  }, setting);
}

export function getPieOption(data, name, setting) {
  const pieData = _.extend({
    name,
    type: 'pie',
    radius: '55%',
    center: ['50%', '60%'],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    data: [],
    itemStyle: {
      emphasis: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  }, setting);
  const option = {
    title: {
      text: name,
    },
    legend: {
      data: [],
    },
    series: [
      pieData,
    ],
  };
  _.forEach(data, item => {
    const tagsDesc = _.map(item.tags, (v, k) => {
      return `${k}(${v})`;
    }).join(' ');
    option.legend.data.push(tagsDesc);
    pieData.data.push({
      name: tagsDesc,
      value: _.last(item.values)[1],
    });
  });
  return option;
}

export function getBarOption(data, name, setting) {
  const result = _.map(data, util.convertSeriesData);
  const series = _.map(data, item => {
    const tagsDesc = _.map(item.tags, (v, k) => {
      return `${k}(${v})`;
    }).join(' ');
    return {
      name: tagsDesc,
      type: 'bar',
      data: [],
    };
  });

  const dateList = [];
  _.forEach(result, (arr, index) => {
    const values = arr.slice(1);
    _.forEach(values, value => {
      const time = value.shift();
      if (index === 0) {
        dateList.push(time);
      }
      series[index].data.push(value.pop());
    });
  });

  const option = _.extend({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: [],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: dateList,
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: series,
  }, setting);
  return option;
}

export function getGaugeOption(data, name, setting) {
  return _.extend({
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
    },
    toolbox: {
      feature: {
        restore: {},
        saveAsImage: {},
      },
    },
    series: [
      {
        name,
        type: 'gauge',
        detail: {
          formatter: '{value}%',
        },
        data: [
          {
            value: _.round(_.last(_.last(_.last(data).values)), 2),
            name,
          }
        ]
      }
    ],
  });
}
