import React from 'react'

import ContentLoader from "react-content-loader"

export default function Stake({theme, width}) {
  return(
    <ContentLoader
      speed={2}
      width={width}
      height={875}
      viewBox={`0 0 ${width} 875`}
      backgroundColor={theme.palette.primary.main}
      foregroundColor='rgba(153, 153, 153, 0.5)'
    >
      <rect x="0" y="0" rx="5" ry="5" width={width} height="200" />
      <rect x="0" y="225" rx="5" ry="5" width={width} height="200" />
      <rect x="0" y="450" rx="5" ry="5" width={width} height="200" />
      <rect x="0" y="675" rx="5" ry="5" width={width} height="200" />
    </ContentLoader>
  )
}
