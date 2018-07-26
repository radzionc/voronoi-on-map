/*global google:true*/

import { put, call, select } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import turf from 'turf'

import { get } from '../utils/api'
import { startSearchingNewCity, receiveCity, updatePlaces } from '../actions/voronoi'


export function* selectCity({ payload }) {
  const url = `https://nominatim.openstreetmap.org/search/${encodeURIComponent(payload)}?format=json&polygon_geojson=1&type=city`
  console.log(url)
  const places = yield call(get, url)
  const city = places.find(p => p.type === 'city' && ['MultiPolygon', 'Polygon'].includes(p.geojson.type))
  if (!city) {
    yield put(startSearchingNewCity())
  } else {
    const [minLng, maxLng, minLat, maxLat] = city.boundingbox.map(Number)
    yield put(receiveCity(({ ...city, boundingbox: [[minLat, minLng], [maxLat, maxLng]] })))
    const { voronoi: { hiddenGoogleMap }} = yield select()
    const request = {
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(minLng, minLat),
        new google.maps.LatLng(maxLng, maxLat),
      ),
      type: 'bar',
    }
    const service = new google.maps.places.PlacesService(hiddenGoogleMap)
    let placesReceived = false
    let places = []
    
    service.nearbySearch(request, (results, status, pagination) => {
      places = [...places, ...results]
      console.log(places.length)
      if(pagination.hasNextPage) {
        pagination.nextPage()
      } else {
        placesReceived = true
      }
    })
    while(!placesReceived) {
      yield put(updatePlaces(places))
      yield call(delay, 500)
    }
    yield put(updatePlaces(places))
  }
}