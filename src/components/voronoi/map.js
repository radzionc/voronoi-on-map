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

  componentDidMount() {
    this.map = this.refs.reactMap.getMap()
  }

  componentDidUpdate(prev) {
    const { updateMap, cityBoundingBox } = this.props
    if (prev.cityBoundingBox !== cityBoundingBox && this.map) {
      const [minLng, maxLng, minLat, maxLat] = cityBoundingBox
      console.log([[minLat, minLng], [maxLat, maxLng]])
      this.map.fitBounds([[minLat, minLng], [maxLat, maxLng]], {
        padding: 0
      })
      this.map.on('moveend', () =>
        updateMap({
          zoom: this.map.getZoom(),
          longitude: this.map.getCenter().lng,
          latitude: this.map.getCenter().lat
        })
      )
    }
  }
}

export default connectTo(
  state => ({
    ...takeFromState(state, 'generic', ['pageWidth', 'pageHeight']),
    ...state.voronoi
  }),
  actions,
  Map
)
