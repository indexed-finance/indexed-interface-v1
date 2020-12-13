import React, { useState, useEffect } from 'react'

import { Line } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'
import style from '../../assets/css/components/spline'
import { max, min } from 'd3-array';

import Loader from '../loaders/spline'

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

const options = (padding, range, margin) => ({
  bezierCurve: true,
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 6,
   tooltips: {
      yAlign: 'right',
  },
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
      right: margin,
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
          max: range[0] * 1.025,
          min: range[1] * 0.985,
          display: false,
          padding: 0,
        }
      }],
      xAxes: [{
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


const getConfig = (canvas, metadata, color, absolute) => {
  const ctx = canvas.getContext("2d")
  var gradient = ctx.createLinearGradient(0, 337.5, 0, 25)
  let length = metadata.history.length
  let array = metadata.history
  let rgb = hexToRgb(color)

  gradient.addColorStop(1, `rgba(${rgb}, .5)`)
  gradient.addColorStop(0.7, `rgba(${rgb}, 0.25)`)
  gradient.addColorStop(0.6, `rgba(${rgb}, 0.125)`)
  gradient.addColorStop(0.5, `rgba(${rgb}, 0.075)`)
  gradient.addColorStop(0.25, `rgba(${rgb}, 0)`)

  let data = renameKeys(
    { close: 'y', date: 'x' }, array.slice(length-11, length)
  )

  if(data.length > 0 && absolute) {
    let newDate = new Date(data[data.length-1].x)
    let day = i => 3600000 * i

    data.push({ ...data[data.length-1], x: new Date(newDate.getTime() + day(1)) })
    data.push({ ...data[data.length-1], x: new Date(newDate.getTime() + day(2)) })
    data.push({ ...data[data.length-1], x: new Date(newDate.getTime() + day(3)) })
  }

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

function getRanges(metadata) {
  let length = metadata.length
  let subsitute = metadata.slice(length-11, length);

  return [ max(subsitute, getStockValue), min(subsitute, getStockValue) ]
}

const getStockValue = (v) => v.close;

export default function Spline(props){
  let { metadata, height, color, ready, absolute, native, padding } = props
  const [ component, setComponent ] = useState(null)
  const theme = useTheme()
  let { p, h, width, margin, paddingTop } = style.getFormatting(native)

  useEffect(() => {
    if(metadata.address !== '0x0000000000000000000000000000000000000000'){
      let ranges = metadata.history.length > 0 ? getRanges(metadata.history) : [ 0, 0 ]

      setComponent(
        <Line
          height={parseFloat(height)} options={options(!absolute ? 100 : paddingTop, ranges, !absolute ? 0 : margin)}
          data={(e) => getConfig(e, metadata, color, absolute)} redraw
        />
      )
    }
  }, [ metadata, height, color, absolute, margin, paddingTop ])

  return(
    <>
    {absolute && (
      <div style={{ float: 'left', width, paddingTop: !ready ? p : padding , position: 'absolute', overflow: 'hidden'}}>
        {!ready && (<Loader native={native} padding={p} height={h} theme={theme} />)}
        {component}
      </div>
    )}
    {!absolute && (
      <>
        {!ready && (<div style={{ marginBottom: -20, paddingTop:30}}> <Loader native={native} padding={p} height={h} theme={theme} /> </div>)}
        {ready && (<> {component} </>)}
      </>
    )}
    </>
  )
}
