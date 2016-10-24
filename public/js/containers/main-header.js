import React, { PropTypes, Component } from 'react';

import {
  VIEW_HOME,
  VIEW_LOGIN,
  VIEW_REGISTER,
  VIEW_SETTING,
  VIEW_ACCOUNT,
  VIEW_ADD_SERVER,
  VIEW_SERVERS,
} from '../constants/urls';
import * as userAction from '../actions/user';
import * as navigationAction from '../actions/navigation';
import Dropdown from '../components/dropdown';

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUserNav: false,
    };
  }
  renderUserInfo() {
    const {
      user,
      isFetchingUserInfo,
      dispatch,
      handleLink,
    } = this.props;
    const {
      showUserNav,
    } = this.state;
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
            className="btn"
            href={VIEW_LOGIN}
            onClick={handleLink(VIEW_LOGIN)}
          >Sign In</a>
          <a
            className="btn btn-primary"
            href={VIEW_REGISTER}
            onClick={handleLink(VIEW_REGISTER)}
          >Sign Up</a>
        </div>
      );
    }
    const userNavItems = [
      {
        name: `Signed in as ${user.account}`,
        type: 'label',
      },
      {
        type: 'divider',
      },
      {
        name: 'Add Server',
        action: 'redirect',
        href: VIEW_ADD_SERVER,
      },
      {
        name: 'Servers',
        action: 'redirect',
        href: VIEW_SERVERS,
      },
      {
        name: 'Help',
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
    const onSelect = (e, item) => {
      e.preventDefault();
      if (item.action === 'redirect') {
        dispatch(navigationAction.to(item.href));
      } else if (item.action === 'logout') {
        dispatch(userAction.logout());
      }
      this.setState({
        showUserNav: false,
      });
    };
    return (
      <ul>
        <li className="account">
          <a
            onClick={(e) => {
              e.preventDefault();
              this.setState({
                showUserNav: !showUserNav,
              });
            }}
            href={VIEW_ACCOUNT}
          >
            {user.account}
          </a>
          { showUserNav &&
            <Dropdown
              items={userNavItems}
              cls={{
                sw: true,
              }}
              onSelect={onSelect}
            />
          }
        </li>
      </ul>
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
