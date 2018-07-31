import _ from 'lodash'
import ClipperLib from '../clipper'
import turf from 'turf'
import * as d3 from 'd3'

import { Point } from './point'
import { segmentsFromPoints, Segment } from './segment'
import { EPSILON } from '../constants/generic'
import BoundingBox from './bounding-box'
import { getUniqueEquitables } from '../utils/generic'

export class Contour {
  constructor(points) {
    if (points.empty_()) {
      this.points = []
    } else {
      let copiedPoints = [...points]
      if (!isClockwise(copiedPoints)) copiedPoints.reverse()

      const lowestPointIndex = copiedPoints.indexOf(
        _.sortBy(copiedPoints, ['x', 'y'])[0]
      )

      this.points = [
        ...copiedPoints.slice(lowestPointIndex, copiedPoints.length),
        ...copiedPoints.slice(0, lowestPointIndex)
      ]
    }
  }

  equalTo({ points }) {
    return (
      this.points.length === points.length &&
      this.points.every((point, index) => point.equalTo(points[index]))
    )
  }

  moveTo(vector) {
    return new Contour(this.points.map_('addVector', vector))
  }

  segments() {
    return segmentsFromPoints(this.points)
  }
  isPointInside(point) {
    const pointInPolygon = this.isPointFullyInside(point)
    const pointOnThEdge = this.segments().some_('isPointInside', point)
    return pointInPolygon || pointOnThEdge
  }
  isPointFullyInside(point) {
    return d3.polygonContains(this.points.map_('array'), point.array())
  }
  pointOnEdge(point) {
    return this.segments().some_('isPointInside', point)
  }
  isSegmentOnEdge(segment) {
    return this.segments().some_('isSegmentInside', segment)
  }
  area() {
    return Math.abs(signedPolygonArea(this.points))
  }
  length() {
    return this.segments()
      .map_('length')
      .sum_()
  }
  boundingBox() {
    return new BoundingBox(this.points)
  }
  minkovskiSumWith(contour) {
    const clipperResult = ClipperLib.Clipper.MinkowskiSum(
      this._clipperPoints(),
      contour._clipperPoints(),
      true
    )[0]
    if (clipperResult) return contourFromClipperPoints(clipperResult)
  }
  minkovskiDiffWith(contour) {
    const clipperResult = ClipperLib.Clipper.MinkowskiDiff(
      contour._clipperPoints(),
      this._clipperPoints(),
      true
    )[1]
    if (clipperResult) return contourFromClipperPoints(clipperResult)
  }
  offsetWith(number) {
    let solution = []
    const co = new ClipperLib.ClipperOffset(0, 0)
    co.AddPath(
      this._clipperPoints(),
      ClipperLib.JoinType.jtMiter,
      ClipperLib.EndType.etClosedPolygon
    )
    co.Execute(solution, number / EPSILON)
    const result = contourFromClipperPoints(solution[0])
    return result
  }
  _clipperPoints() {
    return this.points.map(({ x, y }) => ({
      X: Math.round(Number(x / EPSILON)),
      Y: Math.round(Number(y / EPSILON))
    }))
  }
  isConvex() {
    const segments = this.segments()
    const direction = segments
      .last_()
      .vector()
      .crossProduct(segments[0].vector())
    const directions = segments
      .without_(segments.last_())
      .map((segment, index) =>
        segment.vector().crossProduct(segments[index + 1].vector())
      )

    return directions.every(dir => dir * direction > 0)
  }
  isEveryContourPointInside(other) {
    return other.points.every(point => this.isPointInside(point))
  }
  areaOnMap() {
    return turf.area(
      turf.polygon([[...this.points.map_('array'), this.points[0].array()]])
    )
  }
  opposite(point) {
    const pointIndex = this.points.indexOf(this.points.find_('equalTo', point))
    return this.points[
      (pointIndex + this.points.length / 2) % this.points.length
    ]
  }
  center() {
    if (this.points.length === 1) return this.points[0]

    const summed = this.points.reduce(
      (point, { x, y }) => new Point(x + point.x, y + point.y),
      new Point(0, 0)
    )

    return new Point(
      summed.x / this.points.length,
      summed.y / this.points.length
    )
  }
  rotateOn(angle) {
    const center = this.center()
    return this.map(point => {
      const vector = center.vectorTo(point)
      const rotated = vector.rotateOn(angle)
      return center.addVector(rotated)
    })
  }
  map(func) {
    return new Contour(this.points.map(func))
  }
  rotateOnMap(angle, project, unproject) {
    return this.map(project)
      .rotateOn(angle)
      .map(unproject)
  }
  otherContourPointInside(other) {
    return other.points.some(p => this.isPointInside(p))
  }
  isIntersect(other) {
    return (
      this.otherContourPointInside(other) || other.otherContourPointInside(this)
    )
  }
  isIntersectInMoreThenOnePoint(other) {
    const otherPointsInside = other.points.filter(p => this.isPointInside(p))
    const thisPointsInside = this.points.filter(p => other.isPointInside(p))
    return (
      getUniqueEquitables([...otherPointsInside, ...thisPointsInside]).length >
      1
    )
  }
  // for rectangle:
  //   ____
  //  |\  /|
  //  | \/ |
  //  | /\ |
  //  |/__\|
  diagonals() {
    return this.points
      .slice(0, Math.floor(this.points.length / 2))
      .map(p => new Segment(p, this.points.next_(this.points.next_(p))))
  }
  sameFlowSegment(segment) {
    const parentSegment = this.segments().find(s => s.isSegmentInside(segment))
    return parentSegment &&
      parentSegment.vector().haveSameDirectionWith(segment.vector())
      ? segment
      : segment.reverse()
  }
}

