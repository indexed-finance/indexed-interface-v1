import React, { Fragment, useState, useEffect } from 'react'

import { Line } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'

import ContentLoader from "react-content-loader"

const Loader = ({ theme, padding, height }) => (
    <ContentLoader
      speed={1}
      height={height}
      viewBox={`0 0 1440 350`}
      backgroundColor={theme.palette.primary.main}
      foregroundColor='rgba(153, 153, 153, 0.5)'
    >
      <path fill="#0099ff" fill-opacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </ContentLoader>
)

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
  return (
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  )
}

const options = (padding) => ({
  bezierCurve: true,
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 6,
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
      top: padding,
      left: -12.5,
      right: 0,
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
})

export default function Spline({ metadata, height, color, padding, state, absolute }){
  const theme = useTheme()

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

  let h = !state.native ? 'auto' : 125
  let p = !state.native ? 15 : 22.5

  if(absolute){
    if(!state.request) padding = p

    return(
      <div style={{'z-index': 1, float: 'left', width: '65%', paddingTop: padding , position: 'absolute', overflow: 'hidden'}}>
        {state.request && (<Line height={height} options={options(0)} data={getConfig} redraw />)}
        {!state.request && (<Loader height={h} theme={theme} />)}
      </div>
    )
  } else {
    let paddingTop = 30
    p = -20

    return (
      <Fragment>
        {!state.request && (<div style={{ marginBottom: p, paddingTop }}> <Loader height={h} theme={theme} /> </div>)}
        {state.request && (<Line height={height} options={options(padding)} data={getConfig} redraw />)}
      </Fragment>
    )
  }
}
