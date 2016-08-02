'use strict';
import {
  SERVER_ADD,
  SERVER_LIST,
  SERVER_EDIT,
  SERVER_REMOVE,
  INFLUXDB_LIST_DATABASE,
  INFLUXDB_LIST_RP,
  INFLUXDB_LIST_MEASUREMENT,
  INFLUXDB_LIST_TAG_INFO,
  INFLUXDB_LIST_FIELDS,
} from 'aslant/constants/action-types';
import * as _ from 'lodash';

const initStates = {
  list: [],
  databases: {},
  rps: {},
  measurements: {},
  tagInfos: {},
  fields: {},
};

export default function influxdbServer(state = initStates, action) {
  let list = _.map(state.list, item => Object.assign({}, item));
  switch (action.type) {
    case SERVER_ADD:
      list.push(action.server);
      return Object.assign({}, state, {
        list,
      });
    case SERVER_LIST:
      list = action.servers.slice(0);
      return Object.assign({}, state, {
        list,
      });
    case SERVER_EDIT: {
      const server = action.server;
      /* eslint no-underscore-dangle:0 */
      const index = _.findIndex(list, item => item._id === server._id);
      if (~index) {
        list[index] = Object.assign({}, server);
      }
      return Object.assign({}, state, {
        list,
      });
    }
    case SERVER_REMOVE: {
      /* eslint no-underscore-dangle:0 */
      const index = _.findIndex(list, item => item._id === action.id);
      if (~index) {
        list.splice(index, 1);
      }
      return Object.assign({}, state, {
        list,
      });
    }
    case INFLUXDB_LIST_DATABASE: {
      const databases = Object.assign({}, state.databases);
      databases[action.id] = action.databases.slice(0);
      return Object.assign({}, state, {
        databases,
      });
    }
    case INFLUXDB_LIST_RP: {
      const rps = Object.assign({}, state.rps);
      rps[action.id + action.database] = action.rps.slice(0);
      return Object.assign({}, state, {
        rps,
      });
    }
    case INFLUXDB_LIST_MEASUREMENT: {
      const measurements = Object.assign({}, state.measurements);
      measurements[action.id + action.database] = action.measurements.slice(0);
      return Object.assign({}, state, {
        measurements,
      });
    }
    case INFLUXDB_LIST_TAG_INFO: {
      const tagInfos = Object.assign({}, state.tagInfos);
      tagInfos[action.id + action.database + action.measurement] = action.tagInfos.slice(0);
      return Object.assign({}, state, {
        tagInfos,
      });
    }
    case INFLUXDB_LIST_FIELDS: {
      const fields = Object.assign({}, state.fields);
      fields[action.id + action.database + action.measurement] = action.fields.slice(0);
      return Object.assign({}, state, {
        fields,
      });
    }
    default:
      return state;
  }
}
