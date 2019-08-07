import React from 'react';
import PropTypes from 'prop-types';
import countBy from 'lodash/countBy';
import moment from 'moment';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import { alertStatusMap, endpoints } from '../constants';
import { getJobsUrl, createQueryParams, getApiUrl } from '../../helpers/url';
import { create } from '../../helpers/http';
import RepositoryModel from '../../models/repository';
import { displayNumber, getStatus } from '../helpers';

const GraphTooltip = ({ selectedDataPoint, testData, user, updateData }) => {
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
  let alertStatus;

  if (dataPointDetails.alertSummary && dataPointDetails.alertSummary.alerts) {
    alert = dataPointDetails.alertSummary.alerts.find(
      alert => alert.series_signature.id === testDetails.signatureId,
    );
  }

  if (alert) {
    alertStatus =
      alert.status === alertStatusMap.acknowledged
        ? getStatus(testDetails.alertSummary.status)
        : getStatus(alert.status, alertStatusMap);
  }

  const revisionUrl = `/#/jobs?repo=${testDetails.project}`;
  const prevRevision = testDetails.data[prevFlotDataPointIndex].revision;
  const prevPushId = testDetails.data[prevFlotDataPointIndex].pushId;
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

  // TODO this is broken
  const pushLogUrl = repoModel.getPushLogRangeHref({
    fromchange: prevRevision,
    tochange: dataPointDetails.revision,
  });

  // TODO refactor create to use getData wrapper
  const createAlert = () =>
    create(getApiUrl(endpoints.alertSummary), {
      repository_id: testDetails.projectId,
      framework_id: testDetails.frameworkId,
      push_id: dataPointDetails.pushId,
      prev_push_id: prevPushId,
    })
      .then(response => response.json())
      .then(response => {
        const newAlertSummaryId = response.alert_summary_id;
        return create(getApiUrl('/performance/alert/'), {
          summary_id: newAlertSummaryId,
          signature_id: testDetails.signatureId,
        }).then(() =>
          updateData(
            testDetails.signatureId,
            testDetails.projectId,
            newAlertSummaryId,
            flotIndex,
          ),
        );
      });

  //   function refreshGraphData(alertSummaryId, dataPoint) {
  //     return getAlertSummaries({
  //         signatureId: dataPoint.series.id,
  //         repository: dataPoint.project.id,
  //     }).then(function (alertSummaryData) {
  //         var alertSummary = alertSummaryData.results.find(result =>
  //             result.id === alertSummaryId);
  //         $scope.tooltipContent.alertSummary = alertSummary;

  //         dataPoint.series.relatedAlertSummaries = alertSummaryData.results;
  //         plotGraph();
  //     });
  // }

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
        {dataPointDetails.alertSummary ? (
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
        ) : (
          <p className="text-muted">
            {/* {!creatingAlert && <span>No alert<span>} */}
            {user.isStaff ? (
              <Button outline onClick={createAlert}>
                create alert
              </Button>
            ) : (
              <span>(log in as a a sheriff to create)</span>
            )}
          </p>
        )}
        {/*
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
  selectedDataPoint: PropTypes.shape({}).isRequired,
  testData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  user: PropTypes.shape({}).isRequired,
};

export default GraphTooltip;
