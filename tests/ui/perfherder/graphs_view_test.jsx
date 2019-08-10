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

let showModal = false;
function toggle() {
  showModal = !showModal;
}

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
          showModal={showModal}
          frameworks={frameworks}
          projects={repos}
          timeRange={172800}
          options={{}}
          getTestData={() => {}}
          toggle={toggle}
          testData={testData}
        />
      }
    />,
  );
