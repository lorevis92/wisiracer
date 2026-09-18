import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MASTERPLAN,utgenraHeight} from '../src/masterplan.js';
const curve=new THREE.CatmullRomCurve3(MASTERPLAN.pts.map(p=>new THREE.Vector3(...p)),true,'centripetal',.6);
test('masterplan forms a six-kilometre loop with a straight starting grid',()=>{
 const length=curve.getLength();assert.ok(length>5900&&length<6300);
 const east=new THREE.Vector3(1,0,0);
 for(let d=-60;d<450;d+=10) assert.ok(curve.getTangentAt((d/length+1)%1).angleTo(east)<.02);
 assert.ok(curve.getPointAt(0).distanceTo(curve.getPointAt(1))<1e-7);
});
test('Utgenra has a flat 115m belvedere and stays clear of the circuit',()=>{
 assert.equal(utgenraHeight(1240,490),115);assert.ok(utgenraHeight(1500,650)>250);
 for(const p of curve.getSpacedPoints(1600)) {assert.equal(utgenraHeight(p.x,-p.z),0);assert.equal(utgenraHeight(p.x+MASTERPLAN.halfWidth+7,-p.z),0);}
 for(const [x,y] of [[1100,400],[1850,400],[1400,120],[1400,1040]])assert.equal(utgenraHeight(x,y),0);
});
