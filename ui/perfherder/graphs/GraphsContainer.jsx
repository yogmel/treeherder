import React from 'react';
import { Row } from 'reactstrap';
import MG from 'metrics-graphics';
// TODO import at top-level of apps
import 'metrics-graphics/dist/metricsgraphics.css';

const mainSpecs = {
  data: [],
  top: 70,
  width: 600,
  height: 200,
  right: 40,
  // missing_is_hidden: true,
  target: '#graph',
  brush: 'xy',
  chart_type: 'point',
};
const overviewSpecs = {
  data: [],
  width: 600,
  height: 50,
  top: 8,
  bottom: 0,
  right: 40,
  // missing_is_hidden: true,
  target: '#overview-plot',
  brush: 'xy',
  zoom_target: mainSpecs,
  showActivePoint: false,
};

const GraphsContainer = ({ data }) => {
  if (data.length) {
    mainSpecs.data = data;
    overviewSpecs.data = data;
    MG.data_graphic(mainSpecs);
    MG.data_graphic(overviewSpecs);
  }

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
  data: PropTypes.arrayOf(PropTypes.shape({})),
}

export default GraphsContainer;
