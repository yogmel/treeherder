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
import optionCollectionMap from '../mock/optionCollectionMap';
import { summaryStatusMap } from '../../../ui/perfherder/constants';

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
          projects={projects}
          timeRange={timeRange.value}
          options={options}
          getTestData={this.getTestData}
          toggle={() => this.toggle('showModal')}
          testData={testData}
        />
      }
    />,
  );
