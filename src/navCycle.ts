// helpers

export function applyPan(
  transform: DOMMatrix,
  currentPoint: Point,
  previousPoint: Point,
) {
  return new DOMMatrix()
    .translate(currentPoint.x, currentPoint.y)
    .translate(-previousPoint.x, -previousPoint.y)
    .multiply(transform);
}
