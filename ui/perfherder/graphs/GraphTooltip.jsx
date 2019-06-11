import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
// import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import perf from '../../js/perf';
// import { getData, processResponse } from '../../helpers/http';
// import { getApiUrl } from '../../helpers/url';
// import { endpoints } from '../constants';
// import PerfSeriesModel from '../../models/perfSeries';
// import { thPerformanceBranches } from '../../helpers/constants';
import { displayNumber } from '../helpers';

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
        {tooltipContent && (
          <div className="body">
            <div>
              <span onClick={closePopup} className="close graphchooser-close">
                <FontAwesomeIcon icon={faTimes} title="close tooltip" />
              </span>
              <p id="tt-series">
                {tooltipContent.series.test} ({tooltipContent.project.name})
              </p>
              <p id="tt-series2" className="small">
                {tooltipContent.series.platform}
              </p>
            </div>
            <div>
              <p id="tt-v">
                {displayNumber(tooltipContent.value)}
                <span className="text-muted">
                  {tooltipContent.series.lowerIsBetter
                    ? ' (lower is better)'
                    : ' (higher is better)'}
                </span>
              </p>
              <p id="tt-dv" className="small">
                &Delta; {displayNumber(tooltipContent.deltaValue)} (
                {tooltipContent.deltaPercentValue}%)
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

GraphTooltip.propTypes = {
  selectedDataPoint: PropTypes.shape({}),
  tooltipContent: PropTypes.shape({}),
};

GraphTooltip.defaultProps = {
  selectedDataPoint: null,
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
