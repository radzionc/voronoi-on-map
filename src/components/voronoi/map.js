import React from 'react'
import ReactMapGL from 'react-map-gl'

import { MAP_OPTIONS } from '../../constants/map'
import * as actions from '../../actions/voronoi'
import { connectTo, takeFromState } from '../../utils/generic'
import SVGOverlay from './SVG-overlay'
import { Point } from '../../geometry/point';
import Contour from './contour'
import Rectangle from './rectangle'
import Place from './place'
import Cell from './cell'
import { STAGES } from '../../constants/voronoi';


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
      cityGeoJson,
      inFly
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
        {cityGeoJson && !inFly &&
          <SVGOverlay
            redraw={this.redraw}
            updateProjections={updateProjections}
          />
        }
      </ReactMapGL>
    )
  }

  redraw = ({ project }) => {
    const { cityGeoJson, rectangles, stage } = this.props
    const rects = rectangles.take_('contour')
    const cells = rectangles.take_('polygons').flatten_()
    console.log(cells)
    const places = rectangles.take_('places').flatten_()
    if ([STAGES.SEARCH_CITY, STAGES.SEARCH_CITY, STAGES.IN_FLY].includes(stage)) return null
    const placesPoints = places.map(project)
    const contoursPoints = (cityGeoJson.type === 'MultiPolygon' ? cityGeoJson.coordinates.flatten_() : cityGeoJson.coordinates).map(coordinates => coordinates.map(([ x, y ]) => project(new Point(x, y))))
    return (
      <g>
        {
          rects.map(({ points }, index) => (
            <Rectangle key={'rectangle' + index} points={points.map(project)}/>
          ))
        }
        {
          cells.map(({ points }, index) => (
            <Cell key={'cell' + index} points={points.map(project)} />
          ))
        }
        {
          placesPoints.map(({ x, y }, index) => (
            <Place key={'place' + index} x={x} y={y} />
          ))
        }
        {
          contoursPoints.map((points, index) => (
            <Contour
              key={'contour' + index}
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
    const { cityBoundingBox } = this.props
    if (prev.cityBoundingBox !== cityBoundingBox && this.map) {
      this.map.fitBounds(cityBoundingBox, {
        padding: 0
      })
      this.map.on('moveend', this.onMoveEnd)
    }
  }

  onMoveEnd = () => {
    const { updateMap, endFlyToCity } = this.props

    endFlyToCity()
    updateMap({
      zoom: this.map.getZoom(),
      longitude: this.map.getCenter().lng,
      latitude: this.map.getCenter().lat
    })
    this.map.off('moveend', this.onMoveEnd)
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
