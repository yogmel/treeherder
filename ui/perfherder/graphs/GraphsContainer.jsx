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
      highlights: [],
    };
  }

  componentDidMount() {
    this.addHighlights();
  }

  componentDidUpdate(prevProps) {
    const { zoom, highlightAlerts, highlightedRevisions } = this.props;
    if (prevProps.zoom !== zoom) {
      this.setState({ zoomDomain: zoom, selectedDomain: zoom });
    }

    if (
      prevProps.highlightAlerts !== highlightAlerts ||
      prevProps.highlightedRevisions !== highlightedRevisions
    ) {
      this.addHighlights();
    }
  }

  // TODO refactor/cleanup this function and change the style of data points for alerts
  // and revisions (flip so fill is solid and stroke-opacity has a value)
  addHighlights = () => {
    const { testData, highlightAlerts, highlightedRevisions } = this.props;
    const highlights = [];

    for (const series of testData) {
      if (!series.visible) {
        continue;
      }

      if (highlightAlerts) {
        series.relatedAlertSummaries.forEach(alertSummary => {
          const dataPoint = series.data.find(
            item => item.revision === alertSummary.revision,
          );
          if (dataPoint) {
            highlights.push(dataPoint);
          }
        });
      }

      for (const rev of highlightedRevisions) {
        if (!rev) {
          continue;
        }
        // in case people are still using 12 character sha
        const dataPoint = series.data.find(
          item => item.revision.indexOf(rev) !== -1,
        );

        if (dataPoint) {
          highlights.push(dataPoint);
        }
      }
    }
    // create a set
    this.setState({ highlights });
  };

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
    const { zoomDomain, selectedDomain, highlights } = this.state;
    console.log(testData, highlights);
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
                    stroke: data => console.log(data.revision),
                    strokeWidth: 2,
                  },
                }}
                size={2}
                data={item.visible ? item.data : []}
              />
            ))}
            {highlights.length > 0 &&
              highlights.map(item => (
                <VictoryLine
                  key={item}
                  style={{
                    data: { stroke: 'secondary', strokeWidth: 1 },
                  }}
                  x={() => item.x}
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
  highlightAlerts: PropTypes.bool,
  highlightedRevisions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

GraphsContainer.defaultProps = {
  testData: [],
  zoom: {},
  // selectedDataPoint: null,
  highlightAlerts: true,
  highlightedRevisions: ['', ''],
};

export default GraphsContainer;
