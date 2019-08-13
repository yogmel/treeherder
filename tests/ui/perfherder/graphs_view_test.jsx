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
// import { summaryStatusMap } from '../../../ui/perfherder/constants';
import repos from '../mock/repositories';
import testData from '../mock/performance_summary.json';
import seriesData from '../mock/performance_signature_formatted.json';

const frameworks = [{ id: 1, name: 'talos' }, { id: 2, name: 'build_metrics' }];
const platforms = ['linux64', 'windows10-64', 'windows7-32'];

const updates = {
  filteredData: [],
  loading: false,
  relatedTests: [],
  seriesData,
  showNoRelatedTests: false,
};

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
      getSeriesData={() => Promise.resolve(updates).then(resp => resp)}
    />,
  );

afterEach(cleanup);

// Tests:
// testDataModal is opened when add test data is clicked
// testDataModal shows all tests in Tests text area except for what's in legend (testData)
// changing a dropdown updates Test list
// clicking on a test adds it to selectedTests
// clicking submit closes the modal

test('Tests section in Test Data Modal only shows tests not already displayed in graph', async () => {
  const {
    getByText,
    getByTestId,
    queryByTestId,
    getByTitle,
    getByLabelText,
  } = graphsViewControls();

  fireEvent.click(getByText('Add test data'));

  const testDataModal = getByText('Add Test Data');
  expect(testDataModal).toBeInTheDocument();

  // this test is already displayed (testData prop) in the legend and graph
  const existingTest = queryByTestId(testData[0].signature_id.toString());
  expect(existingTest).not.toBeInTheDocument();

  fireEvent.click(getByLabelText('Close'));

  await wait(() => expect(testDataModal).not.toBeInTheDocument());
});

test('Selecting a test in the Test Data Modal adds it to Selected Tests section; deselecting a test from Selected Tests removes it', async () => {
  const {
    getByText,
    getByTestId,
    queryByTestId,
    getByTitle,
  } = graphsViewControls();

  fireEvent.click(getByText('Add test data'));

  const testDataModal = getByText('Add Test Data');
  expect(testDataModal).toBeInTheDocument();

  const tests = getByTestId('tests');
  const selectedTests = getByTestId('selectedTests');

  const testToSelect = await waitForElement(() =>
    getByText('about_preferences_basic opt e10s stylo'),
  );
  fireEvent.click(testToSelect);

  const fullTestToSelect = await waitForElement(() =>
    getByText('mozilla-central linux64 about_preferences_basic opt e10s stylo'),
  );
  fireEvent.click(fullTestToSelect);

  expect(selectedTests).not.toContain(fullTestToSelect);
});

// const platform = getByTitle('Platform');
// fireEvent.click(platform);

// const windowsPlatform = await waitForElement(() => getByText('windows7-32'));

// fireEvent.click(windowsPlatform);

// // this test is already displayed (testData prop) in the legend and graph
// const existingTest = queryByTestId(testData[0].signature_id.toString());
// expect(existingTest).not.toBeInTheDocument();

// [
//   {
//     "signature_id": 1538924,
//     "framework_id": 1,
//     "signature_hash": "0195bad4939abd449c7df2e378d2d48ddd44b850",
//     "platform": "windows7-32",
//     "test": "",
//     "suite": "a11yr",
//     "lower_is_better": true,
//     "has_subtests": true,
//     "values": [],
//     "name": "a11yr opt e10s stylo",
//     "parent_signature": null,
//     "job_ids": [],
//     "repository_name": "mozilla-central",
//     "repository_id": 1,
//     "data": [
//       {
//         "job_id": 260662767,
//         "id": 885847730,
//         "value": 184.71214284477998,
//         "push_timestamp": "2019-08-08T19:45:27",
//         "push_id": 529266,
//         "revision": "dfac7f4ddfae815ea9077956ce3152bd36944bf6"
//       },
//       {
//         "job_id": 260682974,
//         "id": 885961753,
//         "value": 178.8999722067793,
//         "push_timestamp": "2019-08-08T21:45:31",
//         "push_id": 529383,
//         "revision": "82ce76b8a96bf452161facafd14dbadef88d52fe"
//       },
//       {
//         "job_id": 260686085,
//         "id": 885982117,
//         "value": 182.29620836231172,
//         "push_timestamp": "2019-08-08T21:49:29",
//         "push_id": 529386,
//         "revision": "8dd0375cfaf81d140c19c98f8a9dda28b9a201c1"
//       },
//       {
//         "job_id": 260736993,
//         "id": 886348055,
//         "value": 177.68687696638492,
//         "push_timestamp": "2019-08-09T03:49:20",
//         "push_id": 529561,
//         "revision": "047e16b38566f319ee1a9d566dc9b7e7c82bdd7d"
//       },
//       {
//         "job_id": 260771969,
//         "id": 886581612,
//         "value": 185.17599200756257,
//         "push_timestamp": "2019-08-09T09:56:11",
//         "push_id": 529727,
//         "revision": "36c3240e5cafd7b57146bab3b177bfa47f42bcfa"
//       },
//       {
//         "job_id": 260874809,
//         "id": 887173073,
//         "value": 179.6875756658438,
//         "push_timestamp": "2019-08-09T21:56:59",
//         "push_id": 530260,
//         "revision": "2909b0a1eb06cc34ce0a11544e5e6826aba87c06"
//       },
//       {
//         "job_id": 260878218,
//         "id": 887197802,
//         "value": 179.41618552668706,
//         "push_timestamp": "2019-08-09T21:57:48",
//         "push_id": 530261,
//         "revision": "3afb892abb74c6d281f3e66431408cbb2e16b8c4"
//       }
//     ]
//   }
// ]
