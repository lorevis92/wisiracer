import test from 'node:test';import assert from 'node:assert/strict';
import {buildingIndex,resolveBuilding} from '../src/cityCollisions.js';
test('building wall preserves tangential motion and deflects inward motion',()=>{
 const b={x:14,z:0,vx:-20,vz:9};const hit=resolveBuilding(b,{x:0,z:0,hx:10,hz:20});
 assert.ok(b.x>17);assert.equal(b.vz,9);assert.ok(b.vx>0);assert.equal(hit.speed,20);
});
test('rotated facade contact and interior recovery remain finite',()=>{
 for(const yaw of [0,.7,Math.PI/2]){const box={x:100,z:50,hx:10,hz:20,yaw};const b={x:100,z:50,vx:0,vz:0};assert.ok(resolveBuilding(b,box));assert.ok(Number.isFinite(b.x));assert.equal(resolveBuilding(b,box),null);}
});
test('spatial index finds large rotated buildings across cell boundaries',()=>{
 const box={x:159,z:159,hx:70,hz:30,yaw:.7},near=buildingIndex([box]);assert.ok(near(170,170).includes(box));assert.equal(near(-1000,-1000).length,0);
 const b={x:0,z:0,vx:30,vz:0};assert.equal(resolveBuilding(b,box),null);
});

test('flight clears rooftops and descending hull stops above the roof',()=>{
 const box={x:0,z:0,hx:10,hz:20,maxY:30};
 const high={x:0,z:0,y:40,previousY:40,vx:10,vz:0};assert.equal(resolveBuilding(high,box),null);assert.equal(high.x,0);
 const descending={x:0,z:0,y:31,previousY:35,vx:10,vz:0};assert.ok(resolveBuilding(descending,box));assert.equal(descending.y,33);assert.equal(descending.x,0);assert.ok(descending.roofContact);
 const beside={x:14,z:0,y:12,previousY:12,vx:-20,vz:0};assert.ok(resolveBuilding(beside,box));assert.ok(beside.x>17);
});
