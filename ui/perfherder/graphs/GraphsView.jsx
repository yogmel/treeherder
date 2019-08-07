import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular/index.es2015';
import { Container, Col, Row } from 'reactstrap';
import unionBy from 'lodash/unionBy';

import { getData, processResponse, processErrors } from '../../helpers/http';
import {
  getApiUrl,
  repoEndpoint,
  createApiUrl,
  perfSummaryEndpoint,
  createQueryParams,
} from '../../helpers/url';
import {
  phTimeRanges,
  phDefaultTimeRangeValue,
  genericErrorMessage,
  errorMessageClass,
} from '../../helpers/constants';
import perf from '../../js/perf';
import { endpoints, graphColors } from '../constants';
import ErrorMessages from '../../shared/ErrorMessages';
import ErrorBoundary from '../../shared/ErrorBoundary';
import LoadingSpinner from '../../shared/LoadingSpinner';

import GraphsContainer from './GraphsContainer';
import TestDataModal from './TestDataModal';
import LegendCard from './LegendCard';
import GraphsViewControls from './GraphsViewControls';

class GraphsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeRange: this.getDefaultTimeRange(),
      frameworks: [],
      projects: [],
      zoom: {},
      partialSelectedData: null,
      highlightAlerts: true,
      highlightedRevisions: ['', ''],
      showModal: false,
      testData: [],
      errorMessages: [],
      options: {},
      loading: false,
    };
  }

  // TODO
  // selecting highlight alerts button resets zoom due to how that functionality
  // is updating params itself and $stateParams props won't pick up on the change

  async componentDidMount() {
    this.getData();
    this.checkQueryParams();
  }

  // TODO should add a custom time range option based on query param
  getDefaultTimeRange = () => {
    const { $stateParams } = this.props;

    const defaultValue = $stateParams.timerange
      ? parseInt($stateParams.timerange, 10)
      : phDefaultTimeRangeValue;
    return phTimeRanges.find(time => time.value === defaultValue);
  };

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
      zoom,
      selected,
      highlightAlerts,
      highlightedRevisions,
    } = this.props.$stateParams;

    const updates = {};

    if (series) {
      const _series = typeof series === 'string' ? [series] : series;
      const seriesParams = this.parseSeriesParam(_series);
      this.getTestData(seriesParams, true);
    }

    if (highlightAlerts) {
      updates.highlightAlerts = Boolean(parseInt(highlightAlerts, 10));
    }

    if (highlightedRevisions) {
      updates.highlightedRevisions =
        typeof highlightedRevisions === 'string'
          ? [highlightedRevisions]
          : highlightedRevisions;
    }

    if (zoom) {
      const zoomArray = zoom.replace(/[[{}\]"]+/g, '').split(',');
      const zoomObject = {
        x: zoomArray.map(x => new Date(parseInt(x, 10))).slice(0, 2),
        y: zoomArray.slice(2, 4),
      };
      updates.zoom = zoomObject;
    }

    if (selected) {
      const tooltipArray = selected.replace(/[[]"]/g, '').split(',');
      const tooltipValues = {
        signatureId: parseInt(tooltipArray[0], 10),
        pushId: parseInt(tooltipArray[1], 10),
        x: parseFloat(tooltipArray[2]),
        y: parseFloat(tooltipArray[3]),
      };
      updates.partialSelectedData = tooltipValues;
    }

    this.setState(updates);
  };

  createSeriesParams = series => {
    const { project, signatureId, frameworkId } = series;
    const { timeRange } = this.state;

    return {
      repository: project,
      signature: signatureId,
      framework: frameworkId,
      interval: timeRange.value,
      all_data: true,
    };
  };

  getTestData = async (newDisplayedTests = [], init = false) => {
    const { testData } = this.state;
    const tests = newDisplayedTests.length ? newDisplayedTests : testData;
    this.setState({ loading: true });

    const responses = await Promise.all(
      tests.map(series =>
        getData(
          createApiUrl(perfSummaryEndpoint, this.createSeriesParams(series)),
        ),
      ),
    );
    const errorMessages = processErrors(responses);

    if (errorMessages.length) {
      this.setState({ errorMessages, loading: false });
    } else {
      // If the server returns an empty array instead of signature data with data: [],
      // that test won't be shown in the graph or legend; this will prevent the UI from breaking
      const data = responses
        .filter(response => response.data.length)
        .map(reponse => reponse.data[0]);
      let newTestData = await this.createGraphObject(data);

      if (newDisplayedTests.length) {
        newTestData = [...testData, ...newTestData];
      }

      this.setState({ testData: newTestData, loading: false }, () => {
        if (!init) {
          // we don't need to change params when getData is called on initial page load
          this.changeParams();
        }
      });
    }
  };

  createGraphObject = async seriesData => {
    let alertSummaries = await Promise.all(
      seriesData.map(series =>
        this.getAlertSummaries(series.signature_id, series.repository_id),
      ),
    );
    alertSummaries = alertSummaries.flat();
    let relatedAlertSummaries;

    const graphData = seriesData.map((series, i) => {
      relatedAlertSummaries = alertSummaries.find(
        item => item.id === series.id,
      );

      return {
        relatedAlertSummaries,
        visible: true,
        name: series.name,
        signatureId: series.signature_id,
        signatureHash: series.signature_hash,
        frameworkId: series.framework_id,
        platform: series.platform,
        project: series.repository_name,
        projectId: series.repository_id,
        id: `${series.repository_name} ${series.name}`,
        data: series.data.map(dataPoint => ({
          x: new Date(dataPoint.push_timestamp),
          y: dataPoint.value,
          z: graphColors[i][1],
          revision: dataPoint.revision,
          alertSummary: alertSummaries.find(
            item => item.revision === dataPoint.revision,
          ),
          signatureId: series.signature_id,
          pushId: dataPoint.push_id,
          jobId: dataPoint.job_id,
        })),
        lowerIsBetter: series.lower_is_better,
        resultSetData: series.data.map(dataPoint => dataPoint.push_id),
      };
    });

    return graphData;
  };

  // TODO possibly move to helpers file
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

  updateData = async (signatureId, project, alertSummaryId, dataPointIndex) => {
    const { testData } = this.state;

    const updatedData = testData.find(test => test.signatureId === signatureId);
    const alertSummaries = await this.getAlertSummaries(signatureId, project);
    const alertSummary = alertSummaries.find(
      result => result.id === alertSummaryId,
    );
    updatedData.data[dataPointIndex].alertSummary = alertSummary;
    const newTestData = unionBy([updatedData], testData, 'signatureId');

    this.setState({ testData: newTestData });
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
        // TODO deprecate signature_hash
        signatureId:
          partialSeriesArray[1].length === 40
            ? partialSeriesArray[1]
            : parseInt(partialSeriesArray[1], 10),
        frameworkId: parseInt(partialSeriesArray[2], 10),
      };
      return partialSeriesObject;
    });

  toggle = state => {
    this.setState(prevState => ({
      [state]: !prevState[state],
    }));
  };

  updateParams = param => {
    const { transitionTo, current } = this.props.$state;

    transitionTo(current.name, param, {
      inherit: true,
      notify: false,
    });
  };

  changeParams = () => {
    const {
      testData,
      partialSelectedData,
      zoom,
      highlightAlerts,
      highlightedRevisions,
      timeRange,
    } = this.state;

    const newSeries = testData.map(
      series => `${series.project},${series.signatureId},${series.frameworkId}`,
    );
    const params = {
      series: newSeries,
      highlightedRevisions: highlightedRevisions.filter(rev => rev.length),
      highlightAlerts: +highlightAlerts,
      timerange: timeRange.value,
      zoom,
    };

    if (!partialSelectedData) {
      params.selected = null;
    } else {
      const { signatureId, pushId, x, y } = partialSelectedData;
      params.selected = [signatureId, pushId, x, y].join(',');
    }

    if (Object.keys(zoom).length === 0) {
      params.zoom = null;
    } else {
      params.zoom = [...zoom.x.map(z => z.getTime()), ...zoom.y].toString();
    }

    this.updateParams(params);
  };

  render() {
    const {
      timeRange,
      projects,
      frameworks,
      showModal,
      testData,
      options,
      highlightAlerts,
      highlightedRevisions,
      partialSelectedData,
      loading,
      errorMessages,
      zoom,
    } = this.state;

    return (
      <ErrorBoundary
        errorClasses={errorMessageClass}
        message={genericErrorMessage}
      >
        <Container fluid className="pt-5">
          {loading && <LoadingSpinner />}

          {errorMessages.length > 0 && (
            <Container className="pb-4 px-0 max-width-default">
              <ErrorMessages errorMessages={errorMessages} />
            </Container>
          )}

          {projects.length > 0 && frameworks.length > 0 && (
            <TestDataModal
              showModal={showModal}
              frameworks={frameworks}
              projects={projects}
              timeRange={timeRange.value}
              options={options}
              getTestData={this.getTestData}
              toggle={() => this.toggle('showModal')}
              testData={testData}
            />
          )}
          <Row>
            <Col id="graph-chooser">
              <Container className="graph-legend pl-0 pb-4">
                {testData.length > 0 &&
                  testData.map((series, i) => (
                    <div
                      key={`${series.name} ${series.project} ${series.platform}`}
                    >
                      <LegendCard
                        series={series}
                        testData={testData}
                        {...this.props}
                        updateState={state => this.setState(state)}
                        updateStateParams={state =>
                          this.setState(state, this.changeParams)
                        }
                        color={graphColors[i][0]}
                        partialSelectedData={partialSelectedData}
                      />
                    </div>
                  ))}
              </Container>
            </Col>
            <Col className="pl-0">
              <GraphsViewControls
                timeRange={timeRange}
                graphs={
                  testData.length > 0 && (
                    <GraphsContainer
                      timeRange={timeRange}
                      highlightAlerts={highlightAlerts}
                      highlightedRevisions={highlightedRevisions}
                      zoom={zoom}
                      partialSelectedData={partialSelectedData}
                      testData={testData}
                      updateStateParams={state =>
                        this.setState(state, this.changeParams)
                      }
                      user={this.props.user}
                      updateData={this.updateData}
                      projects={projects}
                    />
                  )
                }
                updateState={state => this.setState(state)}
                updateStateParams={state =>
                  this.setState(state, this.changeParams)
                }
                highlightAlerts={highlightAlerts}
                highlightedRevisions={highlightedRevisions}
                updateTimeRange={timeRange =>
                  this.setState(
                    {
                      timeRange,
                      zoom: {},
                      partialSelectedData: null,
                    },
                    this.getTestData,
                  )
                }
                hasNoData={!testData.length && !loading}
              />
            </Col>
          </Row>
        </Container>
      </ErrorBoundary>
    );
  }
}

GraphsView.propTypes = {
  $stateParams: PropTypes.shape({
    zoom: PropTypes.string,
    selected: PropTypes.string,
    highlightAlerts: PropTypes.string,
    highlightedRevisions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    series: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
  $state: PropTypes.shape({
    current: PropTypes.shape({}),
    transitionTo: PropTypes.func,
  }),
  user: PropTypes.shape({}).isRequired,
};

GraphsView.defaultProps = {
  $stateParams: undefined,
  $state: undefined,
};

perf.component(
  'graphsView',
  react2angular(GraphsView, ['user'], ['$stateParams', '$state']),
);

export default GraphsView;
