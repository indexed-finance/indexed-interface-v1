import React from 'react';
import {Doughnut} from 'react-chartjs-2';


const options = {
  legend: {
    display: false
  },
  layout: {
    padding: 0,
    margin: 0
  }
}

const data = {
	labels: [
		'ACTIVE',
		'PASSED',
		'REJECTED'
	],
	datasets: [{
		data: [10, 60, 30],
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
    '#645eff',
		'#00e79a',
		'#ff005a'
		],
		hoverBackgroundColor: [
    '#645eff',
    '#00e79a',
		'#ff005a'
		]
	}]
};

export default function Donut(){

  return (
    <Doughnut width={300} height={175} options={options} data={data} />
  );
}
