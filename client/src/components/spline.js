import React from 'react';
import {Line} from 'react-chartjs-2';

const data = (canvas) => {
  const ctx = canvas.getContext("2d")
  var gradient = ctx.createLinearGradient(0,337.5,0, 25)

  gradient.addColorStop(1, 'rgba(	138, 239, 255, 0.5)')
  gradient.addColorStop(0.7, 'rgba(	138, 239, 255, 0.25)')
  gradient.addColorStop(0.6, 'rgba(	138, 239, 255, 0.125)')
  gradient.addColorStop(0.5, 'rgba(	255, 255, 255 ,0.05)')
  gradient.addColorStop(0.375, 'rgba(	255, 255, 255, 0)')
  gradient.addColorStop(0.25, 'rgba(	255, 255, 255, 0)')

  return {
    datasets: [
    {
      backgroundColor: gradient,
      fill: true,
      borderWidth: 3,
      borderColor: "#66FFFF",
      pointHoverBorderWidth: 15,
      pointRadius: 4,
      data: [{
        x: 1597865990111 * .75,
        y: 1020
      },{
        x: 1597865990111 * .8,
        y: 2443
      },{
        x: 1597865990111 * .85,
        y: 4503
      },{
        x: 1597865990111  * .90,
        y: 5783
      },{
        x: 1597865990111  * .95,
        y: 3532
      },{
        x: 1597865990111  * 1,
        y: 4000
      },{
        x: 1597865990111  * 1.05,
        y: 4250
      }]
     }
    ]
  }
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
      left: 0,
      right: 0,
      top: 75,
      bottom: -25
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
          drawBorder: false,
          display: false
        },
        ticks: {
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


export default function Spline(){
    return <div style={{ 'z-index': 1, float: 'left', width: '75%'}}>
      <Line options={options} height={50} data={data} redraw />
    </div>
}