const contourFromClipperPoints = clipperPoints =>
  new Contour(
    clipperPoints.map(({ X, Y }) => new Point(X * EPSILON, Y * EPSILON))
  )

const signedPolygonArea = points =>
  points.reduce((area, point, index) => {
    const next = points[(index + 1) % points.length]
    return area + point.x * next.y - next.x * point.y
  }, 0) / 2

const isClockwise = points =>
  points.length < 3 ? false : signedPolygonArea(points) < 0


export const contoursConnectedWithSegment = (contours, segment) =>
  contours.filter(contour =>
    contour.segments().some_('isSegmentInside', segment)
  )

export const mergeAll = contours => {
  const inner = (contours, result) => {
    const connectedToResult = contours.find_(
      'isIntersectInMoreThenOnePoint',
      result
    )
    return connectedToResult
      ? inner(
          contours.without_(connectedToResult),
          result.joinWith(connectedToResult)
        )
      : result
  }
  return inner(contours.withoutLast_(), contours.last_())
}

export const pointsForContourFromSegments = segments => {
  const inner = (toVisit, points) => {
    if (toVisit.length === 0) return points

    const last = points.last_()
    const segment = toVisit.find(s => s.array().find(p => p.equalTo(last)))
    if (!segment) return points
    const point = segment.array().find(p => !p.equalTo(last))
    return inner(toVisit.without_(segment), [...points, point])
  }

  return inner(segments.withoutLast_(), [segments.last_().start])
}

export const contourFromSegments = segments =>
  new Contour(pointsForContourFromSegments(segments))

export const contoursFromSegments = segments => {
  const inner = (segments, contours) => {
    if (segments.length === 0) return contours

    const contour = contourFromSegments(segments)

    return inner(segments.filter(s => !contour.isSegmentOnEdge(s)), [
      ...contours,
      contour
    ])
  }
  return inner(segments, [])
}

export const getContainingContour = contours =>
  contours.find(c =>
    contours.without_(c).every(oc => c.isEveryContourPointInside(oc))
  )

export const simplifyPointsForContour = points => {
  const inner = (before, after) => {
    if (after.length === 0) return before
    const [current, ...newAfter] = after
    const allPoints = [...before, ...after]
    const prevPoint = allPoints.previous_(current)
    const nextPoint = allPoints.next_(current)
    const segment = new Segment(prevPoint, nextPoint)
    return inner(
      segment.isPointInside(current) ? before : [...before, current],
      newAfter
    )
  }

  return inner([], points)
}
