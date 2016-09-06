import React, {Component, PropTypes} from 'react';
import Helmet from 'react-helmet';
import moment from 'moment';
import {connect} from 'react-redux';
import * as blocksActions from 'redux/modules/blocks';
import {isLoaded, load as loadBlocks} from 'redux/modules/blocks';
import { asyncConnect } from 'redux-async-connect';
import {
  RadialChart,
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  Crosshair
} from 'react-vis';

@asyncConnect([{
  deferred: true,
  promise: ({store: {dispatch, getState}}) => {
    if (!isLoaded(getState())) {
      return dispatch(loadBlocks());
    }
  }
}])
@connect(
  state => ({
    data: state.blocks.data,
    error: state.blocks.error,
    loading: state.blocks.loading
  }),
  {...blocksActions})
export default class Blocks extends Component {
  static propTypes = {
    data: PropTypes.object,
    error: PropTypes.object,
    loading: PropTypes.bool,
    load: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      crosshairValues: {
        blocksPerDay: [],
        transactionsPerBlockPerDay: [],
      }
    };
  }

  /**
   * Event handler for onNearestX.
   * @param {number} seriesIndex Index of the series.
   * @param {Object} value Selected value.
   * @private
   */
  _onNearestX(chartName, value) {
    this.setState({
      crosshairValues: {
        blocksPerDay: [{
          x: value.x,
          y: this.props.data.blocksPerDay.data.find(pt => pt.x === value.x).y
        }],
        transactionsPerBlockPerDay: [{
          x: value.x,
          y: this.props.data.transactionsPerBlockPerDay.data.find(pt => pt.x === value.x).y
        }],
      }
    });
  }

  /**
   * Event handler for onMouseLeave.
   * @private
   */
  _onMouseLeave() {
    this.setState({
      crosshairValues: {
        blocksPerDay: [],
        transactionsPerBlockPerDay: []
      }
    });
  }

  render() {
    const {data, error} = this.props;
    // let refreshClassName = 'fa fa-refresh';
    // if (loading) {
    //   refreshClassName += ' fa-spin';
    // }
    const styles = require('./Blocks.scss');
    return (
      <div className={styles.blocks + ' container'}>
        <h1>Blocks</h1>
        <Helmet title="Blocks"/>
        {error &&
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          {' '}
          {error.message || error}
        </div>}
        {data &&
        <div>
          <h4>{data.blocksPerDay.name}</h4>
          <XYPlot
            onMouseLeave={::this._onMouseLeave}
            width={600}
            height={300}
            xType="time-utc">
            <HorizontalGridLines />
            <VerticalGridLines />
            <LineSeries
              onNearestX={this._onNearestX.bind(this, 'blocksPerDay')}
              data={data.blocksPerDay.data} />
            <XAxis
              title="Day"
              labelFormat={(xVal) => moment(xVal).format('MMM YYYY')}
              labelValues={data.blocksPerDay.data.map((point) => point.x)}
              tickValues={data.blocksPerDay.data.map((point) => point.x)} />
            <YAxis title="# of blocks" />
            <Crosshair
              titleFormat={(values) => ({title: 'count', value: values[0].y})}
              itemsFormat={(values) => [
                {title: 'date', value: moment(values[0].x).format('MMM YYYY')}
              ]}
              values={this.state.crosshairValues.blocksPerDay}/>
          </XYPlot>
          <h4>{data.transactionsPerBlockPerDay.name}</h4>
          <XYPlot
            onMouseLeave={::this._onMouseLeave}
            width={600}
            height={300}
            xType="time-utc">
            <HorizontalGridLines />
            <VerticalGridLines />
            <LineSeries
              onNearestX={this._onNearestX.bind(this, 'transactionsPerBlockPerDay')}
              data={data.transactionsPerBlockPerDay.data} />
            <XAxis
              title="Day"
              labelFormat={(xVal) => moment(xVal).format('MMM YYYY')}
              labelValues={data.transactionsPerBlockPerDay.data.map((point) => point.x)}
              tickValues={data.transactionsPerBlockPerDay.data.map((point) => point.x)} />
            <YAxis title="# of transactions" />
            <Crosshair
              titleFormat={(values) => ({title: 'count', value: values[0].y})}
              itemsFormat={(values) => [
                {title: 'date', value: moment(values[0].x).format('MMM YYYY')}
              ]}
              values={this.state.crosshairValues.transactionsPerBlockPerDay}/>
          </XYPlot>
          <h4>{data.opReturnBlocksVsBlocks.name}</h4>
          <RadialChart
            data={data.opReturnBlocksVsBlocks.data.map(pt => ({angle: pt.x}))}
            width={300}
            height={300} />
        </div>}
      </div>
    );
  }
}
//
// <h4>{data.opReturnBlocksPerDay.name}</h4>
// <XYPlot width={600} height={300} xType="time-utc">
//   <HorizontalGridLines />
//   <VerticalGridLines />
//   <LineSeries data={data.opReturnBlocksPerDay.data} />
//   <XAxis
//     title="Day"
//     labelFormat={(xVal) => moment(xVal).format('MMM YYYY')}
//     labelValues={data.opReturnBlocksPerDay.data.map((point) => point.x)}
//     tickValues={data.opReturnBlocksPerDay.data.map((point) => point.x)} />
//   <YAxis title="# of blocks" />
// </XYPlot>
