import React from 'react'
import { orange } from '@material-ui/core/colors';

export default ({ points }) => (
  <polygon
    points={points.map(p => p.array())}
    fill={orange[200]}
    opacity={0.7}
    strokeWidth={2}
    stroke={orange.A200}
  />
)