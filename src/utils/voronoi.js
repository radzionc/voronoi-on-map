import turfVoronoi from '@turf/voronoi'

import { Contour } from '../geometry/contour'
import { Point } from '../geometry/point';


export const getPolygons = ([minLat, minLng, maxLat, maxLng], points) => {
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