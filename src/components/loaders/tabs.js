import React from 'react'

import ContentLoader from "react-content-loader"

export default function Tabs({ color, height, width }) {
  return(
    <ContentLoader
      speed={1}
      height={500}
      width={1000}
      backgroundColor={color}
      foregroundColor='rgba(153, 153, 153, 0.5)'
    >
      <rect x="115" y="40" rx="3" ry="3" width="200" height="25" />
      <circle cx="65" cy="50" r="30" />
      <rect x="490" y="40" rx="3" ry="3" width="200" height="25" />
      <circle cx="440" cy="50" r="30" />
      <rect x="115" y="130" rx="3" ry="3" width="200" height="25" />
      <circle cx="65" cy="140" r="30" />
      <rect x="490" y="130" rx="3" ry="3" width="200" height="25" />
      <circle cx="440" cy="140" r="30" />
    </ContentLoader>
  )
}
