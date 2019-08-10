import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  // waitForElementToBeRemoved,
  // wait,
} from '@testing-library/react';

import GraphsViewControls from '../../../ui/perfherder/graphs/GraphsViewControls';
// import { summaryStatusMap } from '../../../ui/perfherder/constants';
import repos from '../mock/repositories';
import testData from '../mock/performance_summary.json';

const frameworks = [{ id: 1, name: 'talos' }, { id: 2, name: 'build_metrics' }];

const platforms = [];
const graphsViewControls = () =>
  render(
    <GraphsViewControls
      updateStateParams={() => {}}
      graphs={false}
      highlightAlerts={false}
      highlightedRevisions={['', '']}
      updateTimeRange={() => {}}
      hasNoData
      frameworks={frameworks}
      projects={repos}
      timeRange={{ value: 172800, text: 'Last two days' }}
      options={{}}
      getTestData={() => {}}
      testData={testData}
      getInitialData={() => ({
        platforms,
      })}
    />,
  );

afterEach(cleanup);

// Tests:
// testDataModal is opened when add test data is clicked
// testDataModal shows all tests in Tests text area except for what's in legend (testData)
// changing a dropdown updates Test list
// clicking on a test adds it to selectedTests
// clicking submit closes the modal

test('changing framework and repository from the test data modal shows the correct test', async () => {
  const { getByText, getByTestId, queryByTestId } = graphsViewControls();
  const addTestData = getByText('Add test data');

  fireEvent.click(addTestData);
  const testDataModal = getByText('Add Test Data');
  expect(testDataModal).toBeInTheDocument();

  const tests = getByTestId('tests');
  const selectedTests = getByTestId('selectedTests');

  // If a test has already been added to the legend (testData),
  // then it should not included in the TestDataModals' list of Tests
  // (based on framework, repository and platform)
  const existingTest = await waitForElement(() =>
    getByTestId(testData[0].signature_id.toString()),
  );
  // expect(existingTest).toBeInTheDocument();
});
