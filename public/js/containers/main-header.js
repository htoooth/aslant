import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import {
  Menu,
  MenuItem,
  MenuDivider,
  Popover,
  Position,
  Toaster,
} from '@blueprintjs/core';

import {
  VIEW_HOME,
  VIEW_LOGIN,
  VIEW_REGISTER,
  VIEW_SETTING,
  VIEW_ADD_SERVER,
  VIEW_SERVERS,
  VIEW_ADD_INFLUX,
  VIEW_INFLUX_CONFIGS,
} from '../constants/urls';
import * as userAction from '../actions/user';
import * as navigationAction from '../actions/navigation';

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  showError(message) {
    this.toaster.show({
      message,
      className: 'pt-intent-warning',
    });
  }
  renderUserInfo() {
    const {
      user,
      isFetchingUserInfo,
      handleLink,
    } = this.props;
    if (isFetchingUserInfo) {
      return (
        <span>
          <i className="fa fa-spinner" aria-hidden="true" />
          <span>Fetching...</span>
        </span>
      );
    }
    if (!user || !user.account) {
      return (
        <div className="functions">
          <a
            className="pt-button"
            href={VIEW_LOGIN}
            onClick={handleLink(VIEW_LOGIN)}
          >Sign In</a>
          <a
            className="pt-button pt-intent-primary"
            href={VIEW_REGISTER}
            onClick={handleLink(VIEW_REGISTER)}
          >Sign Up</a>
        </div>
      );
    }
    const userNavItems = [
      {
        icon: 'pt-icon-add-to-artifact',
        name: 'Add Influx Config',
        action: 'redirect',
        href: VIEW_ADD_INFLUX,
      },
      {
        icon: 'pt-icon-horizontal-bar-chart',
        name: 'Influx Configs',
        action: 'redirect',
        href: VIEW_INFLUX_CONFIGS,
      },
      {
        icon: 'pt-icon-add',
        name: 'Add Server',
        action: 'redirect',
        href: VIEW_ADD_SERVER,
      },
      {
        icon: 'pt-icon-duplicate',
        name: 'Servers',
        action: 'redirect',
        href: VIEW_SERVERS,
      },
      {
        type: 'divider',
      },
      {
        name: 'Settings',
        action: 'setting',
        href: VIEW_SETTING,
      },
      {
        name: 'Sign out',
        action: 'logout',
      },
      {
        name: 'Token',
        action: 'showToken',
      },
    ];
    return (
      <ul>
        <li className="account">
          <Popover
            content={this.renderMenu(userNavItems)}
            position={Position.BOTTOM_RIGHT}
          >
            <a
              href="javascript:;"
            >
              <span className="pt-icon-standard pt-icon-user mright5" />
              { user.account }
            </a>
          </Popover>
        </li>
      </ul>
    );
  }
  renderMenu(items) {
    const {
      dispatch,
    } = this.props;
    const onSelect = (e, item) => {
      e.preventDefault();
      if (item.action === 'redirect') {
        dispatch(navigationAction.to(item.href));
      } else if (item.action === 'logout') {
        dispatch(userAction.logout()).catch((err) => {
          this.showError(err.response.body.message);
        });
      }
    };
    const arr = _.map(items, (item, index) => {
      if (item.type === 'divider') {
        return (
          <MenuDivider
            key={index}
          />
        );
      }
      return (
        <MenuItem
          iconName={item.icon}
          key={index}
          text={item.name}
          onClick={e => onSelect(e, item)}
        />
      );
    });
    return (
      <Menu
        className="functions pt-elevation-1"
      >
        { arr }
      </Menu>
    );
  }
  render() {
    const {
      handleLink,
    } = this.props;
    return (
      <header
        className="main-header"
      >
        <a
          href={VIEW_HOME}
          onClick={handleLink(VIEW_HOME)}
        >Aslant</a>
        <div
          className="pull-right user-infos"
        >
          { this.renderUserInfo() }
        </div>
        <Toaster
          ref={(c) => {
            this.toaster = c;
          }}
        />
      </header>
    );
  }
}

MainHeader.propTypes = {
  user: PropTypes.object.isRequired,
  isFetchingUserInfo: PropTypes.bool.isRequired,
  handleLink: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default MainHeader;
