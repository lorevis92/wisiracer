import * as THREE from 'three';
import fs from 'node:fs';
import {MASTERPLAN,landmarks} from '../src/masterplan.js';
import {buildCityArt} from '../src/cityArt.js';
import {metropolisLots} from '../src/metropolis.js';
// Geometry audit only: this stub does not validate canvas text or GPU rendering.
globalThis.document={createElement:()=>({getContext:()=>({clearRect(){},strokeText(){}})})};
const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
const curve=new THREE.CatmullRomCurve3(MASTERPLAN.pts.map(p=>new THREE.Vector3(...p)),true);
buildCityArt(scene,curve,MASTERPLAN.widthAt,{stone:material,roof:material,facade:material,foliageMap:new THREE.Texture()});
let batches=0,instances=0;
scene.traverse(o=>{if(o.isInstancedMesh){batches++;instances+=o.count;if(!o.instanceMatrix.array.every(Number.isFinite)||!Number.isFinite(o.boundingSphere.radius))throw Error('Invalid instance bounds');}});
const lots=metropolisLots(curve.getSpacedPoints(1600).map(p=>p.divideScalar(4)),landmarks);
const report={routeBuildings:scene.userData.architectureRegistry.length,secondaryLots:lots.length,batchesIncludingRedFox:batches,instancesIncludingRedFox:instances,gpuVerified:false,buildings:scene.userData.architectureRegistry};
fs.writeFileSync('CITY_ARCHITECTURE_PROGRESS.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,buildings:undefined}));
