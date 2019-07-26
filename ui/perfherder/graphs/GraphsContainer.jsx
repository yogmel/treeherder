import React from 'react';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryBrushContainer,
  VictoryZoomContainer,
  VictoryTheme,
} from 'victory';

import { graphColors } from '../constants';

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedDomain: {},
      // zoomDomain: {},
    };
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
      //   zoom,
      //   highlightAlerts,
      //   highlightedRevisions,
      //   selectedDataPoint,
    } = this.props;
    const { zoomDomain, selectedDomain } = this.state;

    return (
      <React.Fragment>
        <Row>
          <VictoryChart
            padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
            width={600}
            height={90}
            scale={{ x: 'time', y: 'value' }}
            containerComponent={
              <VictoryBrushContainer
                responsive={false}
                brushDimension="x"
                brushDomain={selectedDomain}
                onBrushDomainChange={zoomDomain =>
                  this.setState({ zoomDomain })
                }
              />
            }
          >
            <VictoryAxis
            // tickValues={[
            //   new Date(1985, 1, 1),
            //   new Date(1990, 1, 1),
            //   new Date(1995, 1, 1),
            //   new Date(2000, 1, 1),
            //   new Date(2005, 1, 1),
            //   new Date(2010, 1, 1),
            // ]}
            // tickFormat={x => new Date(x).getFullYear()}
            />
            {testData.map((item, i) => (
              <VictoryLine
                key={item.name}
                data={item.data}
                style={{
                  data: { stroke: graphColors[i][1] },
                }}
              />
            ))}
          </VictoryChart>
        </Row>

        <Row>
          <VictoryChart
            width={600}
            height={350}
            scale={{ x: 'time', y: 'value' }}
            containerComponent={
              <VictoryZoomContainer
                responsive={false}
                zoomDimension="x"
                zoomDomain={zoomDomain}
                onZoomDomainChange={selectedDomain =>
                  this.setState({ selectedDomain })
                }
              />
            }
          >
            {testData.map((item, i) => (
              <VictoryLine
                key={item.name}
                style={{
                  data: { stroke: graphColors[i][1] },
                }}
                data={item.data}
              />
            ))}
          </VictoryChart>
        </Row>
        {/* <Row>
          <div id="overview-plot" />
        </Row>
        <Row>
          <div id="graph" />
        </Row> */}
      </React.Fragment>
    );
  }
}

GraphsContainer.propTypes = {
  testData: PropTypes.arrayOf(PropTypes.shape({})),
  // zoom: PropTypes.shape({}),
  // selectedDataPoint: PropTypes.string,
  // highlightAlerts: PropTypes.bool,
  // highlightedRevisions: PropTypes.oneOfType([
  //   PropTypes.string,
  //   PropTypes.arrayOf(PropTypes.string),
  // ]),
};

GraphsContainer.defaultProps = {
  testData: [],
  // zoom: {},
  // selectedDataPoint: null,
  // highlightAlerts: true,
  // highlightedRevisions: ['', ''],
};

export default GraphsContainer;
