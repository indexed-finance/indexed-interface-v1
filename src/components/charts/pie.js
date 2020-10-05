import React, { Fragment, useState, useEffect, useContext } from 'react'

import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, defaults } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'

import { store } from '../../state'

defaults.global.defaultFontFamily = 'San Francisco';

const options = {
  legend: {
    display: false
  },
  plugins: {
  datalabels: {
    textAlign: 'center',
    formatter: function(value, ctx) {
      var index = ctx.dataIndex
      var label = ctx.chart.data.labels[index]
      return label
      }
    }
  },
  layout: {
    padding: {
      right: 15,
      left: 15,
      top: 15,
      bottom: 15
    }
  }
}

export default function PieChart({ metadata, height }){
  const [ component, setComponent ] = useState(<Fragment />)
  const theme = useTheme()

  let { state } = useContext(store)

  const chartConfig = metadata => ({
    labels: metadata.assets.map(value => value.symbol),
  	datasets: [{
      datalabels: {
        color: function(ctx) {
          var index = ctx.dataIndex
          var label = ctx.chart.data.labels[index]

          if(index == 4) return theme.palette.secondary.main
          else return 'white'
        },
        labels: {
             title: {
                 font: {
                     weight: 'bold',
                     size: 10
                 }
             },
           },
      },
      borderColor: '#666666',
      borderWidth: 3,
  		data: metadata.assets.map(value => value.weight),
  		backgroundColor: [
  		'#009999',
  		'#00CCCC',
  		'#33FFFF',
      '#99FFFF',
      `${theme.palette.primary.main}`
  		],
  		hoverBackgroundColor: [
      '#009999',
    	'#00CCCC',
    	'#33FFFF',
      '#99FFFF',
      `${theme.palette.primary.main}`
  		]
  	}]
  })

  return  <Pie height={height} width={height} options={options} data={chartConfig(metadata)} />
}
