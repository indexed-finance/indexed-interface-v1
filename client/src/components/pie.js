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
      color: '#FFFFFF',
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
}

export default function PieChart(){

  return (
    <div style={{ position: 'absolute', right: '42.5%', top: '8.75%' }}>
      <Pie height={125} options={options} data={data} />
    </div>
  )
}
