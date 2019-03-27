import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import { Col, Row, Container, Button } from 'reactstrap';

import perf from '../../js/perf';
import {
  alertIsOfState,
  // alertSummaryIsOfState,
  // alertSummaryMarkAs,
  // assignBug,
  // editingNotes,
  // getAlertStatusText,
  // getAlertSummaries,
  // getAlertSummary,
  // getAlertSummaryTitle,
  // getAlertSummaryStatusText,
  // getGraphsURL,
  // getIssueTrackerUrl,
  // getSubtestsURL,
  // getTextualSummary,
  // getTitle,
  // isResolved,
  modifySelectedAlerts,
  refreshAlertSummary,
  // saveNotes,
  // toggleStar,
  // unassignBug,
} from '../helpers';
import {
  // thDateFormat,
  // phTimeRanges,
  // phDefaultTimeRangeValue,
  // phTimeRangeValues,
  // phAlertSummaryStatusMap,
  phAlertStatusMap,
} from '../../helpers/constants';
import SimpleTooltip from '../../shared/SimpleTooltip';

// TODO remove $stateParams and $state after switching to react router
export class AlertControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  anySelected = alerts => alerts.map(alert => alert.selected).some(x => x);

  anySelectedAndTriaged = alerts =>
    alerts
      .map(
        alert =>
          !alertIsOfState(alert, phAlertStatusMap.UNTRIAGED) && alert.selected,
      )
      .some(x => x);

    updateAlertSummary = alertSummary => {
      refreshAlertSummary(alertSummary).then(() => {
        // TODO this needs to be extracted from alerts.js or added to scope
          updateAlertVisibility();
          // $scope.$digest();
      });
    }

    resetAlerts = alertSummary => {
      // We need to update not only the summary when resetting the alert,
      // but other summaries affected by the change
      const { alertSummaries } = this.props;
      const summariesToUpdate = [alertSummary].concat((
          alertSummary.alerts.filter(alert => alert.selected).map(
          alert => (alertSummaries.find(alertSummary =>
                  alertSummary.id === alert.related_summary_id)),
          )).filter(alertSummary => alertSummary !== undefined));

      modifySelectedAlerts(alertSummary, {
          status: phAlertStatusMap.UNTRIAGED.id,
          related_summary_id: null,
      }).then(() => summariesToUpdate.forEach((alertSummary) => this.updateAlertSummary(alertSummary)));
    };

  render() {
    // TODO first div condition
    // <div class="card-body button-panel" uib-collapse="!anySelected(alertSummary.alerts) && !(alertSummary.notes)">
    // <div ng-show="anySelected(alertSummary.alerts)">
    //   <button ng-if="anySelectedAndTriaged(alertSummary.alerts)" class="btn btn-warning" role="button"
    //           ng-click="resetAlerts(alertSummary)" title="Reset selected alerts to untriaged">
    //     Reset
    //   </button>
    //   <span ng-if="!anySelectedAndTriaged(alertSummary.alerts) || allSelectedAreConfirming(alertSummary.alerts)">
    //     <button class="btn btn-light-bordered" role="button"
    //             ng-if="!allSelectedAreConfirming(alertSummary.alerts)"
    //             ng-click="markAlertsConfirming(alertSummary)" title="Retriggers & backfills are pending">
    //       <span class="far fa-clock"></span> Confirming
    //     </button>
    //     <button class="btn btn-light-bordered" role="button"
    //             ng-click="markAlertsAcknowledged(alertSummary)" title="Acknowledge selected alerts as valid">
    //       <span class="fas fa-check"></span> Acknowledge
    //     </button>
    //     <button class="btn btn-light-bordered" role="button"
    //             ng-click="markAlertsInvalid(alertSummary)" title="Mark selected alerts as invalid">
    //       <span class="fas fa-ban"></span> Mark invalid
    //     </button>
    //     <button class="btn btn-light-bordered" role="button"
    //             ng-click="markAlertsDownstream(alertSummary)"
    //             title="Mark selected alerts as downstream from an alert summary on another branch">
    //       <span class="fas fa-level-down-alt"></span> Mark downstream
    //     </button>
    //     <button class="btn btn-light-bordered" role="button"
    //             ng-click="reassignAlerts(alertSummary)"
    //             title="Reassign selected alerts to another alert summary on the same branch">
    //       <span class="far fa-arrow-alt-circle-right"></span> Reassign
    //     </button>
    //   </span>
    // </div>
    // </div>
    const { alertSummary, isAlertSelected } = this.props;
    console.log(isAlertSelected, alertSummary.notes);
    return (
      <Container fluid className="bg-lightgray">
      {isAlertSelected &&
        <React.Fragment>
          {/* {this.anySelectedAndTriaged(alertSummary.alerts) && ( */}
            <SimpleTooltip
              text={
                <Button outline color="secondary" onClick={this.resetAlerts(alertSummary)}>
                  {' '}
                  Reset
                </Button>
              }
              tooltipText="Reset selected alerts to untriaged"
            />
          {/* )} */}
        </React.Fragment>
        }
      </Container>
    );
  }
}

AlertControls.propTypes = {
  $stateParams: PropTypes.shape({}),
  $state: PropTypes.shape({}),
  alertSummary: PropTypes.shape({}),
  isAlertSelected: PropTypes.bool.isRequired,
  alertSummaries: PropTypes.shape({}),
};

AlertControls.defaultProps = {
  $stateParams: null,
  $state: null,
  alertSummary: null,
  alertSummaries: null,
};

perf.component(
  'alertControls',
  react2angular(
    AlertControls,
    ['alertSummary', 'isAlertSelected', 'alertSummaries'],
    ['$stateParams', '$state', '$scope'],
  ),
);

export default AlertControls;
