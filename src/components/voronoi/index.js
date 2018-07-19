import React from 'react'

import Page from '../page'
import Map from './map'
import CityInput from './city-input'
import CityName from './city-name'
import { connectTo } from '../../utils/generic';

export default connectTo(
  state => state.voronoi,
  {},
  ({ city }) => (
    <Page style={{ height: '100%' }}>
      <Map/>
      {city ? <CityName/> :  <CityInput/>}
    </Page>
  )
)
