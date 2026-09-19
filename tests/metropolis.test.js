import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MASTERPLAN,landmarks} from '../src/masterplan.js';
import {metropolisLots,AVENUES,STREETS} from '../src/metropolis.js';
const curve=new THREE.CatmullRomCurve3(MASTERPLAN.pts.map(p=>new THREE.Vector3(...p)),true);
const samples=curve.getSpacedPoints(1600).map(p=>p.divideScalar(4));
const lots=metropolisLots(samples,landmarks);
test('city lots preserve roads, race corridor, landmarks and Utgenra',()=>{
 assert.ok(lots.length>1000);assert.ok(lots.filter(l=>l.tower).length>200);
 for(const l of lots){
  assert.ok(!(l.x>1030&&l.y>60));
  assert.ok(AVENUES.every(x=>Math.abs(l.x-x)>l.w/2+11));
  assert.ok(STREETS.every(y=>Math.abs(l.y-y)>l.d/2+8));
  assert.ok(samples.every(p=>Math.hypot(l.x-p.x,-l.y-p.z)>=Math.hypot(l.w,l.d)/2+42));
  assert.ok(landmarks.every(p=>Math.abs(l.x-p[1])>=105||Math.abs(l.y-p[2])>=95));
 }
});
test('city generation is deterministic and contains distinct height districts',()=>{
 assert.deepEqual(metropolisLots(samples,landmarks),lots);
 assert.ok(Math.max(...lots.map(l=>l.h))>350);
 assert.ok(lots.some(l=>l.h<40));
 assert.equal(new Set(lots.map(l=>l.district)).size,3);
});
