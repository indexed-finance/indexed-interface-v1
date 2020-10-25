import React, { Fragment, useState, useEffect, useContext } from 'react'

import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, defaults } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'

import { store } from '../../state'
import ContentLoader from "react-content-loader"

defaults.global.defaultFontFamily = 'San Francisco';

const Loader = ({ height, theme }) => (
    <div style={{ padding: 15 }}>
      <ContentLoader
        viewBox={`0 0 ${height} ${height}`}
        backgroundColor={theme.palette.primary.main}
        foregroundColor='rgba(153, 153, 153, 0.5)'
        speed={1}
      >
        <circle cx={height /2} cy={height /2} r={height /2 } />
      </ContentLoader>
    </div>
)

const options  = padding => ({
  legend: {
    display: false
  },
  plugins: {
  datalabels: {
    textAlign: 'center',
    formatter: function(value, ctx) {
      var index = ctx.dataIndex
      var label = ctx.chart.data.labels[index]
      return label
      }
    }
  },
  layout: {
    padding: {
      right: padding,
      left: padding,
      top: padding,
      bottom: padding
    }
  }
})

export default function PieChart({ metadata, height, ready }){
  const theme = useTheme()
  let colors = [ '#009999', '#00CCCC','#33FFFF', '#99FFFF', `${theme.palette.primary.main}`]
  let labels = metadata.assets.map(value => value.symbol)
  let data =  metadata.assets.map(value => value.weight)
  let padding = 15

  if(metadata.assets.length == 0){
    data = [ 100 ]
    labels = [ 'NA' ]
    colors = [ 'orange' ]
  }

  const chartConfig = metadata => ({
    labels: labels,
  	datasets: [{
      datalabels: {
        color: function(ctx) {
          var index = ctx.dataIndex
          var label = ctx.chart.data.labels[index]

          if(index == 4) return theme.palette.secondary.main
          else return 'white'
        },
        labels: {
             title: {
                 font: {
                     weight: 'bold',
                     size: 10
                 }
             },
           },
      },
      borderColor: '#666666',
      borderWidth: 3,
  		data: data,
  		backgroundColor: colors,
  		hoverBackgroundColor: colors
  	}]
  })

  if(!ready) return <Loader theme={theme} height={height} />
  if(window.innerWidth > 1800) padding = 20
  if(window.innerWidth > 2250) padding = 30

  return  <Pie height={height} width={height} options={options(padding)} data={chartConfig(metadata)} />
}
