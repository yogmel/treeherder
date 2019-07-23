import React from 'react';
import PropTypes from 'prop-types';
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
  target: '',
  x_accessor: 'x',
  y_accessor: 'y',
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
  target: '',
  x_accessor: 'x',
  y_accessor: 'y',
  brush: 'x',
  zoom_target: '',
  showActivePoint: false,
};

class GraphsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.main = React.createRef();
    this.overview = React.createRef();
    this.state = {
      data: this.props.testData.map(item => item.data),
    };
  }

  componentDidMount() {
    this.updateSpecs(this.main.current, mainSpecs);
    overviewSpecs.zoom_target = mainSpecs;
    this.updateSpecs(this.overview.current, overviewSpecs);
  }
  // componentDidUpdate() {
  //   const { specs, data } = this.props;
  //   if (specs.data !== data) {
  //     specs.data = data;
  //     MG.data_graphic(specs);
  //   }
  // }

  updateSpecs = (element, specs) => {
    const { data } = this.state;
    specs.target = element;
    specs.data = data;
    MG.data_graphic(specs);
  };

  render() {
    return (
      <React.Fragment>
        <Row>
          <div className="mx-auto pb-3" ref={this.overview} />
        </Row>

        <Row>
          <div className="mx-auto pb-3" ref={this.main} />
        </Row>
      </React.Fragment>
    );
  }
}

GraphsContainer.propTypes = {
  testData: PropTypes.arrayOf(PropTypes.shape({})),
};

export default GraphsContainer;
