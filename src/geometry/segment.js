import { areEqual } from '../utils/generic'
import Vector from './vector'
import { Point } from './point'
import { Contour } from './contour'

export class Segment {
  constructor(start, end) {
    this.start = start
    this.end = end
  }

  moveTo(vector) {
    return new Segment(this.start.addVector(vector), this.end.addVector(vector))
  }
  isPointInside(point) {
    return areEqual(
      this.start.distanceTo(point) + this.end.distanceTo(point),
      this.length()
    )
  }
  equalTo(other, sameDirection = false) {
    const equal = this.start.equalTo(other.start) && this.end.equalTo(other.end)
    return (
      equal ||
      (sameDirection
        ? false
        : this.end.equalTo(other.start) && this.start.equalTo(other.end))
    )
  }
  vector() {
    return new Vector(this.end.x - this.start.x, this.end.y - this.start.y)
  }
  length() {
    return this.vector().length
  }
  _siblingsTo(point, others) {
    return others.filter(
      other => other !== this && other.array().some(p => p.equalTo(point))
    )
  }
  startSiblings(others) {
    return this._siblingsTo(this.start, others)
  }
  endSiblings(others) {
    return this._siblingsTo(this.end, others)
  }
  siblings(others) {
    return [...this.startSiblings(others), ...this.endSiblings(others)]
  }
  joinWith(other) {
    if (this.equalTo(other)) return this
    const allPoints = [...this.array(), ...other.array()]
    const [start, end] = allPoints.filter(
      point => allPoints.filter(point.equalTo.bind(point)).length === 1
    )
    return new Segment(start, end)
  }
  canBeJoinedWith(other) {
    if (!this.areSibling(other)) return false
    const thisDirection = this.vector().normalize()
    const otherDirection = other.vector().normalize()
    const haveSameDirection =
      thisDirection.point().equalTo(otherDirection.point()) ||
      thisDirection.point().equalTo(otherDirection.negate().point())
    return haveSameDirection
  }
  onTheEdge(point) {
    return this.array().some(p => p.equalTo(point))
  }
  array() {
    return [this.start, this.end]
  }
  areSibling(other) {
    return other !== this && other.array().some(point => this.onTheEdge(point))
  }
  lineWillIntersectIn(point, vector) {
    const newPoint = this.linesWillIntersectIn(
      new Segment(point, point.addVector(vector))
    )

    return this.isPointInside(newPoint) ? newPoint : undefined
  }
  segmentWillIntersectIn(other) {
    const point = this.linesWillIntersectIn(other)
    return this.isPointInside(point) && other.isPointInside(point)
      ? point
      : undefined
  }
  linesWillIntersectIn(other) {
    const first = this.start.x * this.end.y - this.end.x * this.start.y
    const second = other.start.x * other.end.y - other.start.y * other.end.x
    const third =
      (this.start.x - this.end.x) * (other.start.y - other.end.y) -
      (this.start.y - this.end.y) * (other.start.x - other.end.x)

    return new Point(
      (first * (other.start.x - other.end.x) -
        (this.start.x - this.end.x) * second) /
        third,
      (first * (other.start.y - other.end.y) -
        (this.start.y - this.end.y) * second) /
        third
    )
  }
  isSegmentInside({ start, end }) {
    return this.isPointInside(start) && this.isPointInside(end)
  }
  string() {
    return `start: (${this.start.x}, ${this.start.y}), end: (${this.end.x}, ${
      this.end.y
    })`
  }
  startFrom(point) {
    return point.equalTo(this.start) ? this : this.reverse()
  }
  reverse() {
    return new Segment(this.end, this.start)
  }
  coDirectionalWith(vector) {
    return this.vector().crossProduct(vector) > 0 ? this : this.reverse()
  }
  // http://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
  areIntersect(other) {
    const orientation = (p, q, r) => {
      const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
      return val === 0 ? 0 : val > 0 ? 1 : 2
    }
    const onSegment = (p, q, r) =>
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) &&
      q.y >= Math.min(p.y, r.y)

    const o1 = orientation(this.start, this.end, other.start)
    const o2 = orientation(this.start, this.end, other.end)
    const o3 = orientation(other.start, other.end, this.start)
    const o4 = orientation(other.start, other.end, this.end)

    return (
      (o1 !== o2 && o3 !== o4) ||
      (o1 === 0 && onSegment(this.start, other.start, this.end)) ||
      (o2 === 0 && onSegment(this.start, other.end, this.end)) ||
      (o3 === 0 && onSegment(other.start, this.start, other.end)) ||
      (o4 === 0 && onSegment(other.start, this.end, other.end))
    )
  }
  rectangle(width) {
    const widthVector = this.vector()
      .perpendicular()
      .withLength(width / 2)
    return new Contour([
      this.start.addVector(widthVector),
      this.start.addVector(widthVector.negate()),
      this.end.addVector(widthVector.negate()),
      this.end.addVector(widthVector)
    ])
  }
  center() {
    return this.start.addVector(this.vector().withLength(this.length() / 2))
  }
  // stack overflow to resque: https://stackoverflow.com/questions/10301001/perpendicular-on-a-line-segment-from-a-given-point
  projectPoint(point) {
    const x1 = this.start.x
    const y1 = this.start.y
    const x2 = this.end.x
    const y2 = this.end.y
    const x3 = point.x
    const y3 = point.y
    const px = x2 - x1,
      py = y2 - y1,
      dAB = px * px + py * py
    const u = ((x3 - x1) * px + (y3 - y1) * py) / dAB
    const x = x1 + u * px,
      y = y1 + u * py

    return new Point(x, y)
  }
  distanceTo(point) {
    return this.projectPoint(point).vectorTo(point).length
  }
  map(func) {
    return new Segment(...this.array().map(func))
  }

  extendOn(number) {
    const vector = this.vector().withLength(number)
    return new Segment(
      this.start.addVector(vector.negate()),
      this.end.addVector(vector)
    )
  }

  shortestDistanceTo(point) {
    const projected = this.projectPoint(point)
    return this.isPointInside(projected)
      ? projected.distanceTo(point)
      : Math.min(this.start.distanceTo(point), this.end.distanceTo(point))
  }

  pointsBetween(number) {
    const step = this.length() / (number + 1)
    const vector = this.vector().normalize()
    return Array.from(Array(number).keys()).map(i =>
      this.start.addVector(vector.scaleBy(step * (i + 1)))
    )
  }
}

export const segmentFromNumbers = (x1, y1, x2, y2) =>
  new Segment(new Point(x1, y1), new Point(x2, y2))

export const segmentsFromPoints = points =>
  points.slice(0).map((point, index) => {
    const next = points[(index + 1) % points.length]
    return new Segment(point, next)
  })
