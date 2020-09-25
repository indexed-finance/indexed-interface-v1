import React, { Fragment, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Doughnut, defaults } from 'react-chartjs-2'
import randomColor from 'randomcolor'

defaults.global.legend.labels.usePointStyle = true

function LegendItem({ color }) {
  const styles = {
    background: color,
    width: 15,
    height: 15,
    float: 'left',
    borderRadius: 10,
    marginRight: 7.5
  }
  return <div style={styles} />
}


const useStyles = makeStyles((theme) => ({
  chart: {
    float: 'right',
    height: '100%',
    width: '25%',
  },
  legend: {
    height: 50,
    float: 'left',
    fontSize: 12,
    width: '75%',
    textAlign: 'left',
    alignItems: 'left',
    '& ul': {
      listStyle: 'none',
      listStyleType: 'none',
      alignItems: 'left',
      overflow: 'hidden',
      marginRight: 0,
      marginLeft: 0,
      '& li': {
        display: 'inline',
        textAlign: 'left',
        float: 'right',
        marginRight: 20
      },
    },
  },
}))


const options = {
  plugins: {
    datalabels: false,
  },
  legend: {
    display: false
  },
  layout: {
    padding: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  }
}


export default function Donut({ metadata }){
  let colors = metadata.assets.map(t => randomColor({ luminosity: 'bright', hue: 'bright' }))
  const classes = useStyles()

  const data = {
  	labels: metadata.assets.map(value => value.symbol),
  	datasets: [{
      data: metadata.assets.map(value => value.weight),
      borderColor: '#666666',
      borderWidth: 2,
  		backgroundColor: colors,
  		hoverBackgroundColor: colors
  	}]
  };

  useEffect(() => {

  }, [ metadata ])

  return (
    <Fragment>
      <div className={classes.legend}>
        <ul>
          {metadata.assets.map((d, i) => (
            <li>
              <LegendItem color={colors[i]} /> {d.symbol}: {parseInt(d.weight * 100)}%
            </li>
          ))}
        </ul>
      </div>
      <div className={classes.chart}>
        <Doughnut height={75} options={options} data={data} />
      </div>
    </Fragment>
  );
}
