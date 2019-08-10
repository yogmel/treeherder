import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  waitForElementToBeRemoved,
  wait,
} from '@testing-library/react';

import GraphsViewControls from '../../../ui/perfherder/graphs/GraphsViewControls';
import TestDataModal from '../../../ui/perfherder/graphs/TestDataModal';
// import { summaryStatusMap } from '../../../ui/perfherder/constants';
import repos from '../mock/repositories';
import testData from '../mock/performance_summary.json';

const frameworks = [
  { id: 1, name: 'talos' },
  { id: 2, name: 'build_metrics' },
  { id: 3, name: 'autophone' },
];


// closeModal
const toggleMock = jest.fn();
toggleMock.mockReturnValueOnce(false);

const graphsViewControls = () =>
  render(
    <GraphsViewControls
      updateState={() => {}}
      updateStateParams={() => {}}
      graphs={false}
      timeRange={{}}
      highlightAlerts={false}
      highlightedRevisions={['', '']}
      updateTimeRange={() => {}}
      hasNoData
      TestDataModal={
        <TestDataModal
          showModal={false}
          frameworks={frameworks}
          projects={repos}
          timeRange={172800}
          options={{}}
          getTestData={() => {}}
          toggle={() => toggleMock()}
          testData={testData}
        />
      }
    />,
  );

afterEach(cleanup)

test('changing framework and repository from the test data modal shows the correct test', async () => {
  const { getByText, getBy } = graphsViewControls();
  const addTestData = getByText('Add test data');

  fireEvent.click(addTestData);

  // const testDataModal = await waitForElement(() => getByText('Add Test Data'));
});