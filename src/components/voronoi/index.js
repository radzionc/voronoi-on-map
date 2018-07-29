/*global google:true*/

import React from 'react'

import Page from '../page'
import Map from './map'
import TopNavigation from './top-navigation'
import { connectTo } from '../../utils/generic';
import { saveHiddenGoogleMap } from '../../actions/voronoi'
import CityInput from './city-input'
import Places from './places'
import { STAGES } from '../../constants/voronoi';

export default connectTo(
  state => state.voronoi,
  { saveHiddenGoogleMap },
  class Voronoi extends React.Component {
    render() {
      const { stage } = this.props
      return (
        <Page style={{ height: '100%' }}>
          <div style={{ position: 'absolute', zIndex: -100}} ref='hiddenGoogleMap'></div>
          <Map/>
          <TopNavigation/>
          {stage === STAGES.SEARCH_CITY && <CityInput/>}
          {stage === STAGES.SELECT_PLACE_TYPE && <Places/>}
        </Page>
      )
    }

    componentDidMount() {
      this.props.saveHiddenGoogleMap(new google.maps.Map(this.refs.hiddenGoogleMap))
    }
  }
)
