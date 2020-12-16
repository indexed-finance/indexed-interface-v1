import React from 'react'

import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Pie, defaults } from 'react-chartjs-2'
import { useTheme } from '@material-ui/core/styles'

import ContentLoader from "react-content-loader"
import style from '../../assets/css/components/pie'
import { formatBalance } from '@indexed-finance/indexed.js'

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

const SIZE_TEN = [ '#143333', '#286666', '#3d9999','#51cccc', '#66ffff', '#84ffff', '#a3ffff', '#c1ffff' ]
const SIZE_FIVE = [ '#009999', '#00CCCC','#33FFFF', '#99FFFF' ]


const getPieColors = (size) => {
  if(size > 5) return SIZE_TEN
  else return SIZE_FIVE
}

export default function PieChart({ metadata, height, ready, native }){
  const theme = useTheme()

  let colors = [ ...getPieColors(metadata.assets.length), `${theme.palette.primary.main}`]
  let labels = [];
  let data = [];

  if (ready && (typeof metadata.active === 'boolean')) {
    if(!metadata.active) {
      const fmtNumber = (n) => +((+n).toFixed(1))
      let current = fmtNumber(metadata.currentValue);
      let final = fmtNumber(metadata.finalValueEstimate);
      let remaining = final - current;
      data = [ current, remaining ]
      labels = [ 'FULFILLED', 'REMAINING' ]
      colors = [ 'orange', theme.palette.primary.main ]
    } else {
      labels = metadata.assets.map(value => value.symbol);
      data = metadata.assets.map(value => +((+formatBalance(value.weight, 18, 4)) * 100).toFixed(1));
    }
    metadata.rendered = true
  }

  const chartConfig = (metadata, border) => ({
    labels: labels,
  	datasets: [{
      datalabels: {
        color: function(ctx) {
          var index = ctx.dataIndex

          if(index === ctx.chart.data.labels.length - 1
            || index >= 8 || ctx.chart.data.labels.length === 2) {
            return theme.palette.secondary.main
          } else if (index == ctx.chart.data.labels.length - 2
            && ctx.chart.data.labels.length == 5 || index >= 5) {
            return '#999999'
          } else {
            return 'white'
          }
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

  let { padding, border } = style.getFormatting(native)

  return <>
     {metadata.address === '0x0000000000000000000000000000000000000000' && (
       <Loader padding={padding} theme={theme} height={height} />
     )}
     {metadata.address !== '0x0000000000000000000000000000000000000000' && (
       <Pie height={height} width={height} options={options(padding)} data={chartConfig(metadata, border)} />
     )}
   </>
}
