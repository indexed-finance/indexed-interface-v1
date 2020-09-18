import React from 'react';
import {Doughnut} from 'react-chartjs-2';


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
    padding: 0,
    margin: 0
  }
}

const data = {
	labels: [
		'PASSED',
		'REJECTED'
	],
	datasets: [{
		data: [60, 30],
    borderColor: '#666666',
    borderWidth: 3,
    datalabels: {
      color: 'white',
      labels: {
           title: {
               font: {
                   weight: 'bold',
               }
           },
         },
    },
		backgroundColor: [
		'#00e79a',
		'#ff005a'
		],
		hoverBackgroundColor: [
    '#00e79a',
		'#ff005a'
		]
	}]
};

export default function Donut(){

  return (
    <Doughnut width={337.5} height={225} options={options} data={data} />
  );
}
