import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
// import { UncontrolledTooltip } from 'reactstrap';

import perf from '../../js/perf';
// import { getData, processResponse } from '../../helpers/http';
// import { getApiUrl } from '../../helpers/url';
// import { endpoints } from '../constants';
// import PerfSeriesModel from '../../models/perfSeries';
// import { thPerformanceBranches } from '../../helpers/constants';
// import { containsText } from '../helpers';

export class GraphTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { selectedDataPoint } = this.props;
    return (
      <div id="graph-tooltip" className={selectedDataPoint ? 'locked' : ''}>
        <div className="body" />
      </div>
    );
  }
}

GraphTooltip.propTypes = {
  selectedDataPoint: PropTypes.shape({}).isRequired,
  tooltipContent: PropTypes.shape({}),
};

GraphTooltip.defaultProps = {
  tooltipContent: undefined,
};

perf.component(
  'graphTooltip',
  react2angular(GraphTooltip, ['tooltipContent', 'selectedDataPoint'], []),
);

export default GraphTooltip;
