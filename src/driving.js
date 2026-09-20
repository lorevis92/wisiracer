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

// Device beta is the lateral axis in landscape; reverse with screen rotation.
export function phoneTilt(beta, gamma, angle) {
  if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return null;
  const a = ((angle % 360) + 360) % 360;
  return a === 90 ? beta : a === 270 ? -beta : a === 180 ? -gamma : gamma;
}
export function tiltSteering(value, neutral) {
  const delta = ((value - neutral + 540) % 360) - 180;
  const magnitude = Math.max(0, Math.abs(delta) - 3);
  return Math.sign(delta) * clamp(magnitude / 23, 0, 1);
}

// Longitudinal tilt is independent of lateral tilt in landscape.
export function phonePitch(beta,gamma,angle){
 if(!Number.isFinite(beta)||!Number.isFinite(gamma))return null;
 const a=((angle%360)+360)%360;
 return a===90?gamma:a===270?-gamma:a===180?-beta:beta;
}
export function flightDirection(yaw,pitch){
 const c=Math.cos(pitch);return {x:-Math.sin(yaw)*c,y:Math.sin(pitch),z:-Math.cos(yaw)*c};
}
