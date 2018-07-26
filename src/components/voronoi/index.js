/*global google:true*/

import React from 'react'

import Page from '../page'
import Map from './map'
import CityInput from './city-input'
import CityName from './city-name'
import { connectTo } from '../../utils/generic';
import { saveHiddenGoogleMap } from '../../actions/voronoi'

export default connectTo(
  state => state.voronoi,
  { saveHiddenGoogleMap },
  class Voronoi extends React.Component {
    render() {
      const { city } = this.props
      return (
        <Page style={{ height: '100%' }}>
          <div style={{ position: 'absolute', zIndex: -100}} ref='hiddenGoogleMap'></div>
          <Map/>
          {city ? <CityName/> :  <CityInput/>}
        </Page>
      )
    }

    componentDidMount() {
      this.props.saveHiddenGoogleMap(new google.maps.Map(this.refs.hiddenGoogleMap))
    }
  }
)
