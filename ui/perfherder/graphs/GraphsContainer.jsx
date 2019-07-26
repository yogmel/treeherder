import React from 'react';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // const markings = [];
  // const addHighlightedDatapoint = (series, resultSetId) => {
  //   // add a vertical line where alerts are, for extra visibility
  //   const index = series.flotSeries.resultSetData.indexOf(resultSetId);
  //   if (index !== -1) {
  //     markings.push({
  //       color: '#ddd',
  //       lineWidth: 1,
  //       xaxis: {
  //         from: series.flotSeries.data[index][0],
  //         to: series.flotSeries.data[index][0],
  //       },
  //     });
  //   }
  //   // TODO not working
  //   // highlight the datapoints too
  //   series.highlightedPoints = [
  //     ...new Set([
  //       ...series.highlightedPoints,
  //       ...series.flotSeries.resultSetData
  //         .map((seriesResultSetId, index) =>
  //           resultSetId === seriesResultSetId ? index : null,
  //         )
  //         .filter(v => v),
  //     ]),
  //   ];
  // };

  // // highlight points which correspond to an alert or revision
  // for (const series of testData) {
  //   if (!series.visible) {
  //     continue;
  //   }

  //   if (highlightAlerts) {
  //     series.relatedAlertSummaries.forEach(alertSummary => {
  //       addHighlightedDatapoint(series, alertSummary.push_id);
  //     });
  //   }

  //   // Can this be done a better way? if we have revisions we
  //   // don't need to look for the push id
  //   for (const rev of highlightedRevisions) {
  //     if (!rev) {
  //       continue;
  //     }
  //     // in case people are still use 12 character revisions
  //     const dataPoint = series.data.find(
  //       item => item.revision.indexOf(rev) !== -1,
  //     );

  //     if (dataPoint) {
  //       addHighlightedDatapoint(series, dataPoint.push_id);
  //     }
  //   }
  // }

  // $.plot($('#graph'), testData.map(series => series.flotSeries), {
  //   xaxis: { mode: 'time' },
  //   series: { shadowSize: 0 },
  //   selection: { mode: 'xy', color: '#97c6e5' },
  //   lines: { show: false },
  //   points: { show: true },
  //   legend: { show: false },
  //   grid: {
  //     color: '#cdd6df',
  //     borderWidth: 2,
  //     backgroundColor: '#fff',
  //     hoverable: true,
  //     clickable: true,
  //     autoHighlight: false,
  //     markings,
  //   },
  // });

  render() {
    const {
      testData,
      zoom,
      highlightAlerts,
      highlightedRevisions,
      selectedDataPoint,
    } = this.props;
    return (
      <React.Fragment>
        <Row>
          <div id="overview-plot" />
        </Row>
        <Row>
          <div id="graph" />
        </Row>
      </React.Fragment>
    );
  }
}

GraphsContainer.propTypes = {
  testData: PropTypes.arrayOf(PropTypes.shape({})),
  zoom: PropTypes.shape({}),
  selectedDataPoint: PropTypes.string,
  highlightAlerts: PropTypes.bool,
  highlightedRevisions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

GraphsContainer.defaultProps = {
  testData: [],
  zoom: {},
  selectedDataPoint: null,
  highlightAlerts: true,
  highlightedRevisions: ['', ''],
};

export default GraphsContainer;
