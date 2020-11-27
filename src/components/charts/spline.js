import React, { Fragment, useState, useEffect } from 'react'

import { Line } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'
import style from '../../assets/css/components/spline'
import { max, min } from 'd3-array';

import ContentLoader from "react-content-loader"

const Loader = ({ theme, padding, height, native }) => (
    <div style={{ paddingTop: padding, marginTop: native ? 0 : padding }}>
      <ContentLoader
        speed={1}
        height={height}
        viewBox={`0 0 1440 350`}
        backgroundColor={theme.palette.primary.main}
        foregroundColor='rgba(153, 153, 153, 0.5)'
      >
        <path fill="#0099ff" fill-opacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </ContentLoader>
  </div>
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
          max: range[0] * 1.015,
          min: range[1] * 0.90,
          display: false,
          padding: 0,
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


const getConfig = (canvas, metadata, color) => {
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
    { close: 'y', date: 'x' }, array.slice(length-11, length)
  )

  if(data.length > 0) {
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

  console.log(max(subsitute, getStockValue), min(subsitute, getStockValue))
  console.log(subsitute)

  return [ max(subsitute, getStockValue), min(subsitute, getStockValue) ]
}

const getStockValue = (v) => v.close;

export default function Spline(props){
  let { metadata, height, color, padding, ready, absolute, native } = props
  const [ component, setComponent ] = useState(null)
  const theme = useTheme()
  let { p, h, width, margin } = style.getFormatting(native)

  useEffect(() => {
    if(metadata.address != '0x0000000000000000000000000000000000000000'){
      let ranges = metadata.history.length > 0 ? getRanges(metadata.history) : [ 0, 0 ]

      setComponent(
        <Line
          height={height} options={options(!absolute ? 0 : padding, ranges, margin)}
          data={(e) => getConfig(e, metadata, color)} redraw
        />
      )
    }
  }, [ metadata ])

  return(
    <>
    {absolute && (
      <div style={{'z-index': 1, float: 'left', width, paddingTop: !ready ? p : padding , position: 'absolute', overflow: 'hidden'}}>
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
