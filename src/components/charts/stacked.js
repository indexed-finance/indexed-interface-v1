import React, { Fragment, useState, useEffect } from 'react'

import { Line } from 'react-chartjs-2'

const renameKeys = (keysMap, obj) =>
  obj.map(value =>
    Object.keys(value).reduce(
      (acc, key) => ({
        ...acc,
        ...{ [keysMap[key] || key]: value[key] }
      }),
    {}
   )
 )

const options = {
  bezierCurve: true,
  plugins: {
     datalabels: false
  },
  responsive: true,
  title: {
    display: false,
  },
  legend: {
    display: false
  },
  gridLines: {
    display: false
  },
  tooltips: {
    mode: 'index',
  },
  hover: {
  	mode: 'index'
  },
  layout: {
    padding: {
      left: 0,
      right: 0,
      top: 100,
      bottom: 0
    }
  },
  elements: {
    point:{
      pointStyle: 'circle',
      borderWidth: 3,
      radius: 5
    }
  },
  scales: {
    yAxes: [{
      stacked: true,
      gridLines: {
        tickMarkLength: 0,
        drawBorder: false,
        display: false
      },
      ticks: {
        beginAtZero: false,
        display: false,
        padding: 0
      }
    }],
    xAxes: [{
      gridLines: {
        tickMarkLength: 0,
        drawBorder: false,
        display: false
      },
      ticks: {
        display: false,
        padding: 0
      }
    }],
  	x: {
  	  scaleLabel: {
  		  display: true,
  			labelString: 'Month'
  		}
  	},
  	y: {
  		scaleLabel: {
  			display: true,
  			labelString: 'Value'
  		}
    }
  }
}

export default function Spline({ metadata, height }){
  const [ component, setComponent ] = useState(<Fragment />)

  const getConfig = (canvas) => {
    const ctx = canvas.getContext("2d")

    return {
      labels: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY'],
      datasets: [
        {
      	label: 'INACTIVE',
      	borderColor: '#666666',
      	backgroundColor: '#66FFFF',
      	data: [
            100,
            50,
            60,
            50,
            60,
            40,
            37.5,
            30,
            40,
            35,
            45,
      		],
      	},
        {
      		label: 'ACTIVE',
      		borderColor: '#666666',
      		backgroundColor: '#00e79a',
      		data: [
            0,
            20,
            40,
            30,
            30,
            60,
            60,
            55,
            62.5,
            52.5,
      		   ],
      		},
          {
      			label: 'DELEGATED',
      			borderColor: '#666666',
      			backgroundColor: 'orange',
      			data: [
      						0,
      						0,
      						0,
      						10,
                  10,
                  20,
      						0,
                  2.5,
                  5,
                  10,
                  10,
      					],
      		  }
         ]
      }
    }

  useEffect(() => {
    setComponent(
      <Line height={height} options={options} data={getConfig} redraw />
    )
  }, [ metadata ])

  return (
    <div style={{ 'z-index': 1, float: 'left', width: '100%'}}>
      {component}
    </div>
  )
}
