/*global google:true*/

import { put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import turf from 'turf'

import { get } from '../utils/api'
import { startSearchingNewCity, receiveCity, updatePlaces, updateResearchedRectangles, finishPlacesResearch } from '../actions/voronoi'
import { Point } from '../geometry/point';
import { Contour } from '../geometry/contour'
import { STAGES } from '../constants/voronoi'

const MAX_NUMBER_OF_PLACES = 60

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

export function* selectPlace({ payload }) {
  const { voronoi: { hiddenGoogleMap, cityBoundingBox }} = yield select()

  let places = []
  let researchedRects = []
  let unresearchedRects = [cityBoundingBox.flatten_()]
  while(unresearchedRects.length) {
    
    
    const [minLat, minLng, maxLat, maxLng] = unresearchedRects[0]
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
    const bboxPolygon = turf.bboxPolygon(unresearchedRects[0]).geometry.coordinates[0].slice(0, 4)
    unresearchedRects = unresearchedRects.slice(1)
    if (rectPlaces.length !== MAX_NUMBER_OF_PLACES) {
      places = [...places, ...rectPlaces]
      yield put(updatePlaces(places))

      researchedRects = [...researchedRects, new Contour(bboxPolygon.map(([ x, y ]) => new Point(x, y)))]
      yield put(updateResearchedRectangles(researchedRects))
    }
    else {
      unresearchedRects = [
        ...unresearchedRects,
        ...split(bboxPolygon)
      ]
    }
  }
  yield put(finishPlacesResearch())
}