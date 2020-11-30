import React from 'react'

import ContentLoader from "react-content-loader"

export default function Title({ color }) {
  return(
    <ContentLoader
      speed={1}
      width='925'
      height={50}
      viewBox="0 0 925 50"
      backgroundColor={color}
      foregroundColor='rgba(153, 153, 153, 0.5)'
    >
      <rect x="240" y="15" rx="3" ry="3" width="75" height="22" />
      <rect x="0" y="15" rx="3" ry="3" width="225" height="22" />
      <rect x="425" y="15" rx="3" ry="3" width="125" height="22" />
      <rect x="725" y="15" rx="3" ry="3" width="150" height="22" />
      <rect x="565" y="15" rx="3" ry="3" width="50" height="22" />
    </ContentLoader>
  )
}
