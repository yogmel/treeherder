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
import {
  getApiUrl,
  repoEndpoint,
  createApiUrl,
  perfSummaryEndpoint,
} from '../../helpers/url';
import { phTimeRanges, phDefaultTimeRangeValue } from '../../helpers/constants';
import perf from '../../js/perf';
import { endpoints } from '../constants';
import DropdownMenuItems from '../../shared/DropdownMenuItems';

import GraphsContainer from './GraphsContainer';
import TestDataModal from './TestDataModal';

class GraphsViewControls extends React.Component {
  constructor(props) {
    super(props);
    this.colors = ['darkseagreen', 'lightseagreen', 'darkslateblue', 'darkgreen', 'steelblue', 'darkorchid', 'blue', 'darkcyan'];    
    this.state = {
      timeRange: this.getDefaultTimeRange(),
      frameworks: [],
      projects: [],
      zoom: null,
      select: null,
      displayedTests: [],
      highlightAlerts: null,
      highlightedRevisions: ['', ''],
      showModal: false,
    };
  }

  componentDidMount() {
    this.getData();
    this.checkQueryParams();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.timeRange !== this.state.timeRange) {
      this.getTestData();
    }
  }

  // TODO should add a custom time range option based on query param
  getDefaultTimeRange = () => {
    const { $stateParams } = this.props;

    const defaultValue = $stateParams.timerange
      ? parseInt($stateParams.timerange, 10)
      : phDefaultTimeRangeValue;
    return phTimeRanges.find(time => time.value === defaultValue);
  };

  // TODO
  // check for displayedTests from TestDataModal
  // set up object for graph

  async getData() {
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

  checkQueryParams = () => {
    const {
      series,
      // zoom,
      // select,
      highlightAlerts,
      highlightedRevisions,
    } = this.props.$stateParams;
    const updates = {};

    if (series) {
      const seriesParam = typeof series === 'string' ? [series] : series;
      updates.displayedTests = this.parseSeriesParam(seriesParam);
    }

    if (highlightAlerts) {
      updates.highlightAlerts = parseInt(highlightAlerts, 10);
    }

    if (highlightedRevisions) {
      updates.highlightedRevisions =
        typeof highlightedRevisions === 'string'
          ? [highlightedRevisions]
          : highlightedRevisions;
    }

    this.setState(updates, () => {
      if (this.state.displayedTests.length) {
        this.getTestData();
      }
    });
  };

  createSeriesParams = series => {
    const { project, id, framework } = series;
    const { timeRange } = this.state;

    return {
      repository: project,
      signature: id,
      framework,
      interval: timeRange.value,
      all_data: true,
    };
  };

  getTestData = async () => {
    const { displayedTests } = this.state;
    const seriesData = await Promise.all(
      displayedTests.map(series =>
        getData(
          createApiUrl(perfSummaryEndpoint, this.createSeriesParams(series)),
        ),
      ),
    );
    this.setState({ seriesData });
  };

  parseSeriesParam = series =>
    series.map(encodedSeries => {
      const partialSeriesString = decodeURIComponent(encodedSeries).replace(
        /[[\]"]/g,
        '',
      );
      const partialSeriesArray = partialSeriesString.split(',');
      const partialSeriesObject = {
        project: partialSeriesArray[0],
        // TODO deprecate hash usage
        // signature:
        //   partialSeriesArray[1].length === 40
        //     ? partialSeriesArray[1]
        //     : undefined,
        id:
          partialSeriesArray[1].length === 40
            ? undefined
            : partialSeriesArray[1],
        // TODO this affects the checkboxes in the legend
        visible: partialSeriesArray[2] !== 0,
        framework: partialSeriesArray[3],
        color: this.colors.pop(),
      };
      return partialSeriesObject;
    });

  toggle = state => {
    this.setState(prevState => ({
      [state]: !prevState[state],
    }));
  };

  submitData = selectedTests => {
    const { displayedTests, colors } = this.state;
    const newDisplayedTests = selectedTests.map(series => 
      ({
        id: series.id,
        project: series.projectName,
        framework: series.frameworkId,
        hightlightedPoints: [],
        visible: true,
        color: this.colors.pop(),
    }));

    this.setState({ displayedTests: [...this.state.displayedTests, ...newDisplayedTests] });
  }

  render() {
    const { timeRange, projects, frameworks, showModal, displayedTests } = this.state;
    console.log(displayedTests);
    return (
      <Container fluid className="justify-content-start">
        {projects.length > 0 && frameworks.length > 0 && (
          <TestDataModal
            showModal={showModal}
            frameworks={frameworks}
            projects={projects}
            timeRange={timeRange.value}
            options={{}}
            submitData={this.submitData}
            toggle={() => this.toggle('showModal')}
          />
        )}
        {/* TODO move SelectedTestsContainer into here, TestCards take the displayedTests
        data as props (project name, platform name, test name, checkbox visibility) */}
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
            <Button
              color="info"
              onClick={() => this.setState({ showModal: true })}
            >
              Add test data
            </Button>
          </Col>
        </Row>
        <GraphsContainer timeRange={timeRange} {...this.props} />
      </Container>
    );
  }
}

GraphsViewControls.propTypes = {
  $stateParams: PropTypes.shape({
    zoom: PropTypes.string,
    highlightRevisions: PropTypes.string,
    select: null,
    series: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    highlightAlerts: PropTypes.string,
    highlightedRevisions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
};

GraphsViewControls.defaultProps = {
  $stateParams: undefined,
};

perf.component(
  'graphsViewControls',
  react2angular(GraphsViewControls, [], ['$stateParams', '$state']),
);

export default GraphsViewControls;
