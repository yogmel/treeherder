import React from 'react';
import MG from 'metrics-graphics';
import 'metrics-graphics/dist/metricsgraphics.css';
import PropTypes from 'prop-types';

// Pass a specs object and data array as props;
// specs.target will be updated with a ref callback and
// specs.data will be updated with your data prop
// const yourSpecs = {
//     title: 'your title',
//     data: [],
//     target: '',
//     width: 700,
//     height: 300,
//     x_accessor: 'date',
//     y_accessor: 'value'
// };
// const main = {
//   title: "Overview Plot",
//   description: "This is a simple example of an overview plot. You can create an overview plot by creating another chart with 'zoom_target' option and then setting it as the object of the main chart.",
//   data: data,
//   top: 70,
//   width: 600,
//   height: 200,
//   right: 40,
//   missing_is_hidden: true,
//   target: '#main',
//   brush: 'xy',
// }
// MG.data_graphic(main);
// MG.data_graphic({
//   data: data,
//   width: 600,
//   height: 50,
//   top: 8,
//   bottom: 0,
//   right: 40,
//   missing_is_hidden: true,
//   target: '#overview_plot',
//   brush: 'x',
//   zoom_target: main,
//   x_axis: false,
//   y_axis: false,
//   showActivePoint: false,
// });
export default class Graphs extends React.Component {
  componentDidUpdate() {
    const { specs, data } = this.props;
    if (specs.data !== data) {
      specs.data = data;
      MG.data_graphic(specs);
    }
  }

  updateSpecs(element) {
    if (element) {
      const { specs, data } = this.props;

      specs.target = element;
      specs.data = data;
      MG.data_graphic(specs);
    }
  }

  render() {
    return (
      <div className="mx-auto pb-3" ref={ele => this.updateSpecs(ele)}>
        {this.props.specs.legend && <div className="legend" />}
      </div>
    );
  }
}

Graphs.propTypes = {
  specs: PropTypes.shape({
    legend: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }).isRequired,
  data: PropTypes.oneOfType([
    PropTypes.shape({}),
    PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.shape({ Date: PropTypes.string }),
        value: PropTypes.number,
      }),
    ),
    PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.shape({ Date: PropTypes.string }),
          value: PropTypes.number,
        }),
      ),
      PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.shape({ Date: PropTypes.string }),
          value: PropTypes.number,
        }),
      ),
    ),
  ]),
};

Graphs.defaultProps = {
  data: null,
};
