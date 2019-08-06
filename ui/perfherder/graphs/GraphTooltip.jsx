import React from 'react';
import PropTypes from 'prop-types';
// import { Button } from 'reactstrap';

// import { getData, processResponse } from '../../helpers/http';
// import { getApiUrl } from '../../helpers/url';
// import { endpoints } from '../constants';
// import PerfSeriesModel from '../../models/perfSeries';
// import { thPerformanceBranches } from '../../helpers/constants';
import countBy from 'lodash/countBy';

import { displayNumber } from '../helpers';
import { createQueryParams } from '../../helpers/url';

export default class GraphTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { selectedDataPoint, testData } = this.props;
    const signature = selectedDataPoint.datum
      ? selectedDataPoint.datum.signatureId
      : selectedDataPoint.signatureId;

    const testDetails = testData.find(item => item.signatureId === signature);
    const deltaValue = '';
    const deltaPercentValue = '';

    // var phSeries = $scope.seriesList.find(
    //   s => s.signature_id === dataPoint.signatureId);

    // we need the flot data for calculating values/deltas and to know where
    // on the graph to position the tooltip
    const flotIndex = testDetails.data.findIndex(item => item.pushId === selectedDataPoint.pushId);
    // var flotData = {
    //     series: $scope.plot.getData().find(
    //         fs => fs.thSeries.signature_id === dataPoint.signatureId),
    //     pointIndex: flotIndex,
    // };
    // check if there are any points belonging to earlier pushes in this
    // graph -- if so, get the previous push so we can link to a pushlog

    // Note this is the same number as flotIndex
    const firstResultSetIndex = testDetails.resultSetData.indexOf(
      selectedDataPoint.pushId,
    );
    const prevResultSetId =
      firstResultSetIndex > 0
        ? testDetails.resultSetData[firstResultSetIndex - 1]
        : null;

    const retriggerNum = countBy(testDetails.resultSetData, resultSetId =>
      resultSetId === selectedDataPoint.pushId ? 'retrigger' : 'original',
    );

    console.log(firstResultSetIndex, prevResultSetId, retriggerNum, flotIndex)
    const prevFlotDataPointIndex = (flotIndex - 1);
    const flotSeriesData = testDetails.data;

    // const t = flotSeriesData[flotIndex][0];
    // const v = flotSeriesData[flotIndex][1];
    // var v0 = (prevFlotDataPointIndex >= 0) ? flotSeriesData[prevFlotDataPointIndex][1] : v;
    // var dv = v - v0;
    // var dvp = v / v0 - 1;
    // var alertSummary = phSeries.relatedAlertSummaries.find(alertSummary =>
    //     alertSummary.push_id === dataPoint.resultSetId);
    // var alert;
    // if (alertSummary) {
    //     alert = alertSummary.alerts.find(alert =>
    //         alert.series_signature.id === phSeries.id);
    // }
    // const tooltipContent = {
    //     project: $rootScope.repos.find(repo =>
    //                 repo.name === phSeries.repository_name),
    //     revisionUrl: `/#/jobs?repo=${phSeries.repository_name}`,
    //     prevResultSetId: prevResultSetId,
    //     resultSetId: dataPoint.resultSetId,
    //     jobId: dataPoint.jobId,
    //     series: phSeries,
    //     value: Math.round(v * 1000) / 1000,
    //     deltaValue: dv.toFixed(1),
    //     deltaPercentValue: (100 * dvp).toFixed(1),
    //     date: $.plot.formatDate(new Date(t), '%a %b %d, %H:%M:%S'),
    //     retriggers: (retriggerNum.retrigger - 1),
    //     alertSummary: alertSummary,
    //     revisionInfoAvailable: true,
    //     alert: alert,
    // };
    return (
      <div className="body">
        <div>
          <p id="tt-series">({testDetails.project})</p>
          <p id="tt-series2" className="small">
            {testDetails.platform}
          </p>
        </div>
        <div>
          <p id="tt-v">
            {displayNumber(selectedDataPoint.y)}
            <span className="text-muted">
              {testDetails.lowerIsBetter
                ? ' (lower is better)'
                : ' (higher is better)'}
            </span>
          </p>
          <p id="tt-dv" className="small">
            &Delta; {displayNumber(deltaValue)} ({deltaPercentValue}%)
          </p>
        </div>

        <div>
          {/* {testDetails.revision && testDetails.prevRevision && (
            <span>
              <a
                id="tt-cset"
                href={testDetails.pushlogURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {testDetails.revision.slice(0, 13)}
              </a> */}
          {/* {testDetails.jobId && )
                    (
                    <a
                      id="tt-cset"
                      href={`${getJobsUrl({
                        repo: testDetails.project.name,
                        revision: testDetails.revision,
                      })}${createQueryParams({
                        selectedJob: testDetails.jobId,
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
                  originalProject: testDetails.project.name,
                  newProject: testDetails.project.name,
                  originalRevision: testDetails.prevRevision,
                  newRevision: testDetails.revision,
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
              <p ng-if="testDetails.alertSummary">
                <i class="text-warning fas fa-exclamation-circle"></i>
                <a href="perf.html#/alerts?id={{testDetails.alertSummary.id}}">
                  Alert #{{testDetails.alertSummary.id}}</a>
              <span class="text-muted">- {{testDetails.alert && (alertIsOfState(testDetails.alert, phAlertStatusMap.ACKNOWLEDGED) ? getAlertSummarytStatusText(testDetails.alertSummary) : getAlertStatusText(testDetails.alert))}}
                  <span ng-show="testDetails.alert.related_summary_id">
                    <span ng-if="testDetails.alert.related_summary_id !== testDetails.alertSummary.id">
                    to <a href="#/alerts?id={{testDetails.alert.related_summary_id}}" target="_blank" rel="noopener">alert #{{testDetails.alert.related_summary_id}}</a>
                  </span>
                  <span ng-if="testDetails.alert.related_summary_id === testDetails.alertSummary.id">
                    from <a href="#/alerts?id={{testDetails.alert.related_summary_id}}" target="_blank" rel="noopener">alert #{{testDetails.alert.related_summary_id}}</a>
                  </span>
                  </span>
                </span>
              </p>
              <p class="text-muted" ng-if="!testDetails.alertSummary">
                <span ng-if="!creatingAlert">
                  No alert
                  <span ng-if="user.isStaff">
                    (<a href="" ng-click="createAlert(testDetails)" ng-disabled="user.isStaff">create</a>)
                  </span>
                  <span ng-if="!user.isStaff">
                    (log in as a a sheriff to create)
                  </span>
                </span>
                <span ng-if="creatingAlert">
                  Creating alert... <i class="fas fa-spinner fa-pulse" title="creating alert"></i>
                </span>
              </p>
              <p ng-hide="testDetails.revision">
                <span ng-hide="testDetails.revisionInfoAvailable">Revision info unavailable</span>
                <span ng-show="testDetails.revisionInfoAvailable">Loading revision...</span>
              </p>
              <p id="tt-t" class="small" ng-bind="testDetails.date"></p>
              <p id="tt-v" class="small" ng-show="testDetails.retriggers > 0">Retriggers: {{testDetails.retriggers}}</p> */}
        </div>
      </div>
    );
  }
}

GraphTooltip.propTypes = {
  selectedDataPoint: PropTypes.shape({}),
  testData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

GraphTooltip.defaultProps = {
  selectedDataPoint: null,
};
