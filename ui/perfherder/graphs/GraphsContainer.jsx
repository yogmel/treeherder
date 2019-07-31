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
  VictoryScatter,
  createContainer,
} from 'victory';
import moment from 'moment';
import debounce from 'lodash/debounce';

import { graphColors } from '../constants';

const VictoryZoomVoronoiContainer = createContainer('zoom', 'voronoi');

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    // this.updateSelection = debounce(this.updateSelection.bind(this), 1000);
    // this.updateZoom = debounce(this.updateZoom.bind(this), 1000);
    this.updateSelection = this.updateSelection.bind(this);
    this.updateZoom = this.updateZoom.bind(this);

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

  // TODO add ? icon to chart to explain how zoom/pan works?
  addHighlights = () => {
    const { testData, highlightAlerts, highlightedRevisions } = this.props;
    let highlights = [];

    for (const series of testData) {
      if (!series.visible) {
        continue;
      }

      if (highlightAlerts) {
        const dataPoints = series.data.filter(item => item.alertSummary);
        highlights = [...highlights, ...dataPoints];
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
    this.setState({ highlights });
  };

  updateSelection(selectedDomain) {
    this.setState({ selectedDomain });
  }

  updateZoom(zoomDomain) {
    this.setState({ zoomDomain });
    this.props.updateStateParams({ zoom: zoomDomain });
  }

  render() {
    const { testData } = this.props;
    const { zoomDomain, selectedDomain, highlights } = this.state;

    const scatterData = testData.flatMap(item => item.visible ? item.data : []);
    const yValues = scatterData.map(item => item.y);
    return (
      <React.Fragment>
        <Row>
          <VictoryChart
            padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
            width={1200}
            height={100}
            scale={{ x: 'time', y: 'linear' }}
            containerComponent={
              <VictoryBrushContainer
                responsive={false}
                brushDomain={selectedDomain}
                onBrushDomainChange={this.updateZoom}
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
            width={1200}
            height={350}
            scale={{ x: 'time', y: 'linear' }}
            domain={{ y: [Math.min(...yValues), Math.max(...yValues)]}}        
            containerComponent={
              <VictoryZoomVoronoiContainer
                responsive={false}
                zoomDomain={zoomDomain}
                onZoomDomainChange={this.updateSelection}
                labels={d => `${d.x}, ${d.y}`}
              />
            }
          >
            {highlights.length > 0 &&
              highlights.map(item => (
                <VictoryLine
                  key={item}
                  style={{
                    data: { stroke: 'lightgray', strokeWidth: 1 },
                  }}
                  x={() => item.x}
                />
              ))}

            <VictoryScatter
              style={{
                data: {
                  fill: d => d.z,
                  fillOpacity: data => (data.alertSummary ? 100 : 0.3),
                  strokeOpacity: data => (data.alertSummary ? 0.3 : 100),
                  stroke: d => d.z,
                  strokeWidth: data => (data.alertSummary ? 12 : 2),
                },
              }}
              size={() => 3}
              data={scatterData}
            />
            {/* <VictoryAxis
              tickCount={10}
              tickFormat={x => moment(x).format('MMM DD')}
            /> */}
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
