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
export function buildMetropolis(group,lots,art,fallback){
 const cube=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D(),chunks=new Map();
 const tower=art?.facade.clone()||fallback;
 if(art){tower.map=art.facade.map.clone();tower.map.repeat.set(2,5);tower.map.needsUpdate=true;tower.color.setHex(0xb9c5cc);}
 const roof=art?.roof||fallback,low=art?.sides||fallback,high=[tower,tower,roof,roof,tower,tower];
 function add(key,material,x,y,h,w,d,bottom){
  if(!chunks.has(key))chunks.set(key,{material,items:[]});chunks.get(key).items.push({x,y,h,w,d,bottom});
 }
 for(const l of lots){const {x,y,h,w,d}=l,key=`${Math.floor(x/270)}:${Math.floor(y/270)}`;
  add(key+':base',low,x,y,Math.min(h,38),w,d,-7);
  if(h>38)add(key+(l.tower?':tower':':upper'),l.tower?high:low,x,y,h-38,w*.8,d*.8,31);
  add(key+':roof',roof,x,y,1.7,w*(h>38?.82:1.02),d*(h>38?.82:1.02),h-7);
  if(h>160)add(key+':crown',high,x,y,h*.12,w*.48,d*.48,h-5.3);
 }
 for(const [key,{material,items}]of chunks){const mesh=new THREE.InstancedMesh(cube,material,items.length);mesh.name='City block '+key;
  items.forEach((v,i)=>{dummy.position.set(v.x,v.bottom+v.h/2,-v.y);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();group.add(mesh);
 }
 return {buildings:lots.length,chunks:chunks.size};
}
