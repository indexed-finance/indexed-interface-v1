import React, { Fragment, useState, useEffect } from 'react'

import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, defaults } from 'react-chartjs-2'

defaults.global.defaultFontFamily = 'San Francisco';

const chartConfig = metadata => ({
  labels: metadata.assets.map(value => value.symbol),
	datasets: [{
    datalabels: {
      color: function(ctx) {
        var index = ctx.dataIndex
        var label = ctx.chart.data.labels[index]

        if(index == 4) return 'black'
        else return 'white'
      },
      labels: {
           title: {
               font: {
                   weight: 'bold'
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
    '#FFFFFF'
		],
		hoverBackgroundColor: [
    '#009999',
  	'#00CCCC',
  	'#33FFFF',
    '#99FFFF',
    '#FFFFFF'
		]
	}]
})

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

  useEffect(() => {
    setComponent(
      <Pie height={175} options={options} data={chartConfig(metadata)} />
    )
  }, [ metadata ])

  return (
    <div style={{ position: 'absolute', right: '42.5%', top: '8.75%' }}>
      {component}
    </div>
  )
}
