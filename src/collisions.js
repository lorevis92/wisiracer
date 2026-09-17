// Equal-mass arcade contacts in the horizontal plane. Physics units: metres/second.
// Call at a bounded timestep; damage/audio are deliberately handled by the caller.
export function resolveContact(a, b, radius = 7, restitution = 0.35) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const distance = Math.hypot(dx, dz);
  if (distance >= radius * 2) return null;
  const nx = distance > 0.0001 ? dx / distance : 1;
  const nz = distance > 0.0001 ? dz / distance : 0;
  const correction = (radius * 2 - distance + 0.01) * 0.5;
  a.x -= nx * correction; a.z -= nz * correction;
  b.x += nx * correction; b.z += nz * correction;
  const closing = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
  const impulse = Math.max(0, closing) * (1 + restitution) * 0.5;
  a.vx -= nx * impulse; a.vz -= nz * impulse;
  b.vx += nx * impulse; b.vz += nz * impulse;
  return { speed: Math.max(0, closing), nx, nz };
}

export function resolveBarrier(body, center, side, limit) {
  const lateral = (body.x - center.x) * side.x + (body.z - center.z) * side.z;
  if (Math.abs(lateral) <= limit) return null;
  const sign = Math.sign(lateral), nx = side.x * sign, nz = side.z * sign;
  const penetration = Math.abs(lateral) - limit;
  body.x -= nx * penetration; body.z -= nz * penetration;
  const outward = body.vx * nx + body.vz * nz;
  if (outward > 0) {
    body.vx -= nx * outward * 1.3;
    body.vz -= nz * outward * 1.3;
  }
  return { speed: Math.max(0, outward), nx, nz };
}
