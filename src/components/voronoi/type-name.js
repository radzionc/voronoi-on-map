import React from 'react'
import { connectTo, takeFromState } from '../../utils/generic';
import { togglePlaceHover, startSearchingNewPlace } from '../../actions/voronoi'
import Toggler from './hover-toggler'

export default connectTo(
  state => takeFromState(state, 'voronoi', ['place', 'placeHover']),
  { togglePlaceHover, startSearchingNewPlace },
  ({ place, placeHover, togglePlaceHover, startSearchingNewPlace }) => (
    <Toggler name={place.split('_').join(' ')} hover={placeHover} toggleHover={togglePlaceHover} onClick={startSearchingNewPlace} hoverText={'change place'}/>
  )
)