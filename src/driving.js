export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function steeringRate(input, speed, braking) {
  // Predictable turn response: tighter when braking, calmer under boost.
  return -clamp(input, -1, 1) * (braking ? 1.65 : 1.35) * clamp(125 / Math.max(speed, 85), 0.62, 1.15);
}
export function approach(current, target, rate, dt) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}
export function padSteering(clientX, left, width) {
  const v = clamp((clientX - left - width / 2) / (width * 0.42), -1, 1);
  return Math.abs(v) < 0.09 ? 0 : Math.sign(v) * (Math.abs(v) - 0.09) / 0.91;
}
export function cornerSpeed(curvature, cruise) {
  return Math.min(cruise, Math.sqrt(105 / Math.max(curvature, 0.0001)));
}
