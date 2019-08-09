/* eslint-disable react/no-did-update-set-state
 */
import React from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryBrushContainer,
  VictoryScatter,
  VictoryZoomContainer,
} from 'victory';
import moment from 'moment';
import debounce from 'lodash/debounce';
import last from 'lodash/last';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { graphColors } from '../constants';
import SimpleTooltip from '../../shared/SimpleTooltip';

import GraphTooltip from './GraphTooltip';

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.updateZoom = debounce(this.updateZoom.bind(this), 500);
    this.updateSelection = debounce(this.updateSelection.bind(this), 500);
    this.hideTooltip = debounce(this.hideTooltip.bind(this), 250);
    this.tooltip = React.createRef();
    this.leftChartPadding = 25;
    this.state = {
      selectedDomain: this.props.zoom,
      highlights: [],
      scatterPlotData: this.props.testData.flatMap(item =>
        item.visible ? item.data : [],
      ),
      entireDomain: this.getEntireDomain(),
      showTooltip: false,
      lockTooltip: false,
      fullSelectedDataPoint: null,
    };
  }

  componentDidMount() {
    this.addHighlights();
    this.updateData();
    const { selectedDataPoint } = this.props;
    if (selectedDataPoint) this.showTooltip(selectedDataPoint, true);
  }

  componentDidUpdate(prevProps) {
    const {
      zoom,
      highlightAlerts,
      highlightedRevisions,
      testData,
    } = this.props;

    if (prevProps.zoom !== zoom) {
      this.setState({ selectedDomain: zoom });
    }

    if (
      prevProps.highlightAlerts !== highlightAlerts ||
      prevProps.highlightedRevisions !== highlightedRevisions
    ) {
      this.addHighlights();
    }

    if (prevProps.testData !== testData) {
      this.updateGraphs();
    }
  }

  updateGraphs = () => {
    const { testData, updateStateParams } = this.props;
    const entireDomain = this.getEntireDomain();
    const scatterPlotData = testData.flatMap(item =>
      item.visible ? item.data : [],
    );
    this.addHighlights();
    this.setState({
      entireDomain,
      selectedDomain: {},
      scatterPlotData,
    });
    updateStateParams({ zoom: {} });
  };

  getEntireDomain = () => {
    const { testData } = this.props;
    const data = testData.flatMap(item => (item.visible ? item.data : []));
    const yValues = data.map(item => item.y);

    if (!data.length) {
      return {};
    }
    return {
      y: [Math.min(...yValues), Math.max(...yValues)],
      x: [data[0].x, last(data).x],
    };
  };

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

  getTooltipPosition = (point, yOffset = 15) => ({
    left: point.x - 280 / 2,
    top: point.y - yOffset,
  });

  showTooltip = (dataPoint, lock) => {
    const position = this.getTooltipPosition(dataPoint);
    this.hideTooltip.cancel();
    this.tooltip.current.style.cssText = `left: ${position.left}px; top: ${position.top}px;`;

    this.setState({
      showTooltip: true,
      lockTooltip: lock,
      fullSelectedDataPoint: dataPoint
    });
  };

  setTooltip = (dataPoint, lock = false) => {
    const { lockTooltip } = this.state;
    const { updateStateParams } = this.props;

    // we don't want the mouseOver event to reposition the tooltip
    if (lockTooltip && !lock) {
      return;
    }
    this.showTooltip(dataPoint, lock);

    updateStateParams({
      selectedDataPoint: {
        signature_id: dataPoint.datum.signature_id,
        pushId: dataPoint.datum.pushId,
        x: dataPoint.x,
        y: dataPoint.y,
      },
    });
  };

  closeTooltip = () => {
    this.setState({
      showTooltip: false,
      lockTooltip: false,
    });
    this.props.updateStateParams({ selectedDataPoint: null });
  };

  // The Victory library doesn't provide a way of dynamically setting the left
  // padding for the y axis tick labels, so this is a workaround (setting state
  // doesn't work with this callback, which is why a class property is used instead)
  setLeftPadding = (tick, index, ticks) => {
    const highestTickLength = ticks[ticks.length - 1].toString();
    this.leftChartPadding = highestTickLength.length * 8 + 10;
    const numberFormat = new Intl.NumberFormat();

    return numberFormat.format(tick);
  };

  updateData() {
    const { selectedDomain } = this.state;
    const { testData } = this.props;

    // we do this (along with debouncing updateSelection and updateZoom)
    // to make zooming faster by removing unneeded data points based on
    // the updated selectedDomain
    if (selectedDomain.x && selectedDomain.y) {
      const scatterPlotData = testData
        .flatMap(item => (item.visible ? item.data : []))
        .filter(
          data =>
            data.x >= selectedDomain.x[0] &&
            data.x <= selectedDomain.x[1] &&
            data.y >= selectedDomain.y[0] &&
            data.y <= selectedDomain.y[1],
        );
      this.setState({ scatterPlotData });
    }
  }

  checkTooltip = (selectedDomain, updates) => {
    const { fullSelectedDataPoint } = this.state;
    const { updateStateParams } = this.props;
    const { stateUpdates, paramUpdates } = updates;

    if (fullSelectedDataPoint && ((fullSelectedDataPoint.datum.x < selectedDomain.x[0] ||
      fullSelectedDataPoint.datum.x > selectedDomain.x[1]) ||
      (fullSelectedDataPoint.datum.y < selectedDomain.y[0] ||
      fullSelectedDataPoint.datum.y > selectedDomain.y[1])))
    {
      paramUpdates.selectedDataPoint = null;
      stateUpdates.showTooltip = false;
      stateUpdates.lockTooltip = false;
    }
    return [stateUpdates, paramUpdates];
  }

  // debounced
  hideTooltip() {
    const { showTooltip, lockTooltip } = this.state;

    if (showTooltip && !lockTooltip) {
      this.setState({ showTooltip: false });
    }
  }

  // debounced
  updateSelection(selectedDomain) {
    let stateUpdates = { selectedDomain };
    let paramUpdates = {
      zoom: selectedDomain,
    };

    ([stateUpdates, paramUpdates]) = this.checkTooltip(selectedDomain, [stateUpdates, paramUpdates]);
    this.props.updateStateParams(paramUpdates);
    this.checkTooltip(selectedDomain)
    this.setState(
      stateUpdates,
      this.updateData,
    );
  }

  // debounced
  updateZoom(zoom) {
    this.props.updateStateParams({ zoom });
  }

  render() {
    const {
      testData,
      zoom,
      selectedDataPoint,
      highlightedRevisions,
    } = this.props;
    const {
      selectedDomain,
      highlights,
      scatterPlotData,
      entireDomain,
      showTooltip,
      lockTooltip,
    } = this.state;

    const highlightPoints = Boolean(highlights.length);

    const hasHighlightedRevision = point =>
      highlightedRevisions.find(rev => point.revision.indexOf(rev) !== -1);

    const axisStyle = {
      grid: { stroke: 'lightgray', strokeWidth: 0.5 },
      tickLabels: { fontSize: 13 },
    };

    const chartPadding = { top: 10, right: 10, bottom: 50 };
    chartPadding.left = this.leftChartPadding;

    return (
      <React.Fragment>
        <div
          id="graph-tooltip"
          className={`${showTooltip ? 'show' : 'hide'} ${
            lockTooltip ? 'locked' : ''
          }`}
          ref={this.tooltip}
        >
          <span className="close mr-3 my-2 ml-2" onClick={this.closeTooltip}>
            <FontAwesomeIcon
              className="pointer text-white"
              icon={faTimes}
              size="xs"
              title="close tooltip"
            />
          </span>
          {selectedDataPoint && showTooltip && (
            <GraphTooltip
              selectedDataPoint={selectedDataPoint}
              testData={testData}
              {...this.props}
            />
          )}
          <div className="tip" />
        </div>
        <Row>
          <VictoryChart
            padding={chartPadding}
            width={1250}
            height={125}
            scale={{ x: 'time', y: 'linear' }}
            domain={entireDomain}
            domainPadding={{ y: 30 }}
            containerComponent={
              <VictoryBrushContainer
                responsive={false}
                brushDomain={selectedDomain}
                onBrushDomainChange={this.updateZoom}
              />
            }
          >
            <VictoryAxis dependentAxis tickCount={4} style={axisStyle} />
            <VictoryAxis
              tickCount={10}
              tickFormat={x => moment.utc(x).format('MMM DD')}
              style={axisStyle}
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
          <Col className="pl-0">
            <SimpleTooltip
              text={
                <FontAwesomeIcon
                  className="pointer text-secondary"
                  icon={faQuestionCircle}
                  size="sm"
                />
              }
              tooltipText="The bottom graph has mouse zoom and pan (click 'n' drag) enabled. For best results, when there's a high concentration of data points use the overview graph's selection marquee to narrow the x and y range first."
            />
          </Col>
        </Row>

        <Row>
          <VictoryChart
            padding={chartPadding}
            width={1250}
            height={350}
            scale={{ x: 'time', y: 'linear' }}
            domain={entireDomain}
            domainPadding={{ y: 40 }}
            containerComponent={
              <VictoryZoomContainer
                responsive={false}
                zoomDomain={zoom}
                onZoomDomainChange={this.updateSelection}
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
                  fill: data =>
                    (data.alertSummary || hasHighlightedRevision(data)) &&
                    highlightPoints
                      ? data.z
                      : '#fff',
                  strokeOpacity: data =>
                    (data.alertSummary || hasHighlightedRevision(data)) &&
                    highlightPoints
                      ? 0.3
                      : 100,
                  stroke: d => d.z,
                  strokeWidth: data =>
                    (data.alertSummary || hasHighlightedRevision(data)) &&
                    highlightPoints
                      ? 12
                      : 2,
                },
              }}
              size={() => 5}
              data={scatterPlotData}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: 'data',
                          mutation: props => this.setTooltip(props, true),
                        },
                      ];
                    },
                    onMouseOver: () => {
                      return [
                        {
                          target: 'data',
                          mutation: props => this.setTooltip(props),
                        },
                      ];
                    },
                    onMouseOut: () => {
                      return [
                        {
                          target: 'data',
                          callback: this.hideTooltip,
                        },
                      ];
                    },
                  },
                },
              ]}
            />
            <VictoryAxis
              dependentAxis
              tickCount={9}
              style={axisStyle}
              tickFormat={this.setLeftPadding}
            />
            <VictoryAxis
              tickCount={8}
              tickFormat={x => moment.utc(x).format('MMM DD hh:mm')}
              style={axisStyle}
              fixLabelOverlap
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
  selectedDataPoint: PropTypes.shape({}),
  highlightAlerts: PropTypes.bool,
  highlightedRevisions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

GraphsContainer.defaultProps = {
  testData: [],
  zoom: {},
  selectedDataPoint: undefined,
  highlightAlerts: true,
  highlightedRevisions: ['', ''],
};

export default GraphsContainer;
