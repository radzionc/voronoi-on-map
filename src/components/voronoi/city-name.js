import React from 'react'
import { connectTo, takeFromState } from '../../utils/generic';
import { toggleCityHover, startSearchingNewCity } from '../../actions/voronoi'
import Toggler from './hover-toggler'

export default connectTo(
  state => takeFromState(state, 'voronoi', ['city', 'cityHover']),
  { toggleCityHover, startSearchingNewCity },
  ({ city, cityHover, toggleCityHover, startSearchingNewCity }) => (
    <Toggler name={city} hover={cityHover} toggleHover={toggleCityHover} onClick={startSearchingNewCity} hoverText={'change city'}/>
  )
)