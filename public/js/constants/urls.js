import * as globals from '../helpers/globals';

const appUrlPrfix = globals.get('CONFIG.appUrlPrefix');

export const STATS_STATISTICS = '/api/stats/statistics';
export const STATS_AJAX = '/api/stats/ajax';
export const STATS_EXCEPTION = '/api/stats/exception';

export const USER_ME = '/api/users/me';
export const USER_LOGIN = '/api/users/login';
export const USER_LIKE = '/api/users/like';
export const USER_REGISTER = '/api/users/register';
export const USER_LOGOUT = '/api/users/logout';
export const USER_CHANGE_PASSWORD = '/api/users/update-password';

export const USER_SETTING = '/api/users/me/settings';

export const INFLUXDB_SERVER = '/api/influxdb/servers';
export const INFLUXDB_DATABASES = '/api/influxdb/server/:id/dbs';
export const INFLUXDB_RPS = '/api/influxdb/server/:id/:db/rps';
export const INFLUXDB_MEASUREMENTS = '/api/influxdb/server/:id/:db/measurements';
export const INFLUXDB_TAG_KEYS = '/api/influxdb/server/:id/:db/:measurement/tag-keys';
export const INFLUXDB_FIELD_KEYS = '/api/influxdb/server/:id/:db/:measurement/field-keys';
export const INFLUXDB_SERIES = '/api/influxdb/server/:id/:db/:measurement/series';
export const INFLUXDB_SELECT = '/api/influxdb/select/:id/:db/:measurement';
export const INFLUXDB_QUERY = '/api/influxdb/query/:id/:db';
export const INFLUXDB_CONFIGS = '/api/influxdb/configs';
export const INFLUXDB_DASHBOARDS = '/api/influxdb/dashboards';

export const VIEW_HOME = `${appUrlPrfix}/`;
export const VIEW_LOGIN = `${appUrlPrfix}/login`;
export const VIEW_REGISTER = `${appUrlPrfix}/register`;
export const VIEW_SETTING = `${appUrlPrfix}/setting`;
export const VIEW_ACCOUNT = `${appUrlPrfix}/account`;
export const VIEW_CHANGE_PASSWORD = `${appUrlPrfix}/change-password`;

export const VIEW_ADD_SERVER = `${appUrlPrfix}/influxdb/servers/add`;
export const VIEW_EDIT_SERVER = `${appUrlPrfix}/influxdb/servers/:id`;
export const VIEW_SERVERS = `${appUrlPrfix}/influxdb/servers`;
export const VIEW_SERVER_STATUS = `${appUrlPrfix}/influxdb/servers/:id/status`;

export const VIEW_ADD_INFLUX = `${appUrlPrfix}/influxdb/configs/add`;
export const VIEW_INFLUX_CONFIGS = `${appUrlPrfix}/influxdb/configs`;
export const VIEW_EDIT_INFLUX = `${appUrlPrfix}/influxdb/configs/:id`;
export const VIEW_INFLUX_VISUALIZATION = `${appUrlPrfix}/influxdb/visualizations/:id`;
export const VIEW_ADD_DASHBOARD = `${appUrlPrfix}/influxdb/dashboards/add`;
export const VIEW_INFLUX_DASHBOARDS = `${appUrlPrfix}/influxdb/dashboards`;
export const VIEW_INFLUX_EDIT_DASHBOARD = `${appUrlPrfix}/influxdb/dashboards/:id`;
export const VIEW_INFLUX_DASHBOARD = `${appUrlPrfix}/influxdb/dashboard/:id/visualizations`;

export const VIEW_ABOUT = `${appUrlPrfix}/about`;
