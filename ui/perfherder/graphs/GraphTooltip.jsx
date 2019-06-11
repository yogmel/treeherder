import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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
    const { selectedDataPoint, closePopup, tooltipContent } = this.props;
    // TODO closePopup not working
    return (
      <div id="graph-tooltip" className={selectedDataPoint ? 'locked' : ''}>
        <div className="body">
          <div>
            <span onClick={closePopup} className="close graphchooser-close">
              <FontAwesomeIcon icon={faTimes} title="close tooltip" />
            </span>
            {/* <p id="tt-series"><span ng-bind="tooltipContent.series.test"/>
              (<span ng-bind="tooltipContent.project.name"/>)</p>
            <p id="tt-series2" class="small"><span ng-bind="tooltipContent.series.platform"/></p> */}
          </div>
        </div>
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
  react2angular(
    GraphTooltip,
    ['tooltipContent', 'selectedDataPoint', 'closePopup'],
    [],
  ),
);

export default GraphTooltip;
