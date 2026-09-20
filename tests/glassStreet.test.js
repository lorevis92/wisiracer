import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildGlassStreet} from '../src/glassStreet.js';
test('street pedestrians stay on walking strip with stable finite geometry',()=>{
 const scene=new THREE.Scene(),segment=buildGlassStreet(scene,{stone:new THREE.MeshStandardMaterial(),foliageMap:new THREE.Texture()},{depth:38,width:56});
 const count=segment.root.children.length,people=segment.root.children.filter(o=>o.name==='Glass street pedestrian');assert.equal(people.length,8);
 for(const t of [0,1,41.66,83.33,300,3600]){
  segment.update(t);assert.equal(segment.root.children.length,count);
  for(const p of people){assert.ok(p.position.x<=-28&&p.position.x>=-30);assert.ok(Math.abs(p.position.z)<=24);assert.ok(Number.isFinite(p.rotation.y));}
 }
 segment.root.traverse(o=>{if(o.isInstancedMesh){assert.ok(o.instanceMatrix.array.every(Number.isFinite));assert.ok(Number.isFinite(o.boundingSphere.radius));}});
});
