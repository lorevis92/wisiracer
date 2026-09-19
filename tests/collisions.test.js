import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveContact, resolveBarrier } from '../src/collisions.js';

const body=(x,z,vx=0,vz=0)=>({x,z,vx,vz});
test('head-on collision separates hulls, conserves momentum, dissipates energy',()=>{
 const a=body(-6,0,80),b=body(6,0,-40);
 const energy=a.vx**2+b.vx**2;
 const hit=resolveContact(a,b);
 assert.equal(hit.speed,120);
 assert.ok(b.x-a.x>=14);
 assert.ok(Math.abs(a.vx+b.vx-40)<1e-9);
 assert.ok(a.vx**2+b.vx**2<energy);
 assert.ok(b.vx>a.vx);
});
test('rear-end contact accelerates the racer ahead',()=>{
 const a=body(0,0,0,-180),b=body(0,-12,0,-120);
 resolveContact(a,b);
 assert.ok(a.vz>-180);assert.ok(b.vz<-120);
});
test('separating hulls are not pulled back together',()=>{
 const a=body(-6,0,-30),b=body(6,0,30);
 const hit=resolveContact(a,b);
 assert.equal(hit.speed,0);assert.equal(a.vx,-30);assert.equal(b.vx,30);
});
test('coincident centers never produce NaN',()=>{
 const a=body(0,0),b=body(0,0);resolveContact(a,b);
 assert.ok(Object.values(a).every(Number.isFinite));assert.ok(b.x-a.x>=14);
});
test('barrier reflects outward speed while preserving travel along the wall',()=>{
 const a=body(30,0,70,-130);
 const hit=resolveBarrier(a,{x:0,z:0},{x:1,z:0},27);
 assert.equal(hit.speed,70);assert.equal(a.x,27);assert.equal(a.vz,-130);assert.ok(a.vx<0);
});
test('both walls and noncontacts behave symmetrically',()=>{
 const a=body(-32,0,-70,-130);resolveBarrier(a,{x:0,z:0},{x:1,z:0},27);
 assert.equal(a.x,-27);assert.ok(a.vx>0);
 assert.equal(resolveBarrier(body(0,0),{x:0,z:0},{x:1,z:0},27),null);
 assert.equal(resolveContact(body(0,0),body(50,0)),null);
});
test('bounded substeps catch a high-speed opposing collision at 30/60/120 fps',()=>{
 for(const fps of [30,60,120]) {
  const a=body(-25,0,220),b=body(25,0,-220);let contacts=0;
  for(let frame=0;frame<fps/2;frame++) {
   const steps=Math.ceil(120/fps),dt=1/fps/steps;
   for(let i=0;i<steps;i++) {
    a.x+=a.vx*dt;b.x+=b.vx*dt;
    if(resolveContact(a,b)?.speed>0)contacts++;
   }
  }
  assert.equal(contacts,1);assert.ok(a.x<b.x);
 }
});
