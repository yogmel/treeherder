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
import last from 'lodash/last';

import { graphColors } from '../constants';

const VictoryZoomVoronoiContainer = createContainer('zoom', 'voronoi');

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.updateZoom = debounce(this.updateZoom.bind(this), 500);
    this.updateSelection = debounce(this.updateSelection.bind(this), 500);
    this.state = {
      selectedDomain: this.props.zoom,
      zoomDomain: this.props.zoom,
      highlights: [],
      scatterPlotData: this.props.testData.flatMap(item =>
        item.visible ? item.data : [],
      ),
      entireDomain: this.getEntireDomain(),
    };
  }

  componentDidMount() {
    this.updateData();
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

  getEntireDomain = () => {
    const { testData } = this.props;
    const data = testData.flatMap(item => (item.visible ? item.data : []));
    const yValues = data.map(item => item.y);

    const entireDomain = {
      y: [Math.min(...yValues), Math.max(...yValues)],
      x: [data[0].x, last(data).x],
    };
    return entireDomain;
  };

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

  updateData() {
    const { selectedDomain: zoomDomain } = this.state;
    const { testData } = this.props;

    if (zoomDomain.x && zoomDomain.y) {
      const scatterPlotData = testData
        .flatMap(item => (item.visible ? item.data : []))
        .filter(
          data =>
            data.x >= zoomDomain.x[0] &&
            data.x <= zoomDomain.x[1] &&
            data.y >= zoomDomain.y[0] &&
            data.y <= zoomDomain.y[1],
        );
      this.setState({ scatterPlotData });
    }
  }

  updateSelection(selectedDomain) {
    this.setState({ selectedDomain }, this.updateData);
  }

  // TODO remove local zoomDomain state
  updateZoom(zoomDomain) {
    this.setState({ zoomDomain });
    this.props.updateStateParams({ zoom: zoomDomain });
  }

  render() {
    const { testData } = this.props;
    const {
      zoomDomain,
      selectedDomain,
      highlights,
      scatterPlotData,
      entireDomain,
    } = this.state;

    const yValues = scatterPlotData.map(item => item.y);

    return (
      <React.Fragment>
        <Row>
          <VictoryChart
            padding={{ top: 10, left: 50, right: 50, bottom: 30 }}
            width={1200}
            height={125}
            scale={{ x: 'time', y: 'linear' }}
            domain={{ y: [Math.min(...yValues), Math.max(...yValues)] }}
            domainPadding={{ y: 30 }}
            containerComponent={
              <VictoryBrushContainer
                responsive={false}
                brushDomain={selectedDomain}
                onBrushDomainChange={this.updateZoom}
              />
            }
          >
            <VictoryAxis
              dependentAxis
              tickCount={5}
              style={{
                grid: { stroke: 'lightgray', strokeWidth: 0.5 },
              }}
            />
            <VictoryAxis
              tickCount={10}
              tickFormat={x => moment(x).format('MMM DD')}
              style={{
                grid: { stroke: 'lightgray', strokeWidth: 0.5 },
              }}
            />
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
            domain={entireDomain}
            domainPadding={{ y: 40 }}
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
                    data: { stroke: 'gray', strokeWidth: 1 },
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
              data={scatterPlotData}
            />
            <VictoryAxis
              dependentAxis
              tickCount={9}
              style={{
                grid: { stroke: 'lightgray', strokeWidth: 0.5 },
              }}
            />
            <VictoryAxis
              tickCount={10}
              tickFormat={x => moment(x).format('MMM DD')}
              style={{
                grid: { stroke: 'lightgray', strokeWidth: 0.5 },
              }}
            />
          </VictoryChart>
        </Row>
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
