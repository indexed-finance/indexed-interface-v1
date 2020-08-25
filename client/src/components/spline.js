import React from 'react';
import {Line} from 'react-chartjs-2';

const data = (canvas) => {
  const ctx = canvas.getContext("2d")
  var gradient = ctx.createLinearGradient(0,337.5,0, 25)

  gradient.addColorStop(1, 'rgba(	138, 239, 255, .5)')
  gradient.addColorStop(0.7, 'rgba(	138, 239, 255, 0.25)')
  gradient.addColorStop(0.6, 'rgba(	138, 239, 255, 0.125)')
  gradient.addColorStop(0.5, 'rgba(	138, 239, 255, 0.075)')
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
          x: 1597865990111 * .55,
          y: 1675
        },{
          x: 1597865990111 * .60,
          y: 1775
        },{
          x: 1597865990111 * .65,
          y: 2200
        },{
          x: 1597865990111  * .70,
          y: 1750
        },{
          x: 1597865990111  * .725,
          y: 2750
        },{
        x: 1597865990111 * .75,
        y: 2000
      },{
        x: 1597865990111 * .8,
        y: 2443
      },{
        x: 1597865990111 * .85,
        y: 4503
      },{
        x: 1597865990111  * .90,
        y: 3000
      },{
        x: 1597865990111  * .95,
        y: 3750
      },{
        x: 1597865990111  * 1,
        y: 2750
      },{
        x: 1597865990111  * 1.05,
        y: 3750
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
      left: -12.5,
      right: 0,
      top: 75,
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
          ticks: {
            beginAtZero: true
          },
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


export default function Spline(){
    return <div style={{ 'z-index': 1, float: 'left', width: '75%'}}>
      <Line options={options} height={55} data={data} redraw />
    </div>
}
