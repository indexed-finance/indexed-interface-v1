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

 function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  console.log(result)
  return (
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  )
}

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


export default function Spline({ metadata, height, color }){
  const [ component, setComponent ] = useState(<Fragment />)

  const getConfig = (canvas) => {
    const ctx = canvas.getContext("2d")
    var gradient = ctx.createLinearGradient(0,337.5,0, 25)
    let length = metadata.history.length
    let array = metadata.history
    let rgb = hexToRgb(color)

    gradient.addColorStop(1, `rgba(${rgb}, .5)`)
    gradient.addColorStop(0.7, `rgba(${rgb}, 0.25)`)
    gradient.addColorStop(0.6, `rgba(${rgb}, 0.125)`)
    gradient.addColorStop(0.5, `rgba(${rgb}, 0.075)`)
    gradient.addColorStop(0.25, `rgba(${rgb}, 0)`)

    let data = renameKeys(
      { close: 'y', date: 'x' }, array.slice(length-8, length)
    )

    return {
      datasets: [
      {
        backgroundColor: gradient,
        fill: true,
        borderWidth: 3,
        borderColor: color,
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: data
        }
      ]
    }
  }

  useEffect(() => {
    setComponent(
      <Line height={height} options={options} data={getConfig} redraw />
    )
  }, [ metadata ])

  return component
}
