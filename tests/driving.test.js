import test from 'node:test';
import assert from 'node:assert/strict';
import {steeringRate,approach,padSteering,cornerSpeed} from '../src/driving.js';
test('touch steering has a neutral zone and full travel in both directions',()=>{
 assert.equal(padSteering(150,50,200),0);
 assert.equal(padSteering(154,50,200),0);
 assert.equal(padSteering(50,50,200),-1);
 assert.equal(padSteering(250,50,200),1);
 assert.ok(padSteering(190,50,200)>0);
});
test('steering becomes calmer with speed, with extra authority under braking',()=>{
 assert.ok(Math.abs(steeringRate(1,180,false))<Math.abs(steeringRate(1,100,false)));
 assert.ok(Math.abs(steeringRate(1,100,true))>Math.abs(steeringRate(1,100,false)));
 assert.equal(steeringRate(-1,100,false),-steeringRate(1,100,false));
});
test('exponential control response is consistent across frame rates',()=>{
 const results=[30,60,120].map(fps=>{let x=0;for(let i=0;i<fps;i++)x=approach(x,130,1.6,1/fps);return x;});
 assert.ok(Math.max(...results)-Math.min(...results)<1e-9);
});
test('AI slows for tighter curves without exceeding cruise speed',()=>{
 assert.equal(cornerSpeed(0,140),140);
 assert.ok(cornerSpeed(0.03,140)<cornerSpeed(0.01,140));
});

import {phoneTilt, tiltSteering} from '../src/driving.js';
test('phone steering reverses the sensor axis for opposite landscape orientations',()=>{
 assert.equal(phoneTilt(20,5,90),20);
 assert.equal(phoneTilt(-20,5,270),20);
 assert.equal(phoneTilt(-20,5,-90),20);
 assert.equal(phoneTilt(null,5,90),null);
});
test('tilt steering calibrates neutral, rejects jitter and handles angle wrap',()=>{
 assert.equal(tiltSteering(12,12),0);
 assert.equal(tiltSteering(14,12),0);
 assert.equal(tiltSteering(38,12),1);
 assert.equal(tiltSteering(-14,12),-1);
 assert.equal(tiltSteering(-179,179),0);
});

test('landscape left tilt matches the left button through the driving pipeline',()=>{
 for(const [angle,beta] of [[90,-26],[270,26],[-90,26]]){
  const input=tiltSteering(phoneTilt(beta,5,angle),phoneTilt(0,5,angle));
  assert.equal(input,-1);
  assert.equal(steeringRate(input,100,false),steeringRate(padSteering(0,0,200),100,false));
  assert.equal(tiltSteering(phoneTilt(-beta,5,angle),0),1);
 }
});

import {phonePitch,flightDirection} from '../src/driving.js';
test('landscape pitch keeps the same climb command when device is rotated',()=>{
 assert.equal(phonePitch(0,20,90),phonePitch(0,-20,270));
 assert.equal(phonePitch(0,null,90),null);
 const climb=flightDirection(.8,.5),dive=flightDirection(.8,-.5),level=flightDirection(.8,0);
 assert.ok(climb.y>0&&dive.y<0);assert.equal(level.y,0);
 assert.ok(Math.abs(Math.hypot(climb.x,climb.y,climb.z)-1)<1e-12);
 assert.equal(climb.x,dive.x);assert.equal(climb.z,dive.z);
});

import {altitudeMotion} from '../src/driving.js';
test('altitude buttons give frame-rate independent rise and gentle level-off',()=>{
 const runs=[30,60,120].map(fps=>{let v=0,y=0;for(let i=0;i<fps;i++){const n=altitudeMotion(v,1,1/fps);v=n.velocity;y+=n.delta;}const releaseY=y;for(let i=0;i<fps;i++){const n=altitudeMotion(v,0,1/fps);v=n.velocity;y+=n.delta;}return {v,y,drift:y-releaseY};});
 for(const r of runs){assert.ok(Math.abs(r.v)<.001);assert.ok(r.drift<1.84);assert.ok(r.y>15);}
 assert.ok(Math.max(...runs.map(r=>r.y))-Math.min(...runs.map(r=>r.y))<1e-9);
 const up=altitudeMotion(0,1,.2),down=altitudeMotion(0,-1,.2);assert.equal(up.delta,-down.delta);assert.equal(altitudeMotion(0,0,1).delta,0);
});
