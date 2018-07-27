import React from 'react'
import { connectTo } from '../../utils/generic';

import CityName from './city-name'
import TypeName from './type-name'
import { STAGES } from '../../constants/voronoi';

const topStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
}

export default connectTo(
  state => state.voronoi,
  {},
  ({ stage }) => (
    <div style={topStyle}>
      {[STAGES.SELECT_PLACE_TYPE, STAGES.VORONOI].includes(stage) && <CityName/>}
      {[STAGES.VORONOI].includes(stage) && <TypeName/>}
    </div>
  )
)