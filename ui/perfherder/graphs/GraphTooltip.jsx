import React from 'react';
import PropTypes from 'prop-types';
// import { Button } from 'reactstrap';

// import { getData, processResponse } from '../../helpers/http';
// import { getApiUrl } from '../../helpers/url';
// import { endpoints } from '../constants';
// import PerfSeriesModel from '../../models/perfSeries';
// import { thPerformanceBranches } from '../../helpers/constants';
import { displayNumber } from '../helpers';
import { createQueryParams } from '../../helpers/url';

export class GraphTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { selectedDataPoint, testData } = this.props;
    const signature = selectedDataPoint.datum
      ? selectedDataPoint.datum.signatureId
      : selectedDataPoint.signatureId;
    console.log(signature);
    const testDetails = testData.find(item => item.signatureId === signature);
    console.log(selectedDataPoint, testDetails);
    return (
      <div className="body">
        {/* <div>
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

        <div>
          {tooltipContent.revision && tooltipContent.prevRevision && (
            <span>
              <a
                id="tt-cset"
                href={tooltipContent.pushlogURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tooltipContent.revision.slice(0, 13)}
              </a> */}
        {/* {tooltipContent.jobId && )
                    (
                    <a
                      id="tt-cset"
                      href={`${getJobsUrl({
                        repo: tooltipContent.project.name,
                        revision: tooltipContent.revision,
                      })}${createQueryParams({
                        selectedJob: tooltipContent.jobId,
                        group_state: 'expanded',
                      })}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      job
                    </a>)} */}
        {/* ,{' '}
              <a
                href={`#/comparesubtest${createQueryParams({
                  originalProject: tooltipContent.project.name,
                  newProject: tooltipContent.project.name,
                  originalRevision: tooltipContent.prevRevision,
                  newRevision: tooltipContent.revision,
                  originalSignature: selectedDataPoint.signatureId,
                  newSignature: selectedDataPoint.signatureId,
                  framework: selectedDataPoint.frameworkId,
                })}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                compare
              </a>
              )
            </span>
          )} */}
        {/*
                
              </p>
              <p ng-if="tooltipContent.alertSummary">
                <i class="text-warning fas fa-exclamation-circle"></i>
                <a href="perf.html#/alerts?id={{tooltipContent.alertSummary.id}}">
                  Alert #{{tooltipContent.alertSummary.id}}</a>
              <span class="text-muted">- {{tooltipContent.alert && (alertIsOfState(tooltipContent.alert, phAlertStatusMap.ACKNOWLEDGED) ? getAlertSummarytStatusText(tooltipContent.alertSummary) : getAlertStatusText(tooltipContent.alert))}}
                  <span ng-show="tooltipContent.alert.related_summary_id">
                    <span ng-if="tooltipContent.alert.related_summary_id !== tooltipContent.alertSummary.id">
                    to <a href="#/alerts?id={{tooltipContent.alert.related_summary_id}}" target="_blank" rel="noopener">alert #{{tooltipContent.alert.related_summary_id}}</a>
                  </span>
                  <span ng-if="tooltipContent.alert.related_summary_id === tooltipContent.alertSummary.id">
                    from <a href="#/alerts?id={{tooltipContent.alert.related_summary_id}}" target="_blank" rel="noopener">alert #{{tooltipContent.alert.related_summary_id}}</a>
                  </span>
                  </span>
                </span>
              </p>
              <p class="text-muted" ng-if="!tooltipContent.alertSummary">
                <span ng-if="!creatingAlert">
                  No alert
                  <span ng-if="user.isStaff">
                    (<a href="" ng-click="createAlert(tooltipContent)" ng-disabled="user.isStaff">create</a>)
                  </span>
                  <span ng-if="!user.isStaff">
                    (log in as a a sheriff to create)
                  </span>
                </span>
                <span ng-if="creatingAlert">
                  Creating alert... <i class="fas fa-spinner fa-pulse" title="creating alert"></i>
                </span>
              </p>
              <p ng-hide="tooltipContent.revision">
                <span ng-hide="tooltipContent.revisionInfoAvailable">Revision info unavailable</span>
                <span ng-show="tooltipContent.revisionInfoAvailable">Loading revision...</span>
              </p>
              <p id="tt-t" class="small" ng-bind="tooltipContent.date"></p>
              <p id="tt-v" class="small" ng-show="tooltipContent.retriggers > 0">Retriggers: {{tooltipContent.retriggers}}</p> */}
        {/* </div> */}
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

export default GraphTooltip;
