import * as THREE from 'three';
import {AVENUES,STREETS} from './metropolis.js';
// World coordinates: street furniture and sidewalks avoid both grid crossings
// and the approved race corridor. Shared batches bound mobile draw calls.
export function buildUrbanDetails(scene,curve,materials){
 const group=new THREE.Group();group.name='Canair street details';scene.add(group);
 const stone=materials.stone,metal=new THREE.MeshStandardMaterial({color:0x45494a,metalness:.5,roughness:.5});
 const wood=new THREE.MeshStandardMaterial({color:0x80634b,roughness:.9});
 const glass=new THREE.MeshStandardMaterial({color:0x72949a,transparent:true,opacity:.42,roughness:.25,depthWrite:false});
 
 const glow=new THREE.MeshBasicMaterial({color:0xf4deb1});
 const cube=new THREE.BoxGeometry(1,1,1),batches=new Map(),dummy=new THREE.Object3D();
 const route=curve.getSpacedPoints(1500);
 const clear=(x,z,r=8)=>route.every(p=>Math.hypot(p.x-x,p.z-z)>112+r);
 function add(mat,x,y,z,w,h,d){if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push([x,y,z,w,h,d]);}
 const vertical=[...AVENUES.map(x=>({v:x*4,half:44})),...[-750,-400,0,400,750].map(x=>({v:x*4,half:64}))];
 const horizontal=[...STREETS.map(y=>({v:-y*4,half:32})),...[-350,-50,250].map(y=>({v:-y*4,half:80}))];
 // Short sidewalk slabs naturally stop at intersections rather than spanning roads.
 for(const road of vertical)for(const side of [-1,1])for(let z=-3820;z<3860;z+=24){
  const x=road.v+side*(road.half+5);
  if(vertical.some(r=>r!==road&&Math.abs(x-r.v)<r.half+6)||horizontal.some(r=>Math.abs(z-r.v)<r.half+18)||!clear(x,z,16))continue;
  if(x>4120&&z<-240)continue;
  add(stone,x,-6.75,z,10,.5,23.8);
  add(stone,road.v+side*(road.half+.45),-6.5,z,.9,.8,23.8);
 }
 for(const road of horizontal)for(const side of [-1,1])for(let x=-4740;x<3800;x+=24){
  const z=road.v+side*(road.half+5);
  if(horizontal.some(r=>r!==road&&Math.abs(z-r.v)<r.half+6)||vertical.some(r=>Math.abs(x-r.v)<r.half+18)||!clear(x,z,16))continue;
  add(stone,x,-6.75,z,23.8,.5,10);
  add(stone,x,-6.5,road.v+side*(road.half+.45),23.8,.8,.9);
 }
 // Shelters, information panels and benches on selected avenues.
 let shelters=0;
 for(let a=1;a<AVENUES.length-1;a+=3)for(let b=2;b<STREETS.length-1;b+=4){
  const x=AVENUES[a]*4+54,z=-STREETS[b]*4-145;
  if(!clear(x,z,20)||horizontal.some(r=>Math.abs(z-r.v)<r.half+24))continue;
  shelters++;
  for(const dz of [-6,6])add(metal,x,-3,z+dz,.3,7,.3);
  add(metal,x+.5,.6,z,5,.3,14);add(glass,x+2,-2.7,z,.12,6.2,13);
  for(const dz of [-4,0,4]){add(wood,x,-4.8,z+dz,2,.35,3.5);add(metal,x,-5.8,z+dz,1,2,.3);}
  add(metal,x+1,-3,z+9,1,6,2);add(glow,x+.45,-2.5,z+9,.06,2,1.2);
 }
 // A stepped quay gives the city's southern edge an intentional waterfront.
 for(let x=-5520;x<7920;x+=160){
  add(stone,x,-10,4580,159.8,12,36);
  add(stone,x,-17,4605,159.8,4,16);
  add(metal,x,-3.5,4593,.55,5,.55);
  add(metal,x,-1.2,4593,160,.25,.25);
 }
 for(const [mat,items]of batches){const mesh=new THREE.InstancedMesh(cube,mat,items.length);mesh.name='Urban furniture';items.forEach((v,i)=>{dummy.position.set(...v.slice(0,3));dummy.scale.set(...v.slice(3));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.receiveShadow=true;mesh.castShadow=mat===metal||mat===wood;mesh.computeBoundingSphere();group.add(mesh);}
 // Discreet wayfinding makes the existing destinations easier to find.
 for(const [label,x,z]of [['CENTRO · GIARDINI',320,-40],['THE RED FOX',-1280,2390],['UTGENRA',4160,-160]]){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e5dfcf';ctx.fillRect(0,0,512,128);ctx.fillStyle='#31474b';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.fillText(label,256,78);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(14,3.5),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));sign.position.set(x,1,z);group.add(sign);
  const pole=new THREE.Mesh(cube,metal);pole.position.set(x,-3,z);pole.scale.set(.25,8,.25);group.add(pole);
 }
 group.userData.shelters=shelters;
 return group;
}
