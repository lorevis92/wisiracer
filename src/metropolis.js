import * as THREE from 'three';
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
 const palettes=[0xb9c9c7,0xbaaa94,0xccbbaa].map(color=>{const m=art?.facade.clone()||fallback.clone();m.color.setHex(color);return m;});
 const glass=new THREE.MeshStandardMaterial({color:0x46616a,roughness:.32,metalness:.48});
 const copper=new THREE.MeshStandardMaterial({color:0x776153,roughness:.53,metalness:.4});
 const green=new THREE.MeshStandardMaterial({color:0x425b38,roughness:1});
 const bark=new THREE.MeshStandardMaterial({color:0x655142,roughness:1});
 const stone=art?.stone||fallback;
 function add(key,material,x,y,h,w,d,bottom,shape='box'){
  key+=':'+shape+':'+material.uuid;
  if(!chunks.has(key))chunks.set(key,{material,shape,items:[]});chunks.get(key).items.push({x,y,h,w,d,bottom});
 }
 for(const l of lots){const {x,y,h,w,d}=l,key=`${Math.floor(x/400)}:${Math.floor(y/400)}`,{variant,palette}=buildingStyle(l),facade=palettes[palette];
  // Street podiums anchor the varied towers in a coherent urban scale.
  add(key,facade,x,y,Math.min(h,26),w,variant===2?d*.65:d,-7);
  add(key,glass,x,y,7,w*1.006,d*(variant===2?.65:1.006),-6);
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
