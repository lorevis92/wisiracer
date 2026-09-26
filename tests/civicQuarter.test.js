import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {buildCivicQuarter} from '../src/civicQuarter.js';
test('fountain particles stay finite across updates and do not change object count',()=>{
 const s=new THREE.Scene();buildCivicQuarter(s,{stone:new THREE.MeshStandardMaterial()});
 let count=0;s.traverse(()=>count++);
 for(const t of [0,.5,8,100000])for(const update of s.userData.cityAnimations)update(t);
 let after=0;s.traverse(o=>{after++;if(o.isPoints){for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}});
 assert.equal(after,count);assert.equal(s.userData.buildings.length,2);
});
