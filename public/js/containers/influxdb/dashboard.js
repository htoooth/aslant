import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import * as _ from 'lodash';
import {
  Checkbox,
} from '@blueprintjs/core';

import {
  CHART_TYPES,
} from '../../constants/common';
import {
  VIEW_INFLUX_DASHBOARDS,
} from '../../constants/urls';
import * as dashboardActions from '../../actions/dashboard';
import * as navigationAction from '../../actions/navigation';

function renderChartType(type) {
  const cls = {
    'pt-icon-standard': true,
  };
  const found = _.find(CHART_TYPES, item => item.type === type);
  if (!found) {
    return null;
  }
  cls[found.icon] = true;
  return (
    <span
      title={found.title}
      className={classnames(cls)}
    />
  );
}


function resortConfigs(configs, selectedItems) {
  const max = configs.length;
  return _.sortBy(configs, (config) => {
    const index = _.indexOf(selectedItems, config._id);
    if (index === -1) {
      return max;
    }
    return index;
  });
}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    const selectedItems = _.get(props, 'dashboard.configs', []);
    this.state = {
      configs: resortConfigs(props.configs.slice(0), selectedItems),
      selectedItems,
    };
    this.group = _.get(props, 'dashboard.group', 'personal');
  }
  componentWillReceiveProps(nextProps) {
    const {
      selectedItems,
    } = this.state;
    this.setState({
      configs: resortConfigs(nextProps.configs.slice(0), selectedItems),
    });
  }
  changeOrder(id, type) {
    const {
      configs,
    } = this.state;
    const index = _.findIndex(configs, item => item._id === id);
    if (index === -1) {
      return;
    }
    const newIndex = type === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex > configs.length) {
      return;
    }

    const changeItem = configs.splice(index, 1)[0];
    configs.splice(newIndex, 0, changeItem);
    this.setState({
      configs: configs.slice(0),
    });
  }
  submit() {
    const {
      showError,
      dispatch,
      dashboard,
    } = this.props;
    const {
      status,
      selectedItems,
      configs,
    } = this.state;
    if (status === 'submitting') {
      return;
    }
    const name = (this.dashboardName.value || '').trim();
    if (!name) {
      showError('dashboard\'s name can not be null');
      return;
    }
    if (!selectedItems.length) {
      showError('At least one influxdb config first');
      return;
    }
    const newConfigs = [];
    _.forEach(configs, (item) => {
      const id = item._id;
      if (_.indexOf(selectedItems, id) !== -1) {
        newConfigs.push(id);
      }
    });
    const data = {
      name,
      desc: (this.dashboardDesc.value || '').trim(),
      configs: newConfigs,
      group: this.group,
    };
    this.setState({
      status: 'submitting',
    });
    let fn = null;
    if (!dashboard) {
      fn = dashboardActions.add(data);
    } else {
      fn = dashboardActions.update(dashboard._id, dashboard.token, data);
    }
    dispatch(fn).then(() => {
      this.setState({
        status: '',
      });
      dispatch(navigationAction.to(VIEW_INFLUX_DASHBOARDS));
    }).catch((err) => {
      this.setState({
        status: '',
      });
      showError(err);
    });
  }
  render() {
    const {
      selectedItems,
      configs,
    } = this.state;
    const arr = _.map(configs, (item, i) => {
      /* eslint no-underscore-dangle:0 */
      const id = item._id;
      const cls = {
        'pt-icon-standard': true,
      };
      const index = _.indexOf(selectedItems, id);
      if (index !== -1) {
        cls['pt-icon-selection'] = true;
      } else {
        cls['pt-icon-circle'] = true;
      }
      const getBtn = (type, disabled) => {
        const anchorCls = {};
        const btnCls = {
          'pt-icon-standard': true,
        };
        if (disabled) {
          anchorCls.disabled = true;
        }
        if (type === 'up') {
          btnCls['pt-icon-arrow-up'] = true;
        } else {
          btnCls['pt-icon-arrow-down'] = true;
        }
        return (
          <a
            href="javascript:;"
            className={classnames(anchorCls)}
            onClick={() => {
              if (disabled) {
                return;
              }
              this.changeOrder(id, type);
            }}
          >
            <span className={classnames(btnCls)} />
          </a>
        );
      };
      return (
        <tr
          key={id}
        >
          <td>
            <a
              href="javascript:;"
              onClick={() => {
                if (index !== -1) {
                  selectedItems.splice(index, 1);
                } else {
                  selectedItems.push(id);
                }
                this.setState({
                  selectedItems,
                });
              }}
            >
              <span className={classnames(cls)} />
            </a>
          </td>
          <td>{item.name}</td>
          <td>{ renderChartType(item.view.type) }</td>
          <td>{item.view.width}</td>
          <td>
            {
              getBtn('up', i === 0)
            }
            {
              getBtn('down', i === configs.length - 1)
            }
          </td>
        </tr>
      );
    });
    const btnText = this.props.dashboard ? 'Update' : 'Add';
    return (
      <div className="influx-dashboard-view">
        <div
          className="pt-control-group save-wrapper"
        >
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-dashboard" />
            <input
              type="text"
              className="pt-input"
              placeholder="Input dashboard's name"
              defaultValue={_.get(this.props, 'dashboard.name', '')}
              ref={(c) => {
                this.dashboardName = c;
              }}
            />
          </div>
          <button
            onClick={() => this.submit()}
            className="pt-button pt-intent-primary save"
          >
            { btnText }
          </button>
        </div>
        <div className="desc-wrapper">
          <Checkbox
            className="pull-left"
            defaultChecked={this.group === '*'}
            style={{
              marginTop: '7px',
            }}
            onChange={() => {
              if (this.group === '*') {
                this.group = 'personal';
              } else {
                this.group = '*';
              }
            }}
          >
            Public
          </Checkbox>
          <div
            style={{
              marginLeft: '80px',
            }}
          >
            <input
              type="text"
              className="pt-input pt-fill"
              placeholder="Input dashboard's description"
              defaultValue={_.get(this.props, 'dashboard.desc', '')}
              ref={(c) => {
                this.dashboardDesc = c;
              }}
            />
          </div>
        </div>
        <table className="table">
          <thead><tr>
            <th>Add</th>
            <th>Name</th>
            <th>Type</th>
            <th>Width</th>
            <th>OP</th>
          </tr></thead>
          <tbody>{ arr }</tbody>
        </table>
      </div>
    );
  }
}

Dashboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  configs: PropTypes.array.isRequired,
  showError: PropTypes.func,
  dashboard: PropTypes.object,
};

export default Dashboard;
