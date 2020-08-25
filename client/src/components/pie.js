import React from 'react';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const data = {
  labels: [
    'SNX',
    'DAI',
    'ETH',
    'LINK',
    'COMP'
  ],
	datasets: [{
    datalabels: {
      color: function(ctx) {
        var index = ctx.dataIndex
        var label = ctx.chart.data.labels[index]

        if(label == 'COMP') return 'black'
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
		data: [50, 10, 25, 30, 37.5],
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
}

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

export default function PieChart(){

  return (
    <div style={{ position: 'absolute', right: '42.5%', top: '8.75%' }}>
      <Pie height={145} options={options} data={data} />
    </div>
  )
}
