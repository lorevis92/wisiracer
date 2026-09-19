import * as THREE from 'three';
import {worldMaterial} from './surfaceMaterials.js';
// Plan coordinates; rendered by the masterplan's x/z scale of four.
export const AVENUES=Array.from({length:17},(_,i)=>-1200+i*135);
export const STREETS=Array.from({length:22},(_,i)=>-980+i*90);
export function metropolisLots(samples,landmarks){
 let seed=491;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const lots=[];
 for(let a=0;a<AVENUES.length-1;a++)for(let b=0;b<STREETS.length-1;b++){
  const mx=(AVENUES[a]+AVENUES[a+1])/2,my=(STREETS[b]+STREETS[b+1])/2;
  // Preserve Utgenra's foothills, the central square and original places.
  for(let ix=0;ix<3;ix++)for(let iy=0;iy<2;iy++){
   const x=mx+(ix-1)*33,y=my+(iy-.5)*31,w=25+rand()*3,d=23+rand()*3;
   const radius=Math.hypot(w,d)/2;
   if(x>1030&&y>60)continue;
   if(Math.abs(x-100)<145&&Math.abs(y-100)<120)continue;
   if(landmarks.some(p=>Math.abs(x-p[1])<105&&Math.abs(y-p[2])<95))continue;
   if(samples.some(p=>Math.hypot(x-p.x,-y-p.z)<radius+42))continue;
   // Retain the older cross-city avenues as part of the new network.
   if([-350,-50,250].some(v=>Math.abs(y-v)<d/2+23)||[-750,-400,0,400,750].some(v=>Math.abs(x-v)<w/2+19))continue;
   const core=Math.exp(-((x-420)**2/(390**2)+(y+180)**2/(440**2)));
   const north=Math.exp(-((x+500)**2/(300**2)+(y-610)**2/(250**2)));
   const h=28+rand()*44+core*(100+rand()*270)+north*(50+rand()*130);
   lots.push({x,y,w,d,h,tower:h>110,district:core>.35?'centro':north>.3?'nord':'residenziale'});
  }
 }
 return lots;
}
export function buildingStyle(l){
 const variant=Math.abs(Math.round(l.x*7+l.y*11))%4;
 return {variant,palette:l.district==='centro'?0:l.district==='nord'?1:2};
}
export function buildMetropolis(group,lots,art,fallback){
 const geometries={box:new THREE.BoxGeometry(1,1,1),round:new THREE.CylinderGeometry(.5,.5,1,16),taper:new THREE.CylinderGeometry(.32,.5,1,8),leaf:new THREE.SphereGeometry(.5,10,7)};
 const dummy=new THREE.Object3D(),chunks=new Map(),roof=art?.roof||fallback;
 const palettes=[0xb9c9c7,0xbaaa94,0xccbbaa].map(color=>{const m=art?.facade.clone()||fallback.clone();m.color.setHex(color);if(art)worldMaterial(m,20,true);return m;});
 const glass=new THREE.MeshStandardMaterial({color:0x46616a,roughness:.32,metalness:.48});
 const copper=new THREE.MeshStandardMaterial({color:0x776153,roughness:.53,metalness:.4});
 const green=new THREE.MeshStandardMaterial({color:0x425b38,roughness:1});
 const bark=new THREE.MeshStandardMaterial({color:0x655142,roughness:1});
 const stone=art?.stone||fallback;
 function add(key,material,x,y,h,w,d,bottom,shape='box'){
  key+=':'+shape+':'+material.uuid;
  if(!chunks.has(key))chunks.set(key,{material,shape,items:[]});chunks.get(key).items.push({x,y,h,w,d,bottom});
 }
 for(const l of lots){const {x,y,h,w,d}=l,key=`${Math.floor(x/400)}:${Math.floor(y/400)}`,{variant,palette}=buildingStyle(l),facade=l.district==='centro'&&l.tower&&art?.curtain?art.curtain:palettes[palette];
  // Street podiums anchor the varied towers in a coherent urban scale.
  add(key,facade,x,y,Math.min(h,26),w,variant===2?d*.65:d,-7);
  const frontDepth=variant===2?d*.65:d;
  add(key,stone,x,y,.45,w+1.2,d+1.2,-7.1);
  for(const side of [-1,1])for(let shop=-2;shop<=2;shop++){
   const sx=x+shop*w*.175,sy=y+side*(frontDepth/2+.025);
   add(key,glass,sx,sy,4.8,w*.14,.05,-6.5);
   add(key,copper,sx,sy,0.3,w*.15,.35,-1.7);
   add(key,copper,sx-w*.07,sy,4.8,.06,.08,-6.5);
  }
  add(key,stone,x,y,1,w*1.005,frontDepth*1.005,.4);
  if(h>26){
   const height=h-26;
   if(variant===0){ // Stepped terraces, all inside the reserved lot.
    for(let k=0;k<4;k++){
     const size=.92-k*.13,bottom=19+k*height/4;
     add(key,facade,x,y,height/4,w*size,d*size,bottom);
     add(key,stone,x,y,1.1,w*(size+.025),d*(size+.025),bottom+height/4);
     if(k<3)add(key,green,x+w*(size-.06)/2,y,1.4,w*.045,d*size*.8,bottom+height/4+1.1);
    }
   }else if(variant===1){ // Oval tower with horizontal bronze fins.
    add(key,facade,x,y,height,w*.91,d*.91,19,'round');
    for(let k=1;k<=5;k++)add(key,copper,x,y,.8,w*.94,d*.94,19+height*k/5,'round');
   }else if(variant===2){ // Two slender wings and a recessed connecting volume.
    for(const side of [-1,1])add(key,facade,x+side*w*.26,y,height*(side===1?1:.78),w*.38,d*.65,19);
    add(key,glass,x,y,height*.55,w*.18,d*.52,19);
    add(key,copper,x,y,2,w*.94,d*.65,19+height*.55);
   }else{ // Tapering octagonal crown and solid lower shaft.
    add(key,facade,x,y,height*.65,w*.86,d*.86,19);
    add(key,facade,x,y,height*.35,w*.86,d*.86,19+height*.65,'taper');
    for(const side of [-1,1])add(key,copper,x+side*w*.43,y,height*.65,.3,d*.87,19);
   }
  }
  // Secondary streets gain distinct entrance thresholds, sunshades and services.
  const frontage=frontDepth/2+.12;
  add(key,copper,x,y+frontage,5.3,w*.18,.08,-6.7);
  add(key,glass,x,y+frontage+.08,4.7,w*.14,.08,-6.5);
  add(key,stone,x,y+frontage+.8,.2,w*.25,1.6,-6.95);
  add(key,copper,x,y+frontage+.6,.2,w*.28,1.4,-1.1);
  for(const side of [-1,1]){
   add(key,stone,x+side*w*.35,y+frontage+.3,.8,w*.1,.65,-6.9);
   add(key,green,x+side*w*.35,y+frontage+.3,1,w*.095,.6,-6.1);
  }
  add(key,roof,x+w*.22,y-d*.16,2.2,w*.13,d*.16,h-6.4);
  // Residential terrace railings are lighter and finer than tower fins.
  if(variant===0&&h<110)for(let k=0;k<3;k++){
   const size=.92-k*.13,bottom=19+(k+1)*(h-26)/4+1.1;
   for(const side of [-1,1]){
    add(key,copper,x,y+side*d*size/2,.14,w*size,.08,bottom+1.2);
    for(let n=-3;n<=3;n++)add(key,copper,x+n*w*size/7,y+side*d*size/2,1.2,.055,.055,bottom);
   }
  }
  // Small planted courts sit inside the reserved footprint, away from traffic.
  if(variant===2){
   for(const side of [-1,1]){
    const tx=x+side*w*.35,ty=y+d*.44;
    add(key,stone,tx,ty,.6,2.4,2.4,-6.9);
    add(key,bark,tx,ty,5,.25,.25,-6.3,'round');
    add(key,green,tx,ty,5.5,2.7,2.7,-3,'leaf');
   }
  }
 }
 for(const [key,{material,shape,items}]of chunks){const mesh=new THREE.InstancedMesh(geometries[shape],material,items.length);mesh.name='City block '+key;
  items.forEach((v,i)=>{dummy.position.set(v.x,v.bottom+v.h/2,-v.y);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();group.add(mesh);
 }
 return {buildings:lots.length,chunks:chunks.size};
}
