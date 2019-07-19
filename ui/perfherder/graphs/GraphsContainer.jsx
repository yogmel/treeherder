import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'reactstrap';
import { ResponsiveLine } from '@nivo/line';

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { testData } = this.props;

    return (
      <React.Fragment>
        <Row>
          <div id="overview-plot" />
        </Row>
        <Row>
          <div id="test-graph">
            <ResponsiveLine
              data={testData}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{
                type: 'time',
                format: '%Y-%m-%dT%H:%M:%S',
                precision: 'day',
              }}
              gridYValues={[0, 50, 100, 150, 200, 250, 300, 350]}
              axisLeft={{ tickValues: [0, 50, 100, 150, 200, 250, 300, 350] }}
              stacked={false}
              curve="linear"
              axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -90,
                legend: 'time',
                legendOffset: 110,
                legendPosition: 'middle',
                format: '%Y-%m-%d',
                tickValues: 'every day'
              }}
              lineWidth={0}
              pointSize={6}
              pointBorderWidth={1}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabel="y"
              pointLabelYOffset={-12}
            />
          </div>
        </Row>
      </React.Fragment>
    );
  }
}

GraphsContainer.propTypes = {
  timeRange: PropTypes.shape({}).isRequired,
  $stateParams: PropTypes.shape({
    zoom: PropTypes.string,
    highlightRevisions: PropTypes.string,
    select: null,
    series: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    highlightAlerts: PropTypes.string,
    highlightedRevisions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
};

GraphsContainer.defaultProps = {
  $stateParams: undefined,
};

export default GraphsContainer;
