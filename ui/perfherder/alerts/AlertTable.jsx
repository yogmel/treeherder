import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import { Col, Container, Row, } from 'reactstrap';

import perf from '../../js/perf';

// TODO remove $stateParams and $state after switching to react router
export class AlertTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    // TODO use react-table since it handles pagination
    return (
      <Container fluid>
      </Container>
    );
  }
}

AlertTable.propTypes = {
  $stateParams: PropTypes.shape({}),
  $state: PropTypes.shape({}),
};

AlertTable.defaultProps = {
  $stateParams: null,
  $state: null,
};


perf.component(
  'alertTable',
  react2angular(AlertTable, [], ['$stateParams', '$state']),
);

export default AlertTable;
