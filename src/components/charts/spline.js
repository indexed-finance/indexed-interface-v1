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
  responsive: true,
  plugins: {
     datalabels: false
 },
  elements: {
      point:{
          radius: 0
      }
  },
  layout: {
    padding: {
      left: -12.5,
      right: 0,
      top: 100,
      bottom: 0
    }
  },
  type: 'line',
  gridLines: {
    display: false
  },
  legend: {
    display: false
  },
  scales: {
      yAxes: [{
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
        type: 'linear',
        display: true,
        type: 'time',
        time: {
          unit: 'day'
        },
        gridLines: {
          tickMarkLength: 0,
          drawBorder: false,
          display: false
        },
        ticks: {
          display: false,
          padding: 0
        }
     }]
  },
}


export default function Spline({ metadata }){
  const [ component, setComponent ] = useState(<Fragment />)

  const getConfig = (canvas) => {
    const ctx = canvas.getContext("2d")
    var gradient = ctx.createLinearGradient(0,337.5,0, 25)
    let length = metadata.history.length
    let array = metadata.history

    gradient.addColorStop(1, 'rgba(	138, 239, 255, .5)')
    gradient.addColorStop(0.7, 'rgba(	138, 239, 255, 0.25)')
    gradient.addColorStop(0.6, 'rgba(	138, 239, 255, 0.125)')
    gradient.addColorStop(0.5, 'rgba(	138, 239, 255, 0.075)')
    gradient.addColorStop(0.25, 'rgba(	255, 255, 255, 0)')

    let data = renameKeys(
      { close: 'y', date: 'x' }, array.slice(length-8, length)
    )

    return {
      datasets: [
      {
        backgroundColor: gradient,
        fill: true,
        borderWidth: 3,
        borderColor: "#66FFFF",
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: data
        }
      ]
    }
  }

  useEffect(() => {
    setComponent(
      <Line height={68} options={options} data={getConfig} redraw />
    )
  }, [ metadata ])

  return (
    <div style={{ 'z-index': 1, float: 'left', width: '75%'}}>
      {component}
    </div>
  )
}
