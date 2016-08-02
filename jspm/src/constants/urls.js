'use strict';
import * as globals from 'aslant/helpers/globals';
const appUrlPrfix = globals.get('CONFIG.appUrlPrefix');

export const HOME = `${appUrlPrfix}/`;

export const LOGIN = `${appUrlPrfix}/login`;

export const REGISTER = `${appUrlPrfix}/register`;

export const ADD_SERVER = `${appUrlPrfix}/servers/add`;

export const SHOW_SERVERS = `${appUrlPrfix}/servers/list`;

export const EDIT_SERVER = `${appUrlPrfix}/servers/edit`;

export const SHOW_VISUALIZATIONS = `${appUrlPrfix}/visualizations`;

export const ADD_VISUALIZATIONS = `${appUrlPrfix}/visualizations/add`;

export const EDIT_VISUALIZATION = `${appUrlPrfix}/visualizations/edit`;

export const SHOW_DASHBOARDS = `${appUrlPrfix}/dashboards`;

export const ADD_DASHBOARD = `${appUrlPrfix}/dashboards/add`;

export const EDIT_DASHBOARD = `${appUrlPrfix}/dashboards/edit`;
