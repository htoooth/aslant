'use strict';
import {
  LOCATION,
  LOCATION_BACK,
} from '../constants/action-types';

import * as urls from '../constants/urls';

export function to(path) {
  return dispatch => {
    dispatch({
      type: LOCATION,
      path,
    });
  };
}

export function register() {
  return to(urls.REGISTER);
}

export function home() {
  return to(urls.HOME);
}

export function login() {
  return to(urls.LOGIN);
}

export function addServer() {
  return to(urls.ADD_SERVER);
}

export function showServers() {
  return to(urls.SHOW_SERVERS);
}

export function back() {
  return dispatch => {
    dispatch({
      type: LOCATION_BACK,
    });
  };
}

export function editServer(id) {
  return to(`${urls.EDIT_SERVER}/${id}`);
}
