import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MASTERPLAN,utgenraHeight,CITY_SCALE,cityHalfWidth} from '../src/masterplan.js';
const curve=new THREE.CatmullRomCurve3(MASTERPLAN.pts.map(p=>new THREE.Vector3(...p)),true,'centripetal',.6);
test('masterplan forms a extended loop with a straight starting grid',()=>{
 const length=curve.getLength();assert.ok(length>23600&&length<25200);
 const east=new THREE.Vector3(1,0,0);
 for(let d=-60;d<450;d+=10) assert.ok(curve.getTangentAt((d/length+1)%1).angleTo(east)<.02);
 assert.ok(curve.getPointAt(0).distanceTo(curve.getPointAt(1))<1e-7);
});
test('Utgenra has a flat 115m belvedere and stays clear of the circuit',()=>{
 assert.equal(utgenraHeight(1240,490),115);assert.ok(utgenraHeight(1500,650)>250);
 for(const p of curve.getSpacedPoints(1600)) {assert.equal(utgenraHeight(p.x/CITY_SCALE,-p.z/CITY_SCALE),0);assert.equal(utgenraHeight((p.x+MASTERPLAN.halfWidth+7)/CITY_SCALE,-p.z/CITY_SCALE),0);}
 for(const [x,y] of [[1100,400],[1850,400],[1400,120],[1400,1040]])assert.equal(utgenraHeight(x,y),0);
});

test('most of the route is wide, with two gradual short narrow sections',()=>{
 let wide=0;for(let i=0;i<1000;i++){const t=i/1000,w=cityHalfWidth(t);assert.ok(w>=48&&w<=80);if(w===80)wide++;assert.ok(Math.abs(cityHalfWidth(t+.001)-w)<1.5);}
 assert.ok(wide>=850);assert.equal(cityHalfWidth(0),80);assert.equal(cityHalfWidth(.38),48);assert.equal(cityHalfWidth(.73),48);
});
