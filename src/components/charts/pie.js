import React, { Fragment, useState, useEffect } from 'react'

import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, defaults } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'

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
  }
}

export default function PieChart({ metadata }){
  const [ component, setComponent ] = useState(<Fragment />)
  const theme = useTheme()

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

  useEffect(() => {
    setComponent(
      <Pie height={175} width={175} options={options} data={chartConfig(metadata)} />
    )
  }, [ metadata ])

  return (
    <div style={{ position: 'relative', float: 'left', width: '30%', top: '1.5em', left: '1em'}}>
      {component}
    </div>
  )
}
