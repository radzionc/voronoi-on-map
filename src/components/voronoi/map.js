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
import SpecialCell from './special-cell'
import { STAGES } from '../../constants/voronoi';
import { getPolygons } from '../../utils/voronoi'

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

  redraw = ({ project, unproject }) => {
    const { cityGeoJson, rectangles, stage, mouseX, mouseY } = this.props
    if ([STAGES.SEARCH_CITY, STAGES.SEARCH_CITY, STAGES.IN_FLY].includes(stage)) return null


    const rects = rectangles.take_('contour').map(contour => contour.map(project))
    const places = rectangles.take_('places').flatten_().map(project)
    const contoursPoints = (cityGeoJson.type === 'MultiPolygon' ? cityGeoJson.coordinates.flatten_() : cityGeoJson.coordinates).map(coordinates => coordinates.map(([ x, y ]) => project(new Point(x, y))))
    
    let cells = rectangles.take_('polygons').flatten_().map(contour => contour.map(project))
    let specialCell = undefined
    const mousePoint = new Point(mouseX, mouseY)
    const mouseRect = rects.find(rect => rect.isPointInside(mousePoint))
    try {
      if (mouseRect) {
        const initialRectangle = rectangles[rects.indexOf(mouseRect)]
        const newRectCells = getPolygons(
          [
            ...initialRectangle.contour.points[0].array(),
            ...initialRectangle.contour.points[2].array()
          ],
          [...initialRectangle.places, unproject(mousePoint)]
        ).map(contour => contour.map(project))
        cells = [
          ...rectangles.without_(initialRectangle).take_('polygons').flatten_().map(contour => contour.map(project)),
          ...newRectCells
        ]
        specialCell = cells.find(c => c.isPointInside(mousePoint))
        cells = cells.without_(specialCell)
      }
    } catch(err) {(() => null)(err)}
    return (
      <g>
        {
          rects.map(({ points }, index) => (
            <Rectangle key={'rectangle' + index} points={points}/>
          ))
        }
        {
          cells.map(({ points }, index) => (
            <Cell key={'cell' + index} points={points} />
          ))
        }
        {
          specialCell && <SpecialCell key={'specialCell'} points={specialCell.points}/>
        }
        {
          places.map(({ x, y }, index) => (
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
    ...state.voronoi,
    ...state.generic
  }),
  actions,
  Map
)
