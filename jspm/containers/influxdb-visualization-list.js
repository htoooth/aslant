'use strict';
/* eslint import/no-unresolved:0 */
import React, { PropTypes, Component } from 'react';
import PuzzleList from '../components/puzzle-list';
import * as navigationAction from '../actions/navigation';
import * as configureAction from '../actions/configure';

class InfluxdbVisualizationList extends Component {
  render() {
    const { dispatch, configures } = this.props;
    return (
      <PuzzleList
        className="influxdbVisualizationList"
        add={() => dispatch(navigationAction.addVisualization())}
        remove={id => dispatch(configureAction.remove(id))}
        edit={id => dispatch(navigationAction.editVisualization(id))}
        show={id => dispatch(navigationAction.showVisualization(id))}
        items={configures}
      />
    );
  }
}

export default InfluxdbVisualizationList;
