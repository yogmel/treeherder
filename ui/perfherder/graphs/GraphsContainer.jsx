/* eslint-disable react/no-did-update-set-state
 */
import React from 'react';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryBrushContainer,
  VictoryZoomContainer,
  VictoryScatter,
} from 'victory';
import moment from 'moment';
import debounce from 'lodash/debounce';

import { graphColors } from '../constants';

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDomain: this.props.zoom,
      zoomDomain: this.props.zoom,
    };
  }

  componentDidUpdate(prevProps) {
    const { zoom } = this.props;
    if (prevProps.zoom !== zoom) {
      this.setState({ zoomDomain: zoom, selectedDomain: zoom });
    }
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

  // eslint-disable-next-line react/sort-comp
  updateZoomParams = debounce(
    () => this.props.updateStateParams({ zoom: this.state.zoomDomain }),
    1000,
  );

  render() {
    const {
      testData,
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
            width={935}
            height={100}
            scale={{ x: 'time', y: 'linear' }}
            containerComponent={
              <VictoryBrushContainer
                responsive={false}
                brushDimension="x"
                brushDomain={selectedDomain}
                onBrushDomainChange={zoomDomain =>
                  this.setState({ zoomDomain }, this.updateZoomParams)
                }
              />
            }
          >
            {testData.map((item, i) => (
              <VictoryLine
                key={item.name}
                data={item.visible ? item.data : []}
                style={{
                  data: { stroke: graphColors[i][1] },
                }}
              />
            ))}
          </VictoryChart>
        </Row>

        <Row>
          <VictoryChart
            width={935}
            height={300}
            scale={{ x: 'time', y: 'linear' }}
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
              <VictoryScatter
                key={item.name}
                style={{
                  data: {
                    fill: graphColors[i][1],
                    fillOpacity: 0.3,
                    stroke: graphColors[i][1],
                    strokeWidth: 2,
                  },
                }}
                size={1}
                data={item.visible ? item.data : []}
              />
            ))}
            <VictoryAxis
              tickCount={10}
              tickFormat={x => moment(x).format('MMM DD')}
            />
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
  updateStateParams: PropTypes.func.isRequired,
  zoom: PropTypes.shape({}),
  // selectedDataPoint: PropTypes.string,
  // highlightAlerts: PropTypes.bool,
  // highlightedRevisions: PropTypes.oneOfType([
  //   PropTypes.string,
  //   PropTypes.arrayOf(PropTypes.string),
  // ]),
};

GraphsContainer.defaultProps = {
  testData: [],
  zoom: {},
  // selectedDataPoint: null,
  // highlightAlerts: true,
  // highlightedRevisions: ['', ''],
};

export default GraphsContainer;
