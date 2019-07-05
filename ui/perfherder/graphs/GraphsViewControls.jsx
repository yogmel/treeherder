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

import { getData, processResponse, processErrors } from '../../helpers/http';
import {
  getApiUrl,
  repoEndpoint,
  createApiUrl,
  perfSummaryEndpoint,
  createQueryParams,
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
    this.colors = [
      'darkseagreen',
      'lightseagreen',
      'darkslateblue',
      'darkgreen',
      'steelblue',
      'darkorchid',
      'blue',
      'darkcyan',
    ];
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
      testData: [],
      graphData: [],
      errorMessages: [],
    };
  }

  async componentDidMount() {
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
  // seems a bit slow for loading all data - perhaps return repo id so
  // we don't need to wait for projects to return
  // move TestCards component to here
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

  getTestData = async (newDisplayedTests = []) => {
    const { testData, displayedTests } = this.state;
    const tests = newDisplayedTests.length ? newDisplayedTests : displayedTests;

    const responses = await Promise.all(
      tests.map(series =>
        getData(
          createApiUrl(perfSummaryEndpoint, this.createSeriesParams(series)),
        ),
      ),
    );
    const errorMessages = processErrors(responses);
    if (errorMessages.length) {
      this.setState({ errorMessages });
    } else {
      let newTestData = responses.map(response => response.data[0]);
      newTestData = await this.createGraphObject(newTestData);
      this.setState({ testData: [...testData, ...newTestData] });
    }
  };

  // TODO change this create new structure only from data that we need
  createGraphObject = async seriesData => {
    const alertSummaries = await Promise.all(
      seriesData.map(series =>
        this.getAlertSummaries(series.signature_id, series.repository_id),
      ),
    );

    for (const series of seriesData) {
      series.relatedAlertSummaries = alertSummaries.find(
        item => item.id === series.id,
      );
      series.color = this.colors.pop();
      series.flotSeries = {
        lines: { show: false },
        points: { show: true },
        color: series.color,
        label: `${series.repository_name} ${series.name}`,
        data: series.data.map(dataPoint => [
          dataPoint.push_timestamp,
          dataPoint.value,
        ]),
        resultSetData: series.data.map(dataPoint => dataPoint.push_id),
        // thSeries: $.extend({}, series),
        thSeries: { ...series },
        jobIdData: series.data.map(dataPoint => dataPoint.job_id),
        idData: series.data.map(dataPoint => dataPoint.id),
      };
    }
    return seriesData;
  };

  getAlertSummaries = async (signatureId, repository) => {
    const { errorMessages } = this.state;

    const url = getApiUrl(
      `${endpoints.alertSummary}${createQueryParams({
        alerts__series_signature: signatureId,
        repository,
      })}`,
    );

    const data = await getData(url);
    const response = processResponse(data, 'alertSummaries', errorMessages);

    if (response.alertSummaries) {
      return response.alertSummaries.results;
    }
    this.setState({ errorMessages: response.errorMessages });
    return [];
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
        // TODO deprecate hash usage - show message to require id
        // signature:
        //   partialSeriesArray[1].length === 40
        //     ? partialSeriesArray[1]
        //     : undefined,
        id:
          partialSeriesArray[1].length === 40
            ? undefined
            : parseInt(partialSeriesArray[1], 10),
        // TODO remove this param since it doesn't seem to affect checkboxes
        visible: partialSeriesArray[2] !== 0,
        framework: parseInt(partialSeriesArray[3], 10),
      };
      return partialSeriesObject;
    });

  toggle = state => {
    this.setState(prevState => ({
      [state]: !prevState[state],
    }));
  };

  submitData = selectedTests => {
    // TODO this seems like an unnecessary extra step
    const newDisplayedTests = selectedTests.map(series => ({
      id: parseInt(series.id, 10),
      project: series.projectName,
      framework: parseInt(series.frameworkId, 10),
      hightlightedPoints: [],
      visible: true,
    }));

    this.getTestData(newDisplayedTests);
    this.toggle('showModal');
  };

  render() {
    const {
      timeRange,
      projects,
      frameworks,
      showModal,
      displayedTests,
    } = this.state;

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
            displayedTests={displayedTests}
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
