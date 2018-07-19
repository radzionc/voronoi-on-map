import React from 'react'
import ReactMapGL from 'react-map-gl'

import { MAP_OPTIONS } from '../../constants/map'
import * as actions from '../../actions/voronoi'
import { connectTo, takeFromState } from '../../utils/generic'


class Map extends React.Component {
  render() {
    const {
      pageWidth,
      pageHeight,
      zoom,
      latitude,
      longitude,
      onMapUpdate,
    } = this.props
    const mapProps = {
      ...MAP_OPTIONS,
      width: pageWidth,
      height: pageHeight,
      zoom,
      latitude,
      longitude,
      onViewportChange: onMapUpdate
    }
    return (
      <ReactMapGL {...mapProps} ref="reactMap">

      </ReactMapGL>
    )
  }

  
  // componentDidUpdate() {
  //   const { onMapUpdate, startLocation, endLocation } = this.props

  //   if (startLocation && endLocation && this.map) {
  //     const locations = [startLocation, endLocation]
  //     const sortedByLat = _.sortBy(locations, 'latitude')
  //     const sortedByLong = _.sortBy(locations, 'longitude')

  //     const maxLat = sortedByLat[sortedByLat.length - 1].latitude
  //     const minLat = sortedByLat[0].latitude
  //     const maxLong = sortedByLong[sortedByLong.length - 1].longitude
  //     const minLong = sortedByLong[0].longitude
  //     this.map.fitBounds([[minLong, minLat], [maxLong, maxLat]], {
  //       padding: 80
  //     })
  //     this.map.on('moveend', () =>
  //       onMapUpdate({
  //         zoom: this.map.getZoom(),
  //         longitude: this.map.getCenter().lng,
  //         latitude: this.map.getCenter().lat
  //       })
  //     )
  //   }
  // }
}

export default connectTo(
  state => ({
    ...takeFromState(state, 'generic', ['pageWidth', 'pageHeight']),
    ...state.voronoi
  }),
  actions,
  Map
)
