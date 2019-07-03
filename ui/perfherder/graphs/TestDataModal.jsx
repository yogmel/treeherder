import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Col,
  Form,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
} from 'reactstrap';

import { createDropdowns } from '../FilterControls';
import InputFilter from '../InputFilter';
import { processResponse } from '../../helpers/http';
import PerfSeriesModel from '../../models/perfSeries';
import { thPerformanceBranches } from '../../helpers/constants';
import { containsText } from '../helpers';

export default class TestDataModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      platforms: [],
      framework: { name: 'talos', id: 1 },
      project: this.findObject(this.props.projects, 'name', 'mozilla-central'),
      platform: 'linux64',
      errorMessages: [],
      includeSubtests: false,
      seriesData: [],
      relatedTests: [],
      selectedTests: [],
      filteredData: [],
      showNoRelatedTests: false,
      filterText: '',
    };
  }

  componentDidMount() {
    this.getInitialData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { platforms, platform } = this.state;

    if (prevState.platforms !== platforms) {
      const newPlatform = platforms.find(item => item === platform)
        ? platform
        : platforms[0];
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ platform: newPlatform });
    }
  }

  getInitialData = async () => {
    const { errorMessages, project, framework } = this.state;
    const { timeRange } = this.props;

    const params = { interval: timeRange, framework: framework.id };
    const platforms = await PerfSeriesModel.getPlatformList(
      project.name,
      params,
    );

    const updates = {
      ...processResponse(platforms, 'platforms', errorMessages),
    };

    this.setState(updates, this.processOptions);
  };

  getSeriesData = async params => {
    const { errorMessages, project } = this.state;
    const { displayedTests } = this.props;

    let updates = {
      filteredData: [],
      relatedTests: [],
      showNoRelatedTests: false,
    };
    const response = await PerfSeriesModel.getSeriesList(project.name, params);
    updates = {
      ...updates,
      ...processResponse(response, 'seriesData', errorMessages),
    };
    if (displayedTests.length && updates.seriesData) {
      updates.seriesData = updates.seriesData.filter(
        item => displayedTests.findIndex(test => item.id === test.id) === -1,
      );
    }
    this.setState(updates);
  };

  async getPlatforms() {
    const { project, framework, errorMessages } = this.state;
    const { timeRange } = this.props;

    const params = { interval: timeRange, framework: framework.id };
    const response = await PerfSeriesModel.getPlatformList(
      project.name,
      params,
    );

    const updates = processResponse(response, 'platforms', errorMessages);
    this.setState(updates);
    this.processOptions();
  }

  addRelatedConfigs = async params => {
    const { relatedSeries } = this.props.options;
    const { errorMessages, project } = this.state;

    const response = await PerfSeriesModel.getSeriesList(project.name, params);
    const updates = processResponse(response, 'relatedTests', errorMessages);

    if (updates.relatedTests.length) {
      const tests =
        updates.relatedTests.filter(
          series =>
            series.platform === relatedSeries.platform &&
            series.testName === relatedSeries.testName &&
            series.name !== relatedSeries.name,
        ) || [];

      updates.relatedTests = tests;
    }
    updates.showNoRelatedTests = updates.relatedTests.length === 0;

    this.setState(updates);
  };

  addRelatedPlatforms = async params => {
    const { relatedSeries } = this.props.options;
    const { errorMessages, project } = this.state;

    const response = await PerfSeriesModel.getSeriesList(project.name, params);
    const updates = processResponse(response, 'relatedTests', errorMessages);

    if (updates.relatedTests.length) {
      const tests =
        updates.relatedTests.filter(
          series =>
            series.platform !== relatedSeries.platform &&
            series.name === relatedSeries.name,
        ) || [];

      updates.relatedTests = tests;
    }
    updates.showNoRelatedTests = updates.relatedTests.length === 0;

    this.setState(updates);
  };

  addRelatedBranches = async params => {
    const { relatedSeries } = this.props.options;
    const errorMessages = [];

    const relatedProjects = thPerformanceBranches.filter(
      project => project !== relatedSeries.projectName,
    );
    const requests = relatedProjects.map(projectName =>
      PerfSeriesModel.getSeriesList(projectName, params),
    );

    const responses = await Promise.all(requests);
    // eslint-disable-next-line func-names
    const relatedTests = responses.flatMap(function(item) {
      if (!item.failureStatus) {
        return item.data;
      }
      errorMessages.push(item.data);
    });

    this.setState({
      relatedTests,
      showNoRelatedTests: relatedTests.length === 0,
      errorMessages,
    });
  };

  processOptions = () => {
    const { option, relatedSeries } = this.props.options;
    const {
      platform,
      framework,
      includeSubtests,
      relatedTests,
      showNoRelatedTests,
    } = this.state;
    const { timeRange } = this.props;

    const params = {
      interval: timeRange,
      framework: framework.id,
      subtests: +includeSubtests,
    };

    // TODO reset option after it's called the first time
    // so user can press update to use test filter controls
    if (!option || relatedTests.length || showNoRelatedTests) {
      params.platform = platform;
      return this.getSeriesData(params);
    }

    params.framework = relatedSeries.frameworkId;

    if (option === 'addRelatedPlatform') {
      this.addRelatedPlatforms(params);
    } else if (option === 'addRelatedConfigs') {
      this.addRelatedConfigs(params);
    } else if (option === 'addRelatedBranches') {
      params.signature = relatedSeries.signature;
      this.addRelatedBranches(params);
    }
  };

  findObject = (list, key, value) => list.find(item => item[key] === value);

  updateFilterText = filterText => {
    const { seriesData } = this.state;
    const filteredData = seriesData.filter(test =>
      containsText(test.name, filterText),
    );
    this.setState({ filteredData, filterText });
  };

  updateSelectedTests = (test, removeTest = false) => {
    const { selectedTests } = this.state;
    const index = selectedTests.indexOf(test);

    if (index === -1) {
      this.setState({
        selectedTests: [...selectedTests, ...[test]],
      });
    } else if (index !== -1 && removeTest) {
      selectedTests.splice(index, 1);
      this.setState({ selectedTests });
    }
  };

  getFullTestName = test => `${test.projectName} ${test.platform} ${test.name}`;

  getOriginalTestName = test =>
    this.state.relatedTests.length > 0 ? this.getFullTestName(test) : test.name;

  render() {
    const {
      platforms,
      seriesData,
      framework,
      project,
      platform,
      includeSubtests,
      selectedTests,
      filteredData,
      relatedTests,
      showNoRelatedTests,
      filterText,
    } = this.state;
    const { projects, submitData, frameworks, toggle, showModal } = this.props;

    const modalOptions = [
      {
        options: frameworks.length ? frameworks.map(item => item.name) : [],
        selectedItem: framework.name,
        updateData: value =>
          this.setState(
            {
              framework: this.findObject(frameworks, 'name', value),
            },
            this.getPlatforms,
          ),
        title: 'Framework',
      },
      {
        options: projects.length ? projects.map(item => item.name) : [],
        selectedItem: project.name || '',
        updateData: value =>
          this.setState(
            { project: this.findObject(projects, 'name', value) },
            this.getPlatforms,
          ),
        title: 'Project',
      },
      {
        options: platforms,
        selectedItem: platform,
        updateData: platform =>
          this.setState({ platform }, this.processOptions),
        title: 'Platform',
      },
    ];
    let tests = seriesData;
    if (filterText) {
      tests = filteredData;
    } else if (relatedTests.length) {
      tests = relatedTests;
    }

    return (
      <Modal size="lg" isOpen={showModal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Add Test Data</ModalHeader>
        <ModalBody className="container-fluid test-chooser">
          <Form>
            <Row className="justify-content-start">
              {createDropdowns(modalOptions, 'p-2', true)}
              <Col sm="auto" className="p-2">
                <Button
                  color="info"
                  outline
                  onClick={() =>
                    this.setState(
                      { includeSubtests: !includeSubtests },
                      this.processOptions,
                    )
                  }
                  active={includeSubtests}
                >
                  Include subtests
                </Button>
              </Col>
            </Row>
            <Row className="justify-content-start">
              <Col className="p-2 col-4">
                <InputFilter
                  disabled={relatedTests.length > 0}
                  updateFilterText={this.updateFilterText}
                />
              </Col>
            </Row>
            <Row className="p-2 justify-content-start">
              <Col className="p-0">
                <Label for="exampleSelect">
                  {relatedTests.length > 0 ? 'Related tests' : 'Tests'}
                </Label>
                <Input
                  type="select"
                  name="selectMulti"
                  id="selectTests"
                  multiple
                >
                  {tests.length > 0 &&
                    tests.sort().map(test => (
                      <option
                        key={test.id}
                        onClick={() => this.updateSelectedTests(test)}
                        title={this.getOriginalTestName(test)}
                      >
                        {this.getOriginalTestName(test)}
                      </option>
                    ))}
                </Input>
                {showNoRelatedTests && (
                  <p className="text-info pt-2">No related tests found.</p>
                )}
              </Col>
            </Row>
            <Row className="p-2 justify-content-start">
              <Col className="p-0">
                <Label for="exampleSelect">
                  Selected tests{' '}
                  <span className="small">(click a test to remove it)</span>
                </Label>
                <Input
                  type="select"
                  name="selectMulti"
                  id="selectTests"
                  multiple
                >
                  {selectedTests.length > 0 &&
                    selectedTests.map(test => (
                      <option
                        key={test.id}
                        onClick={() => this.updateSelectedTests(test, true)}
                        title={this.getFullTestName(test)}
                      >
                        {this.getFullTestName(test)}
                      </option>
                    ))}
                </Input>
                {selectedTests.length > 6 && (
                  <p className="text-info pt-2">
                    Displaying more than 6 graphs at a time is not supported in
                    the UI.
                  </p>
                )}
              </Col>
            </Row>
            <Row className="p-2">
              <Col className="py-2 px-0 text-right">
                <Button
                  color="info"
                  disabled={!selectedTests.length}
                  onClick={() => submitData(selectedTests)}
                  onKeyPress={event => event.preventDefault()}
                >
                  Plot graphs
                </Button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    );
  }
}

TestDataModal.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  timeRange: PropTypes.number.isRequired,
  submitData: PropTypes.func.isRequired,
  options: PropTypes.shape({
    option: PropTypes.string,
    relatedSeries: PropTypes.shape({}),
  }),
  displayedTests: PropTypes.arrayOf(PropTypes.shape({})),
  frameworks: PropTypes.arrayOf(PropTypes.shape({})),
  showModal: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

TestDataModal.defaultProps = {
  options: undefined,
  displayedTests: [],
  frameworks: [],
};
