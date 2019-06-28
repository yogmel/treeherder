import React from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Col, Row } from 'reactstrap';

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <Container fluid className="justify-content-start"></Container>;
  }
}

GraphsContainer.propTypes = {
  timeRange: PropTypes.shape({}).isRequired,
};

// GraphsContainer.defaultProps = {
// };

export default GraphsContainer;
