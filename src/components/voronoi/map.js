import React from 'react'
import ReactMapGL from 'react-map-gl'

import { MAP_OPTIONS } from '../../constants/map'
import * as actions from '../../actions/voronoi'
import { connectTo, takeFromState } from '../../utils/generic'
import SVGOverlay from './SVG-overlay'
import { Point } from '../../geometry/point';
import Contour from './contour'


class Map extends React.Component {
  render() {
    const {
      pageWidth,
      pageHeight,
      zoom,
      latitude,
      longitude,
      updateMap,
      updateProjections,
      cityGeoJson
    } = this.props
    const mapProps = {
      ...MAP_OPTIONS,
      width: pageWidth,
      height: pageHeight,
      zoom,
      latitude,
      longitude,
      onViewportChange: updateMap
    }
    return (
      <ReactMapGL {...mapProps} ref="reactMap">
        {cityGeoJson &&
          <SVGOverlay
            redraw={this.redraw}
            updateProjections={updateProjections}
          />
        }
      </ReactMapGL>
    )
  }

  redraw = ({ project, unproject }) => {
    const { cityGeoJson } = this.props
    console.log(cityGeoJson)
    const contoursPoints = (cityGeoJson.type === 'MultiPolygon' ? cityGeoJson.coordinates.flatten_() : cityGeoJson.coordinates).map(coordinates => coordinates.map(([ x, y ]) => project(new Point(x, y))))
    return (
      <g>
        {
          contoursPoints.map((points, index) => (
            <Contour
              key={index}
              points={points}
            />
          ))
        }
      </g>
    )
  }

  componentDidMount() {
    this.map = this.refs.reactMap.getMap()
  }

  componentDidUpdate(prev) {
    const { updateMap, cityBoundingBox } = this.props
    if (prev.cityBoundingBox !== cityBoundingBox && this.map) {
      const [minLng, maxLng, minLat, maxLat] = cityBoundingBox
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
