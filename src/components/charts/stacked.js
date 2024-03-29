import React, { useState, useEffect } from 'react'

import { Line } from 'react-chartjs-2'

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

const getConfig = (metadata) => {
  const active = metadata.map(a => parseInt(a.active)/Math.pow(10, 18))
  const inactive = metadata.map(i => parseInt(i.inactive)/Math.pow(10, 18))
  const delegated = metadata.map(d => parseInt(d.delegated)/Math.pow(10, 18))
  const dates = metadata.map(x => {
    let date = new Date(parseInt(x.id * 86400000))

    return `${date.getMonth()}/${date.getDay()}`
  })

  return {
    labels: dates,
    datasets: [
      {
        label: 'INACTIVE',
        borderColor: '#666666',
        backgroundColor: '#66FFFF',
        data: inactive,
      },
      {
        label: 'DELEGATED',
        borderColor: '#666666',
        backgroundColor: 'orange',
        data: delegated,
      },
      {
        label: 'ACTIVE',
        borderColor: '#666666',
        backgroundColor: '#00e79a',
        data: active
      },
      ]
    }
  }

export default function Spline({ ready, metadata, height }){
  const [ component, setComponent ] = useState(null)

   useEffect(() => {
      if(metadata.address !== '0x0000000000000000000000000000000000000000'){
        setComponent(
          <Line height={height} options={options} data={getConfig(metadata)} id='stacked' redraw />
        )
      }
    }, [ metadata, height ])

  return (
    <div style={{ 'z-index': 1, float: 'left', width: '100%'}}>
      {component}
    </div>
  )
}
