import React, { Component, PropTypes } from 'react';
import { Router, Route } from 'react-enroute';
import * as ReactRedux from 'react-redux';
import * as _ from 'lodash';
import {
  Toaster,
  FocusStyleManager,
  Alert,
} from '@blueprintjs/core';

import * as globals from '../helpers/globals';

import {
  VIEW_LOGIN,
  VIEW_REGISTER,
  VIEW_ADD_SERVER,
  VIEW_EDIT_SERVER,
  VIEW_SERVERS,
  VIEW_SERVER_STATUS,
  VIEW_ADD_INFLUX,
  VIEW_EDIT_INFLUX,
  VIEW_INFLUX_CONFIGS,
} from '../constants/urls';

import Login from './login';
import Register from './register';
import MainHeader from './main-header';
import ServerView from './influxdb/server';
import ServersView from './influxdb/servers';
import ServerStatusView from './influxdb/status';
import InfluxView from './influxdb/influx';
import InfluxConfigsView from './influxdb/configs';

import * as navigationAction from '../actions/navigation';
import * as userAction from '../actions/user';
import * as influxdbAction from '../actions/influxdb';
import * as serverActions from '../actions/server';

class App extends Component {
  constructor(props) {
    super(props);
    FocusStyleManager.onlyShowFocusOnTabs();
    const dispatch = props.dispatch;
    globals.set('onpopstate', () => {
      dispatch(navigationAction.back());
    });
    this.state = {
      isFetchingUserInfo: true,
      confirmDialogConfig: {
        shown: false,
        content: '',
        title: '',
        handler: null,
      },
    };
    dispatch(userAction.me()).then(() => {
      this.setState({
        isFetchingUserInfo: false,
      });
    }).catch((err) => {
      this.setState({
        isFetchingUserInfo: false,
      });
      this.showError(err.response.body.message);
    });
    this.handleLink = this.handleLink.bind(this);
    this.showError = this.showError.bind(this);
    this.alert = this.alert.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const {
      dispatch,
    } = this.props;
    const currentAccount = _.get(this.props, 'user.account');
    const nextAccount = _.get(nextProps, 'user.account');
    if (currentAccount !== nextAccount) {
      if (nextAccount) {
        dispatch(influxdbAction.listConfig()).catch((err) => {
          this.showError(err.response.body.message);
        });
        dispatch(serverActions.list()).catch((err) => {
          this.showError(err.response.body.message);
        });
      } else {
        dispatch(serverActions.reset());
        dispatch(navigationAction.home());
      }
    }
  }
  alert(content, cb) {
    this.setState({
      alert: {
        content,
        cb,
      },
    });
  }
  showError(err) {
    let message = err;
    if (_.isObject(err)) {
      message = _.get(err, 'response.body.message', err.message);
    }
    this.toaster.show({
      message,
      className: 'pt-intent-warning',
    });
  }
  handleLink(url) {
    const {
      dispatch,
    } = this.props;
    return (e) => {
      e.preventDefault();
      dispatch(navigationAction.to(url));
    };
  }
  renderAlert() {
    const {
      alert,
    } = this.state;
    if (!alert) {
      return null;
    }
    const {
      content,
      cb,
    } = alert;
    const fn = (type) => {
      this.setState({
        alert: null,
      });
      cb(type);
    };
    return (
      <Alert
        isOpen
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
        onConfirm={() => fn('confirm')}
        onCancel={() => fn('cancel')}
      >
        <p>{ content }</p>
      </Alert>
    );
  }
  renderAddInflux() {
    const {
      dispatch,
      servers,
    } = this.props;
    const result = _.sortBy(servers, item => item.name);
    if (!result.length) {
      return null;
    }
    return (
      <InfluxView
        dispatch={dispatch}
        servers={result}
      />
    );
  }
  renderAddServer() {
    const {
      dispatch,
    } = this.props;
    return (
      <ServerView
        dispatch={dispatch}
      />
    );
  }
  renderEditInflux({ params: { id } }) {
    const {
      dispatch,
      servers,
    } = this.props;
    const result = _.sortBy(servers, item => item.name);
    if (!result.length) {
      return null;
    }
    return (
      <InfluxView
        dispatch={dispatch}
        servers={result}
        id={id}
      />
    );
  }
  renderEditServer({ params: { id } }) {
    const {
      dispatch,
      servers,
    } = this.props;
    /* eslint no-underscore-dangle:0 */
    const result = _.find(servers, item => item._id === id);
    if (!result) {
      return null;
    }
    return (
      <ServerView
        dispatch={dispatch}
        server={result}
      />
    );
  }
  renderInfluxConfigs() {
    const {
      dispatch,
      influxdb,
    } = this.props;
    return (
      <InfluxConfigsView
        dispatch={dispatch}
        configs={influxdb.configs}
        handleLink={this.handleLink}
      />
    );
  }
  renderLogin() {
    const { dispatch } = this.props;
    return (
      <Login
        dispatch={dispatch}
      />
    );
  }
  renderRegister() {
    const { dispatch } = this.props;
    return (
      <Register
        dispatch={dispatch}
      />
    );
  }
  renderServers() {
    const {
      dispatch,
      servers,
    } = this.props;
    return (
      <ServersView
        dispatch={dispatch}
        servers={servers}
        handleLink={this.handleLink}
      />
    );
  }
  renderServerStatus({ params: { id } }) {
    const {
      dispatch,
    } = this.props;
    return (
      <ServerStatusView
        dispatch={dispatch}
        showError={this.showError}
        alert={this.alert}
        id={id}
      />
    );
  }
  render() {
    const {
      isFetchingUserInfo,
    } = this.state;
    const {
      user,
      navigation,
      dispatch,
    } = this.props;
    const handleLink = this.handleLink;
    return (
      <div className="fix-height">
        <MainHeader
          user={user}
          isFetchingUserInfo={isFetchingUserInfo}
          handleLink={handleLink}
          dispatch={dispatch}
        />
        <div className="content-wrapper">
          <Router {...navigation}>
            <Route
              path={VIEW_LOGIN}
              component={() => this.renderLogin()}
            />
            <Route
              path={VIEW_REGISTER}
              component={() => this.renderRegister()}
            />
            <Route
              path={VIEW_ADD_SERVER}
              component={() => this.renderAddServer()}
            />
            <Route
              path={VIEW_EDIT_SERVER}
              component={arg => this.renderEditServer(arg)}
            />
            <Route
              path={VIEW_SERVERS}
              component={() => this.renderServers()}
            />
            <Route
              path={VIEW_SERVER_STATUS}
              component={arg => this.renderServerStatus(arg)}
            />
            <Route
              path={VIEW_ADD_INFLUX}
              component={() => this.renderAddInflux()}
            />
            <Route
              path={VIEW_EDIT_INFLUX}
              component={arg => this.renderEditInflux(arg)}
            />
            <Route
              path={VIEW_INFLUX_CONFIGS}
              component={() => this.renderInfluxConfigs()}
            />
          </Router>
        </div>
        <Toaster
          ref={(c) => {
            this.toaster = c;
          }}
        />
        {
          this.renderAlert()
        }
      </div>
    );
  }
}

App.propTypes = {
  user: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  influxdb: PropTypes.object.isRequired,
  servers: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user,
    navigation: state.navigation,
    influxdb: state.influxdb,
    servers: state.server,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
