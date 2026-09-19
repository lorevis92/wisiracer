import * as THREE from 'three';
import {worldMaterial} from './surfaceMaterials.js';
export const RED_FOX={x:-1280,z:2470,width:28,depth:18,height:17};
export function buildRedFox(scene,art){
 const group=new THREE.Group();group.name='Red Fox detailed building';group.position.set(RED_FOX.x,-7,RED_FOX.z);scene.add(group);
 const tex=new THREE.TextureLoader().load('/assets/canair/red-fox-brick.webp');tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;
 const brick=worldMaterial(new THREE.MeshStandardMaterial({map:tex,roughness:.94}),2.4);
 const stone=art.stone,red=new THREE.MeshStandardMaterial({color:0x512526,roughness:.65});
 const bronze=new THREE.MeshStandardMaterial({color:0x9c8256,metalness:.7,roughness:.3});
 const dark=new THREE.MeshStandardMaterial({color:0x202a2c,roughness:.7});
 const wood=new THREE.MeshStandardMaterial({color:0x493728,roughness:.78});
 const glass=new THREE.MeshStandardMaterial({color:0x84999b,metalness:.12,roughness:.16,transparent:true,opacity:.3,depthWrite:false});
 const warm=new THREE.MeshStandardMaterial({color:0xeac58c,emissive:0xe5a259,emissiveIntensity:.65});
 const paving=new THREE.MeshStandardMaterial({color:0x909795,roughness:.95});
 const batches=new Map(),cube=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
 const box=(m,x,y,z,w,h,d,rx=0)=>{if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,rx});};
 // Raised paving: separate slabs, visible joints, granite curb and drain.
 for(let x=-18;x<18;x+=2)for(let z=9.6;z<19;z+=1.5)box(paving,x+1,.1,z+.75,1.96,.2,1.46);
 box(stone,0,.15,19.2,38,.3,.4);
 box(dark,0,-.03,19.8,4,.04,.5);for(let x=-1.9;x<2;x+=.2)box(bronze,x,0,19.8,.07,.04,.45);
 // Shell: solid rear/side walls, actual openings on the principal facade.
 box(brick,0,8,-8.6,28,16,.8);for(const side of [-1,1])box(brick,side*13.6,8,0,.8,16,18);
 box(wood,0,.12,0,27,.24,17);box(dark,0,16,0,28,.4,18);
 for(const [y,h]of [[6.5,1],[11.25,1.5],[15.7,1.4]])box(brick,0,y,8.6,28,h,.8);
 for(let i=0;i<=6;i++)box(brick,-14+i*28/6,11,8.6,i===0||i===6?.8:1.55,10,.8);
 for(const y of [8.9,13.5])for(let i=0;i<6;i++){
  const x=-14+(i+.5)*28/6;
  // Glazing is recessed behind jambs; dark backing gives the room depth.
  box(dark,x,y,6.9,3,3.2,.1);box(glass,x,y,8.15,2.8,3,.06);
  for(const side of [-1,1])box(stone,x+side*1.52,y,8.8,.25,3.6,1);
  for(const dy of [-1.67,1.67])box(stone,x,y+dy,8.9,3.5,.22,1.1);
  for(const side of [-1,1])box(red,x+side*1.38,y,8.35,.11,3.15,.15);
  for(const dy of [-1.5,0,1.5])box(red,x,y+dy,8.35,2.85,.1,.15);
  box(bronze,x,y,8.45,.07,3,.08);
 }
 for(const [y,w,d]of [[5.8,28.5,18.5],[16.4,29,19],[16.8,29.6,19.6]])box(stone,0,y,0,w,.25,d);
 // Open shopfront: rooms behind glass, not a photograph pasted on a wall.
 for(const x of [-13.5,-8,-2.2,2.2,8,13.5])box(red,x,2.7,8.9,.5,5.4,.7);
 box(red,0,5.25,9,28,1,1);box(red,0,.45,9,28,.9,.8);
 for(const x of [-10.7,-5.1,5.1,10.7]){
  box(glass,x,2.9,8.65,5,3.7,.07);box(bronze,x,2.9,8.75,.08,3.7,.1);
  box(dark,x,4.6,10.05,5.3,.12,2.6,-.16);box(red,x,4.3,11.32,5.3,.35,.12);
 }
 for(const x of [-1,1]){box(red,x,.4,8.1,1.8,.8,.18);box(glass,x,2.5,8.1,1.8,3.4,.08);box(bronze,x*.2,2.1,8.3,.1,.6,.12);}
 for(const x of [-2,0,2])box(red,x,2.5,8.1,.14,5,.25);
 // Interior bar, bottles, booth seating and hanging lamps.
 box(wood,0,1.2,-3,20,2.4,1.3);box(bronze,0,2.45,-3,20.5,.15,1.6);
 for(const y of [2.8,3.6,4.4]){box(wood,0,y,-7.9,23,.12,.8);for(let i=0;i<24;i++)box(i%3===0?bronze:dark,-11+i*.95,y+.27,-7.8,.17,.45,.17);}
 for(const x of [-9,-5,5,9]){box(wood,x,1.3,3,2.2,.15,2.2);for(const dx of [-1.5,1.5])box(red,x+dx,.7,3,.9,1.4,1);box(warm,x,4,0,.6,.4,.6);box(bronze,x,4.6,0,.06,.8,.06);}
 for(const x of [-12.8,12.8]){box(bronze,x,3.8,9.6,.12,.8,.8);box(warm,x,3.5,10,.32,.65,.3);box(dark,x,3.9,10,.5,.15,.5);}
 // Cornice brackets and facade panels echo the approved visual reference.
 for(let x=-13;x<=13;x+=1.6)box(stone,x,16.1,9.3,.28,.55,.75);
 for(const x of [-13.5,-8,-2.2,2.2,8,13.5]){
  for(const dx of [-.16,.16])box(bronze,x+dx,2.65,9.29,.035,4.5,.04);
 }
 // Raised parapet and roof services.
 for(const z of [-8.8,8.8])box(brick,0,17,z,28,.7,.35);
 for(const x of [-13.8,13.8])box(brick,x,17,0,.35,.7,18);
 box(dark,7,16.6,-4,3,.9,2);for(let i=0;i<8;i++)box(bronze,5.7+i*.36,17.08,-4,.1,.04,1.8);
 const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#512526';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#d3b57a';ctx.font='600 78px Georgia';ctx.textAlign='center';ctx.fillText('THE RED FOX',512,91);
 const signTex=new THREE.CanvasTexture(c);signTex.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(15,.95),new THREE.MeshStandardMaterial({map:signTex,roughness:.55}));sign.position.set(0,5.27,9.52);group.add(sign);
 for(const [material,items]of batches){const mesh=new THREE.InstancedMesh(cube,material,items.length);mesh.name='Red Fox architecture';items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,0,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=material!==glass;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
 scene.userData.buildings ||= [];scene.userData.buildings.push({x:RED_FOX.x,z:RED_FOX.z,hx:14,hz:9});
 return group;
}
