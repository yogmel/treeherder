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
    // zoomGraph functionality - set the props for min, max values of xScale and yScale
    // highlightAlerts and highlightedRevisons:
    // - veritical line (markers): https://nivo.rocks/storybook/?path=/story/line--adding-markers
    // - doesn't seem to have a 'highlight' function, only customized points: https://nivo.rocks/storybook/?path=/story/line--custom-point-symbol
    // selecting a point should also highlight it

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
                format: 'native',
                precision: 'day',
                min: 'auto',
                max: 'auto',
              }}
              yScale={{ type: 'linear', min: 'auto' , max: 'auto' }}
              gridYValues={5}
              axisLeft={{ tickValues: 5 }}
              stacked={false}
              curve="linear"
              axisBottom={{
                orient: 'bottom',
                format: '%b %d',
                tickValues: 'every day',
              }}
              lineWidth={0}
              colors={['blue', 'green']}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
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
