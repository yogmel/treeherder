import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import { Container } from 'reactstrap';

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
    return <Container fluid />;
  }
}

GraphTooltip.propTypes = {};

// GraphTooltip.defaultProps = {
// };

perf.component('graphTooltip', react2angular(GraphTooltip, [], []));

export default GraphTooltip;
