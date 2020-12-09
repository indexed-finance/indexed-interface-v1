import React from 'react'
import ContentLoader from "react-content-loader"

export default function Spline({ theme, padding, height, native }) {
  return(
    <div style={{ paddingTop: padding, marginTop: native ? 0 : padding }}>
      <ContentLoader
        speed={1}
        height={height}
        viewBox={`0 0 1440 350`}
        backgroundColor={theme.palette.primary.main}
        foregroundColor='rgba(153, 153, 153, 0.5)'
      >
        <path fill="#0099ff" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,218.7C672,213,768,139,864,128C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </ContentLoader>
   </div>
  )
}
