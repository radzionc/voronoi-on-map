import React from 'react'
import { connectTo, takeFromState } from '../../utils/generic';
import Button from '@material-ui/core/Button';

import { toggleCityHover, startSearchingNewCity } from '../../actions/voronoi'

const style = {
  position: 'absolute',
  top: '0%',
  left: '50%',
  transform: 'translate(-50%, 0)',
}

export default connectTo(
  state => takeFromState(state, 'voronoi', ['city', 'cityHover']),
  { toggleCityHover, startSearchingNewCity },
  ({ city, cityHover, toggleCityHover, startSearchingNewCity }) => (
    <Button onClick={startSearchingNewCity} color="primary" onMouseEnter={toggleCityHover} onMouseLeave={toggleCityHover} style={style}>
      {cityHover ? 'Change city' : city}
    </Button>
  )
)