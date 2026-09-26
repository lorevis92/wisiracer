import test from 'node:test';
import assert from 'node:assert/strict';
import {createAltitudeGesture,verticalAcceleration,gestureCommand} from '../src/altitudeGestures.js';
test('vertical projection follows gravity in either landscape grip',()=>{
 for(const g of [[9.81,0,0],[-9.81,0,0],[0,6,7.76]]){
  const len=Math.hypot(...g),a=g.map(v=>v/len*2);
  const event={acceleration:{x:a[0],y:a[1],z:a[2]},accelerationIncludingGravity:{x:a[0]+g[0],y:a[1]+g[1],z:a[2]+g[2]}};
  assert.ok(Math.abs(verticalAcceleration(event)-2)<1e-9);
  event.acceleration={x:0,y:0,z:0};event.accelerationIncludingGravity={x:g[0],y:g[1],z:g[2]};
  assert.equal(verticalAcceleration(event),0);
 }
 assert.equal(verticalAcceleration({acceleration:{x:null,y:0,z:0}}),null);
});
test('upward movement and its braking impulse produce one ascent, then a separate descent',()=>{
 for(const hz of [30,60,120]){
  const detector=createAltitudeGesture(),commands=[];let t=0;
  const run=(v,ms)=>{for(let elapsed=0;elapsed<ms;elapsed+=1000/hz){t+=1000/hz;const c=detector.sample(v,t);if(c)commands.push(c);}};
  run(0,500);run(2,130);run(-2,180);run(0,900);run(-2,130);run(2,180);run(0,900);
  assert.deepEqual(commands,[1,-1]);
 }
});
test('small tremor, startup pickup and stale sensor frames cannot trigger flight',()=>{
 const d=createAltitudeGesture();
 for(let t=0;t<400;t+=20)assert.equal(d.sample(3,t),0);
 for(let t=400;t<1000;t+=20)assert.equal(d.sample(.2*Math.sin(t),t),0);
 assert.equal(d.sample(3,3000),0);
 assert.equal(d.sample(null,3020),0);
 d.reset();assert.equal(d.sample(3,3040),0);
 assert.equal(gestureCommand({motionLift:1,motionUntil:1000},1001),0);
 assert.equal(gestureCommand({motionLift:-1,motionUntil:1000},900),-1);
});
