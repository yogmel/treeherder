import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import {
  Col,
  Row,
  Container,
  Button,
} from 'reactstrap';

import perf from '../../js/perf';

// TODO remove $stateParams and $state after switching to react router
export class AlertControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    console.log(this.props.alertSummary);
    return (
      <Container fluid className="bg-lightgray">
        <Button> Reset
        </Button>
      </Container>
    );
  }
}

AlertControls.propTypes = {
  $stateParams: PropTypes.shape({}),
  $state: PropTypes.shape({}),
  alertSummary: PropTypes.shape({}),
};

AlertControls.defaultProps = {
  $stateParams: null,
  $state: null,
};


perf.component(
  'alertControls',
  react2angular(AlertControls, ['alertSummary'], ['$stateParams', '$state']),
);

export default AlertControls;
