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
