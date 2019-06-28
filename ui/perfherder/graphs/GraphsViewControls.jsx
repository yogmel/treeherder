import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import {
  Button,
  Container,
  Col,
  Row,
  UncontrolledDropdown,
  DropdownToggle,
} from 'reactstrap';

import { getData, processResponse } from '../../helpers/http';
import { getApiUrl, repoEndpoint } from '../../helpers/url';
import { phTimeRanges, phDefaultTimeRangeValue } from '../../helpers/constants';
import perf from '../../js/perf';
import { endpoints } from '../constants';
import DropdownMenuItems from '../../shared/DropdownMenuItems';

import GraphsContainer from './GraphsContainer';

class GraphsViewControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeRange: '',
      frameworks: [],
      projects: [],
      errorMessages: [],
    };
  }

  componentDidMount() {
    this.getDefaultTimeRange();
    this.fetchData();
  }

  // TODO
  // check for seriesList from TestDataModal or $stateParams for values
  // call getSeriesData
  // set up object for graph

  async fetchData() {
    const [projects, frameworks] = await Promise.all([
      getData(getApiUrl(repoEndpoint)),
      getData(getApiUrl(endpoints.frameworks)),
    ]);

    const updates = {
      ...processResponse(projects, 'projects'),
      ...processResponse(frameworks, 'frameworks'),
    };
    this.setState(updates);
  }

  // TODO should add a custom time range option based on query param
  getDefaultTimeRange = () => {
    const { $stateParams } = this.props;

    const defaultValue = $stateParams.timerange
      ? parseInt($stateParams.timerange, 10)
      : phDefaultTimeRangeValue;
    const timeRange = phTimeRanges.find(time => time.value === defaultValue);
    this.setState({ timeRange });
  };

  render() {
    const { timeRange, projects, frameworks } = this.state;

    return (
      <Container fluid className="justify-content-start">
        <Row className="pb-2">
          <Col sm="auto" className="py-2 pl-0 pr-2" key={timeRange}>
            <UncontrolledDropdown
              className="mr-0 text-nowrap"
              title="Time range"
              aria-label="Time range"
            >
              <DropdownToggle caret>{timeRange.text}</DropdownToggle>
              <DropdownMenuItems
                options={phTimeRanges.map(item => item.text)}
                selectedItem={timeRange.text}
                updateData={value =>
                  this.setState({
                    timeRange: phTimeRanges.find(item => item.text === value),
                    // TODO update graphs - replace timeRangeChanged
                  })
                }
              />
            </UncontrolledDropdown>
          </Col>
          <Col sm="auto" className="p-2">
            <Button color="info" onClick={() => {}}>
              Add test data
            </Button>
          </Col>
        </Row>
        <GraphsContainer timeRange={timeRange} />
      </Container>
    );
  }
}

GraphsViewControls.propTypes = {
  $stateParams: PropTypes.shape({}),
};

GraphsViewControls.defaultProps = {
  $stateParams: undefined,
};

perf.component(
  'graphsViewControls',
  react2angular(GraphsViewControls, [], ['$stateParams', '$state']),
);

export default GraphsViewControls;
