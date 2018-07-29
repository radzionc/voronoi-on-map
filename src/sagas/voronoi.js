/*global google:true*/

import { put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import turf from 'turf'
import turfVoronoi from '@turf/voronoi'

import { get } from '../utils/api'
import { startSearchingNewCity, receiveCity, updateResearchedRectangles } from '../actions/voronoi'
import { Point } from '../geometry/point';
import { Contour } from '../geometry/contour'
import { STAGES } from '../constants/voronoi'

const MAX_NUMBER_OF_PLACES = 60
const MAX_AREA_FOR_SEARCH = 60000000

const split = rectangle => {
  const firstDistance = turf.distance(...rectangle.slice(0, 2))
  const secondDistance = turf.distance(...rectangle.slice(1, 3))
  if (firstDistance > secondDistance) {
    const firstCenter = turf.midpoint(...rectangle.slice(0, 2)).geometry.coordinates
    const secondCenter = turf.midpoint(...rectangle.slice(2)).geometry.coordinates
    return [
      [...rectangle[0], ...secondCenter ],
      [...firstCenter, ...rectangle[2]]
    ]
  } else {
    const firstCenter = turf.midpoint(...rectangle.slice(1, 3)).geometry.coordinates
    const secondCenter = turf.midpoint(rectangle[3], rectangle[0]).geometry.coordinates
    return [
      [...rectangle[0], ...firstCenter ],
      [...secondCenter, ...rectangle[2]]
    ]
  }
}

export function* selectCity({ payload }) {
  const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(payload)}?format=json&polygon_geojson=1&type=city`
  const places = yield call(get, url)
  const city = places.find(p => p.type === 'city' && ['MultiPolygon', 'Polygon'].includes(p.geojson.type))
  if (!city) {
    yield put(startSearchingNewCity())
  } else {
    const [minLng, maxLng, minLat, maxLat] = city.boundingbox.map(Number)
    yield put(receiveCity(({ ...city, boundingbox: [[minLat, minLng], [maxLat, maxLng]] })))
  }
}

const getPolygons = (rect, points) => {
  const [minLat, minLng, maxLat, maxLng] = rect
  const voronoiPolygons = turfVoronoi(
    {
      type: "FeatureCollection",
      features: points
        .map_('array').map_('reverse_').reduce((acc,p) => acc.find(([x, y]) => x === p[0] && y === p[1]) ? acc : [...acc, p], [])
        .map((coordinates) => ({
          type: "Feature",
          geometry: {
            type: 'Point',
            coordinates
          }
        }))
    },
    {
      bbox: [minLng, minLat, maxLng, maxLat]
    }
  ).features
  .map(({ geometry: { coordinates } }) => coordinates[0].withoutLast_().map(([ y, x ]) => new Point(x, y)))
  .map(points => new Contour(points))
  .filter(c => c)
  return voronoiPolygons
}

export function* selectPlace({ payload }) {
  const { voronoi: { hiddenGoogleMap, cityBoundingBox }} = yield select()

  let researchedRects = []
  let unresearchedRects = [cityBoundingBox.flatten_()]
  while(unresearchedRects.length) {
    const rect = unresearchedRects[0]
    unresearchedRects = unresearchedRects.slice(1)
    const bboxPolygon = turf.bboxPolygon(rect).geometry.coordinates[0].slice(0, 4)
    const area = turf.area(turf.bboxPolygon(rect))
    if (area > MAX_AREA_FOR_SEARCH) {
      unresearchedRects = [
        ...unresearchedRects,
        ...split(bboxPolygon)
      ]
      continue
    }
    const [minLat, minLng, maxLat, maxLng] = rect
    const request = {
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(minLng, minLat),
        new google.maps.LatLng(maxLng, maxLat),
      ),
      type: payload,
    }
    const service = new google.maps.places.PlacesService(hiddenGoogleMap)
    let placesReceived = false
    let rectPlaces = []
    
    service.nearbySearch(request, (results, status, pagination) => {
      rectPlaces = [...rectPlaces, ...results]
      if(pagination.hasNextPage) {
        pagination.nextPage()
      } else {
        placesReceived = true
      }
    })
    while(!placesReceived) {
      const { voronoi: { stage } } = yield select()
      if (stage !== STAGES.VORONOI) return
      yield call(delay, 500)
    }
    if (rectPlaces.length !== MAX_NUMBER_OF_PLACES) {
      const points = rectPlaces.map(p => new Point(p.geometry.location.lng(), p.geometry.location.lat()))
      const contour = new Contour(bboxPolygon.map(([ x, y ]) => new Point(x, y)))
      researchedRects = [...researchedRects, {
        contour,
        places: points,
        polygons: getPolygons(rect, points)
      }]
      yield put(updateResearchedRectangles(researchedRects))
    }
    else {
      unresearchedRects = [
        ...unresearchedRects,
        ...split(bboxPolygon)
      ]
    }
  }

  const bboxPolygon = turf.bboxPolygon(cityBoundingBox.flatten_()).geometry.coordinates[0].slice(0, 4)
  const contour = new Contour(bboxPolygon.map(([ x, y ]) => new Point(x, y)))
  const places = researchedRects.take_('places').flatten_()
  yield put(updateResearchedRectangles([{
    contour,
    places,
    polygons: getPolygons(cityBoundingBox.flatten_(), places)
  }]))
}
