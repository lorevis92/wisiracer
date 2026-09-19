import * as THREE from 'three';
import {worldMaterial} from './surfaceMaterials.js';
import {AVENUES,STREETS} from './metropolis.js';
// Higgsfield albedo assets are bundled locally; no generation service at runtime.
export function cityMaterials(){
 const load=name=>{const t=new THREE.TextureLoader().load(`/assets/canair/${name}.webp`);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;};
 const facade=new THREE.MeshStandardMaterial({map:load('facade'),color:0xe6e0d5,roughness:.82});
 const stone=new THREE.MeshStandardMaterial({map:load('stone'),roughness:.92});
 const roof=new THREE.MeshStandardMaterial({color:0x48535b,roughness:.9});
 const asphalt=new THREE.MeshStandardMaterial({map:load('asphalt'),color:0xc2cbd3,roughness:.94,side:THREE.DoubleSide});
 worldMaterial(facade,20,true);worldMaterial(stone,5);
 return {facade,stone,roof,asphalt,sides:[facade,facade,roof,roof,facade,facade]};
}
export function buildCityArt(scene,curve,widthAt,mat){
 const group=new THREE.Group();group.name='Canair architectural frontage';scene.add(group);
 const cube=new THREE.BoxGeometry(1,1,1), batches=new Map();
 const bronze=new THREE.MeshStandardMaterial({color:0x493e34,metalness:.55,roughness:.42});
 const glass=new THREE.MeshStandardMaterial({color:0x243e49,metalness:.45,roughness:.24});
 const light=new THREE.MeshBasicMaterial({color:0xffdfad});
 const red=new THREE.MeshStandardMaterial({color:0x682f2d,roughness:.8});
 const add=(material,p,size,yaw=0)=>{if(!batches.has(material))batches.set(material,[]);batches.get(material).push({p,size,yaw});};
 const samples=curve.getSpacedPoints(900),length=curve.getLength();
 let seed=741;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 // Three architectural palettes share the same Higgsfield texture memory.
 const palettes=[0xe6e0d5,0xb7c5cf,0xc7a58e].map(color=>{const m=worldMaterial(mat.facade.clone(),20,true);m.color.setHex(color);return [m,m,mat.roof,mat.roof,m,m];});
 const n=Math.floor(length/95);
 for(let i=0;i<n;i++)for(const sign of [-1,1]){
  const t=i/n,p=curve.getPointAt(t),tan=curve.getTangentAt(t),side=new THREE.Vector3(tan.z,0,-tan.x).normalize(),yaw=Math.atan2(tan.x,tan.z);
  const depth=32+rand()*16,w=50+rand()*27,h=28+Math.floor(rand()*6)*9;
  const center=p.clone().addScaledVector(side,sign*(widthAt(t)+30+depth/2));
  if(samples.some(q=>Math.hypot(q.x-center.x,q.z-center.z)<widthAt(t)+depth/2+6))continue;
  const planX=center.x/4,planY=-center.z/4,margin=Math.hypot(depth,w)/8;
  if([...AVENUES,-750,-400,0,400,750].some(x=>Math.abs(planX-x)<margin+12)||[...STREETS,-350,-50,250].some(y=>Math.abs(planY-y)<margin+21))continue;
  const place=(out,along,y)=>center.clone().addScaledVector(side,out).addScaledVector(tan,along).setY(y-7);
  add(palettes[Math.floor(i/12)%palettes.length],place(0,0,h/2),[depth,h,w],yaw);
  add(mat.roof,place(0,0,h+.7),[depth+2,1.4,w+2],yaw);
  if(i%3===0)add(mat.stone,place(0,0,h+4),[depth*.65,6,w*.6],yaw);
  if(i%4===0)for(const along of [-w*.35,w*.35])add(mat.stone,place(-sign*(depth/2+.8),along,h/2),[1.6,h,1.8],yaw);
  for(let level=9;level<h;level+=9)add(mat.stone,place(0,0,level),[depth+.9,.55,w+.9],yaw);
  add(mat.stone,place(0,0,2),[depth+1,4,w+1],yaw);
  for(let k=-1;k<=1;k++){
   add(glass,place(-sign*(depth/2+.6),k*w*.27,6),[.5,7,w*.22],yaw);
   add(bronze,place(-sign*(depth/2+2),k*w*.27,10),[4,.7,w*.24],yaw);
  }
  // Street furniture remains outside the carriageway.
  if(i%3===0){
   const bench=p.clone().addScaledVector(side,sign*(widthAt(t)+21)).addScaledVector(tan,22);
   add(bronze,bench.clone().setY(-4.8),[2.2,.4,6],yaw);
   add(bronze,bench.clone().addScaledVector(side,sign*.9).setY(-3.7),[.35,2.2,6],yaw);
   for(const along of [-2,2])add(bronze,bench.clone().addScaledVector(tan,along).setY(-5.7),[1.6,1.8,.4],yaw);
   add(mat.stone,p.clone().addScaledVector(side,sign*(widthAt(t)+21)).addScaledVector(tan,-22).setY(-5.3),[4,2.7,7],yaw);
  }
  const lamp=p.clone().addScaledVector(side,sign*(widthAt(t)+14));
  add(bronze,lamp.clone().setY(6),[.7,26,.7],yaw);
  add(bronze,lamp.clone().addScaledVector(side,-sign*3).setY(19),[7,.5,.7],yaw);
  add(light,lamp.clone().addScaledVector(side,-sign*6).setY(18.5),[3,.35,1.4],yaw);
 }
 // Red Fox street frontage, connected visually to its existing plot.
 const fox=new THREE.Group();fox.name='The Red Fox frontage';fox.position.set(-1280,-7,2470);group.add(fox);
 const box=(m,x,y,z,w,h,d)=>{const o=new THREE.Mesh(cube,m);o.position.set(x,y,z);o.scale.set(w,h,d);fox.add(o);};
 box(mat.sides,0,19,0,78,38,42);box(mat.roof,0,39,0,82,2,46);
 box(red,0,7,22,80,14,2);
 for(const x of [-28,-14,14,28]){box(glass,x,6.5,23.2,11,10,.5);box(bronze,x,12,25,12,.6,5);}
 box(bronze,0,6,23.2,9,12,.7);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#421c19';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#ffe3ac';ctx.font='600 70px serif';ctx.textAlign='center';ctx.fillText('THE RED FOX',512,88);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(60,7.5),new THREE.MeshBasicMaterial({map:texture}));sign.position.set(0,18,23);fox.add(sign);
 for(const [material,items] of batches){const mesh=new THREE.InstancedMesh(cube,material,items.length),dummy=new THREE.Object3D();items.forEach((a,i)=>{dummy.position.copy(a.p);dummy.scale.set(...a.size);dummy.rotation.set(0,a.yaw,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();group.add(mesh);}
 return group;
}
