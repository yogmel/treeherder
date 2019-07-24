import React from 'react';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';
import $ from 'jquery';

const GraphsContainer = ({ testData }) => {
  const plot = $.plot($('#graph'), testData.map(series => series.flotSeries), {
    xaxis: { mode: 'time' },
    series: { shadowSize: 0 },
    selection: { mode: 'xy', color: '#97c6e5' },
    lines: { show: false },
    points: { show: true },
    legend: { show: false },
    grid: {
      color: '#cdd6df',
      borderWidth: 2,
      backgroundColor: '#fff',
      hoverable: true,
      clickable: true,
      autoHighlight: false,
      // markings,
    },
  });
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
};

GraphsContainer.propTypes = {
  testData: PropTypes.arrayOf(PropTypes.shape({})),
};

GraphsContainer.defaultProps = {
  testData: [],
};

export default GraphsContainer;
