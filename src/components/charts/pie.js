import React, { Fragment, useState, useEffect, useContext } from 'react'

import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, defaults } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'

import { store } from '../../state'
import ContentLoader from "react-content-loader"
import style from '../../assets/css/components/pie'

defaults.global.defaultFontFamily = 'San Francisco Bold';

const Loader = ({ height, theme, padding }) => (
    <div style={{ padding: padding.left }}>
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
      ...padding
    }
  }
})

export default function PieChart({ metadata, height, ready, native }){
  const [ component, setComponent ] = useState({ element: <span/>, data: {} })
  const theme = useTheme()

  let colors = [ '#009999', '#00CCCC','#33FFFF', '#99FFFF', `${theme.palette.primary.main}`]
  let labels = metadata.assets.map(value => value.symbol)
  let data =  metadata.assets.map(value => value.weight)

  if(isNaN(data[0])){
    data = [ 100 ]
    labels = [ 'NA' ]
    colors = [ 'orange' ]
  }

  const chartConfig = (metadata, border) => ({
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
      borderWidth: border,
  		data: data,
  		backgroundColor: colors,
  		hoverBackgroundColor: colors
  	}]
  })

  useEffect(() => {
    if(ready){
      if(component.data != metadata){
        setComponent({
          element: <Pie height={height} width={height} options={options(padding)} data={chartConfig(metadata, border)} />,
          data: metadata
        })
      }
    } else {
      setComponent({
        element: <Loader padding={padding} theme={theme} height={height} />,
        data: metadata
      })
    }
  }, [ ])

  let { padding, border } = style.getFormatting(native)

  return component.element
}
