import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import { Container, Form, FormGroup, Label, Input, Table } from 'reactstrap';

import perf from '../../js/perf';

import AlertHeader from './AlertHeader';
import StatusDropdown from './StatusDropdown';
import AlertTableRow from './AlertTableRow';

// TODO remove $stateParams and $state after switching to react router
export class AlertTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertSummary: this.props.alertSummary,
    };
  }

  selectAlerts = () => {
    const { alertSummary: oldAlertSummary } = this.state;
    const alertSummary = { ...oldAlertSummary };
    alertSummary.allSelected = !alertSummary.allSelected;

    alertSummary.alerts.forEach(function selectAlerts(alert) {
      alert.selected = alert.visible && alertSummary.allSelected;
    });
    this.setState({ alertSummary });
    this.props.$rootScope.$apply();
  };

  render() {
    const { user, $rootScope, repos } = this.props;
    const { alertSummary } = this.state;

    return (
      <Container fluid className="px-0">
        <Form>
          <Table className="compare-table">
            <thead>
              <tr className="bg-lightgray">
                <th
                  colSpan="8"
                  className="text-left alert-summary-header-element"
                >
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        disabled={!user.isStaff}
                        onClick={this.selectAlerts}
                      />
                      <AlertHeader alertSummary={alertSummary} />
                    </Label>
                  </FormGroup>
                </th>
                <th className="table-width-sm align-top font-weight-normal">
                  <StatusDropdown
                    alertSummary={alertSummary}
                    repos={repos}
                    user={user}
                    $rootScope={$rootScope}
                    updateAlertSummary={alertSummary =>
                      this.setState({ alertSummary })
                    }
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {/* // TODO orderBy: ['-starred', 'title'] */}
              {alertSummary.alerts.map(
                alert =>
                  alert.visible && (
                    <AlertTableRow
                      key={alert.id}
                      alertSummary={alertSummary}
                      alert={alert}
                      user={user}
                    />
                  ),
              )}
              {alertSummary.downstreamSummaryIds.length &&
              <tr>
                <p className="text-muted">Downstream alert summaries:</p>
                {alertSummary.downstreamSummaryIds.map(summaryId =>
                <span className="text-muted">
                  {/* <a href={`perf.html#/alerts?id=${summaryId}`} */}
                      // ng-mouseenter="getSummaryTitle(summaryId)"
                      // ng-mouseleave="resetSummaryTitle()"
                      uib-tooltip-html="summaryTitle.html" >
                    {/* #{{summaryId}}
                  </a>{{$last ? '' : ', '}} */}
                </span>)}
              </tr>}
            </tbody>
          </Table>
        </Form>
      </Container>
    );
  }
}
{/* <div class="card-body" ng-show="alertSummary.downstreamSummaryIds.length">
<p class="text-muted">
  Downstream alert summaries:
  <span class="text-muted" ng-repeat="summaryId in alertSummary.downstreamSummaryIds" >
      <a href="perf.html#/alerts?id={{summaryId}}"
          ng-mouseenter="getSummaryTitle(summaryId)"
          ng-mouseleave="resetSummaryTitle()"
          uib-tooltip-html="summaryTitle.html" >
         #{{summaryId}}
      </a>{{$last ? '' : ', '}}
  </span>
</p>
</div> */}

AlertTable.propTypes = {
  $stateParams: PropTypes.shape({}),
  $state: PropTypes.shape({}),
  alertSummary: PropTypes.shape({}),
  user: PropTypes.shape({}),
  repos: PropTypes.arrayOf(PropTypes.shape({})),
  $rootScope: PropTypes.shape({
    $apply: PropTypes.func,
  }).isRequired,
};

AlertTable.defaultProps = {
  $stateParams: null,
  $state: null,
  alertSummary: null,
  user: null,
  repos: null,
};

perf.component(
  'alertTable',
  react2angular(
    AlertTable,
    ['alertSummary', 'user', 'repos'],
    ['$stateParams', '$state', '$rootScope'],
  ),
);

export default AlertTable;
