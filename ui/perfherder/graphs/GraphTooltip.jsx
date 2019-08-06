import React from 'react';
import PropTypes from 'prop-types';

import countBy from 'lodash/countBy';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import { alertStatusMap } from '../constants';
import { getJobsUrl, createQueryParams } from '../../helpers/url';
import RepositoryModel from '../../models/repository';
import { displayNumber, getStatus } from '../helpers';

const GraphTooltip = ({ selectedDataPoint, testData }) => {
  // we either have partial information provided by the selected
  // query parameter or the full selectedDataPoint object provided from the
  // graph library
  const datum = selectedDataPoint.datum
    ? selectedDataPoint.datum
    : selectedDataPoint;

  const testDetails = testData.find(
    item => item.signatureId === datum.signatureId,
  );

  const flotIndex = testDetails.data.findIndex(
    item => item.pushId === datum.pushId,
  );
  const dataPointDetails = testDetails.data[flotIndex];

  const retriggerNum = countBy(testDetails.resultSetData, resultSetId =>
    resultSetId === selectedDataPoint.pushId ? 'retrigger' : 'original',
  );
  const prevFlotDataPointIndex = flotIndex - 1;

  const date = dataPointDetails.x;
  const value = dataPointDetails.y;
  //     value: Math.round(v * 1000) / 1000,
  const v0 =
    prevFlotDataPointIndex >= 0
      ? testDetails.data[prevFlotDataPointIndex].y
      : value;
  const deltaValue = value - v0;
  const deltaPercent = value / v0 - 1;
  let alert;
  if (dataPointDetails.alertSummary && dataPointDetails.alertSummary.alerts) {
    alert = dataPointDetails.alertSummary.alerts.find(
      alert => alert.series_signature.id === testDetails.signatureId,
    );
  }

  const alertStatus =
    alert && alert.status === alertStatusMap.acknowledged
      ? getStatus(testDetails.alertSummary.status)
      : getStatus(alert.status, alertStatusMap);

  const revisionUrl = `/#/jobs?repo=${testDetails.project}`;
  const prevRevision = testDetails.data[prevFlotDataPointIndex].revision;
  //     resultSetId: dataPoint.resultSetId,
  //     jobId: dataPoint.jobId,
  //     series: phSeries,
  //     date: $.plot.formatDate(new Date(t), '%a %b %d, %H:%M:%S'),
  //     retriggers: (retriggerNum.retrigger - 1),
  //     alertSummary: alertSummary,
  //     revisionInfoAvailable: true,
  //     alert: alert,
  // };
  const repoModel = new RepositoryModel(testDetails.project);

  const pushLogUrl = repoModel.getPushLogRangeHref({
    fromchange: prevRevision,
    tochange: dataPointDetails.revision,
  });

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
          {displayNumber(value)}
          <span className="text-muted">
            {testDetails.lowerIsBetter
              ? ' (lower is better)'
              : ' (higher is better)'}
          </span>
        </p>
        <p id="tt-dv" className="small">
          &Delta; {displayNumber(deltaValue.toFixed(1))} (
          {(100 * deltaPercent).toFixed(1)}%)
        </p>
      </div>

      <div>
        {prevRevision && (
          <span>
            <a
              id="tt-cset"
              href={pushLogUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dataPointDetails.revision.slice(0, 13)}
            </a>
            {dataPointDetails.jobId && (
              <a
                id="tt-cset"
                href={`${getJobsUrl({
                  repo: testDetails.project,
                  revision: dataPointDetails.revision,
                })}${createQueryParams({
                  selectedJob: dataPointDetails.jobId,
                  group_state: 'expanded',
                })}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                (job
              </a>
            )}
            ,{' '}
            <a
              href={`#/comparesubtest${createQueryParams({
                originalProject: testDetails.project,
                newProject: testDetails.project,
                originalRevision: prevRevision,
                newRevision: dataPointDetails.revision,
                originalSignature: testDetails.signatureId,
                newSignature: testDetails.signatureId,
                framework: testDetails.frameworkId,
              })}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              compare
            </a>
            )
          </span>
        )}
        {dataPointDetails.alertSummary && (
          <p>
            <a
              href={`perf.html#/alerts?id=${dataPointDetails.alertSummary.id}`}
            >
              <FontAwesomeIcon
                className="text-warning"
                icon={faExclamationCircle}
                size="sm"
              />
              {` Alert # ${dataPointDetails.alertSummary.id}`}
            </a>
            <span className="text-muted">
              {` - ${alertStatus} `}
              {alert.related_summary_id && (
                <span>
                  {alert.related_summary_id !== dataPointDetails.alertSummary.id
                    ? 'to'
                    : 'from'}
                  <a
                    href={`#/alerts?id=${alert.related_summary_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >{` alert # ${alert.related_summary_id}`}</a>
                </span>
              )}
            </span>
          </p>
        )}
        {/*
                
              <p ng-if="testDetails.alertSummary">
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
};

GraphTooltip.propTypes = {
  selectedDataPoint: PropTypes.shape({}),
  testData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

GraphTooltip.defaultProps = {
  selectedDataPoint: null,
};

export default GraphTooltip;
