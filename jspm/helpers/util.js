'use strict';
/* eslint  import/no-unresolved:0 */
import * as _ from 'lodash';
import moment from 'moment';
import QL from 'influx-ql';

export function getError(err) {
  return _.get(err, 'response.body.message', err.message);
}

export function convertSeriesData(data) {
  const columns = data.columns.slice(0);
  const timeIndex = _.indexOf(columns, 'time');
  const arr = _.map(data.values, value => {
    const tmpArr = value.slice(0);
    if (~timeIndex) {
      tmpArr[timeIndex] = moment(tmpArr[timeIndex]).format('YYYY-MM-DD HH:mm:ss');
    }
    return tmpArr;
  });
  arr.unshift(columns);
  return arr;
}

export function getInfluxQL(options) {
  const ql = new QL();
  ql.measurement = options.measurement;
  _.forEach(options.extracts, item => {
    if (item.key && item.value) {
      ql.addCalculate(item.value, item.key);
    }
  });
  const conditions = {};
  _.forEach(options.conditions, item => {
    if (!item.value) {
      return;
    }
    const tag = item.key;
    if (conditions[tag]) {
      if (!_.isArray(conditions[tag])) {
        conditions[tag] = [conditions[tag]];
      }
      conditions[tag].push(item.value);
    } else {
      conditions[tag] = item.value;
    }
  });
  _.forEach(['start', 'end'], key => {
    const date = options.date[key];
    if (date) {
      ql[key] = moment(date, 'YYYY-MM-DD HH:mm:ss').toISOString();
    }
  });
  ql.condition(conditions);
  return ql.toSelect();
}
