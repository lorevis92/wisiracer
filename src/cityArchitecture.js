import {shopMaterials,shopfront} from './shopfronts.js';
import * as THREE from 'three';
export const ARCHETYPES=['residenza classica','uffici bronzo e vetro','hotel terrazzato','atelier terracotta','residenza bow-window','mercato coperto'];
export function architectureMaterials(art){
 const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 return {shops:shopMaterials(),wall:[mat(0xc6baa1),mat(0xb3bab6),mat(0xddd2bc),mat(0xa85e41),mat(0xc9ccc0),mat(0xaaa99b)],
  frames:[mat(0x394b42),mat(0x73604a,.35,.65),mat(0x655a4b),mat(0x242a2b),mat(0x6e8075),mat(0x414b4f)],
  panes:[mat(0x47616a,.16,.5),mat(0x34454c,.21,.3),mat(0x566565,.19,.4)],
  cloth:[mat(0xc3bba6),mat(0x8a9186),mat(0x9c8a78)],
  warm:new THREE.MeshStandardMaterial({color:0xad9170,roughness:.8,emissive:0x80572e,emissiveIntensity:.22}),
  stone:art.stone,roof:art.roof,green:mat(0x43553b),wood:mat(0x70513a)};
}
// Each face is modeled with recessed panes, piers and sills. Shared materials batch city-wide.
export function buildStreetArchitecture({add,place,yaw,depth,w,h,sign,id,materials:m}){
 const type=id%6,wall=m.wall[type],frame=m.frames[type];
 const B=(mat,x,z,y,sx,sy,sz)=>add(mat,place(x,z,y),[sx,sy,sz],yaw);
 // Recessed core leaves space for modeled openings on every elevation.
 B(wall,0,0,h/2,depth-2.8,h,w-2.8);
 B(m.stone,0,0,.3,depth+1,.6,w+1);
 const floor=type===5?10:type===3?9:7.5;
 const floors=Math.max(2,Math.floor((h-7)/floor)),step=(h-7)/floors;
 for(let j=0;j<=floors;j++)B(wall,0,0,7+j*step,depth+.1,type===1?.3:.7,w+.1);
 B(m.roof,0,0,h+.3,depth+1.2,.6,w+1.2);
 function face(axis,side,length){
  const edge=(axis===0?depth:w)/2;
  const F=(mat,u,y,offset,a,b,c)=>axis===0?B(mat,side*(edge+offset),u,y,c,b,a):B(mat,u,side*(edge+offset),y,a,b,c);
  const cols=Math.max(3,Math.floor(length/(type===3?9:6.5))),bay=length/cols;
  const ww=bay*(type===1||type===5?.85:type===3?.75:.55);
  for(let k=0;k<=cols;k++)F(wall,-length/2+k*bay,h/2,0,type===1?.23:bay-ww,h,.6);
  // Public ground floor: entrance, glazed shop bays, canopy and independent frames.
  for(let k=0;k<cols;k++){
   const u=-length/2+(k+.5)*bay;
   if(axis===0&&side===-sign){shopfront(F,u,bay,(id+k)%6,m);}
   else{
    F(m.panes[(id+k)%3],u,3.7,-.6,bay-.7,6,.08);
    F(frame,u,6.9,.1,bay-.3,.35,.5);
    F(frame,u-bay/2+.24,3.7,0,.18,6,.3);
    F(m.wood,u,1.5,-.4,bay-.85,.6,.15);
   }
  }
  if(axis===0&&side===-sign){
   F(frame,0,7.3,1.5,length*.72,.32,3.6);
   F(frame,0,3.3,-.35,.13,6,.18);
   for(const u of [-.45,.45])F(m.stone,u,3.2,-.12,.06,.75,.14);
  }
  for(let j=0;j<floors;j++)for(let k=0;k<cols;k++){
   const u=-length/2+(k+.5)*bay,y=7+(j+.5)*step,wh=step*(type===1?.88:.7);
   const seed=id*31+j*13+k*7+axis*19+side;
   F(m.panes[Math.abs(seed)%3],u,y,-.52,ww,wh,.06);
   for(const du of [-ww/2,ww/2])F(frame,u+du,y,-.1,.1,wh+.2,.24);
   for(const dy of [-wh/2,wh/2])F(type===0||type===2?m.stone:frame,u,y+dy,.03,ww+.3,.14,.5);
   F(frame,u,y,-.08,.065,wh,.12);
   if(type!==1&&type!==3&&type!==5){
    const opening=.13+(Math.abs(seed)%5)*.1;
    for(const s of [-1,1])F(m.cloth[Math.abs(seed)%3],u+s*ww*(.5-opening/2),y,-.36,ww*opening,wh-.18,.045);
   }
   if(type===3){F(frame,u,y,-.05,ww,.08,.14);}
   if(type===1)F(frame,u-ww/2,y,.35,.17,step,.8);
   const balcony=(type===0&&k%2===0)||(type===2&&k%3===1)||(type===4&&(k+j)%3!==0);
   if(balcony){
    const reach=type===0?.45:1.5,bottom=y-wh/2;
    F(m.stone,u,bottom,reach/2,ww+.7,.18,reach+1);
    F(frame,u,bottom+1.1,reach,ww+.6,.07,.08);
    for(let rail=0;rail<6;rail++)F(frame,u-ww/2+ww*rail/5,bottom+.6,reach,.055,1,.07);
    if(seed%3===0){F(m.wood,u+ww*.25,bottom+.35,reach*.6,ww*.3,.5,.5);F(m.green,u+ww*.25,bottom+.7,reach*.6,ww*.34,.4,.6);}
   }
   // Projected, glazed bay volume on residential corner columns.
   if(type===4&&k===0&&j%2===0){
    F(m.panes[2],u,y,.65,ww,wh,.12);
    for(const du of [-ww/2,ww/2])F(frame,u+du,y,.3,.14,wh,.85);
    for(const dy of [-wh/2,wh/2])F(frame,u,y+dy,.3,ww+.35,.2,1.1);
   }
  }
 }
 for(const axis of [0,1])for(const side of [-1,1])face(axis,side,axis===0?w:depth);
 // Silhouettes follow the six reference buildings, not just different paint.
 if(type===0){
  for(const level of [h-.35,h+.5])B(m.stone,0,0,level,depth+2,.3,w+2);
  for(let z=-w/2+2;z<w/2;z+=3)B(m.stone,-sign*(depth/2+.3),z,h-.85,.9,.75,.4);
 }else if(type===1||type===2){
  const levels=type===2?3:1;
  for(let q=0;q<levels;q++){
   const scale=.78-q*.17,y=h+q*3.3;
   B(type===1?m.panes[0]:wall,0,0,y+1.6,depth*scale,3.2,w*scale);
   B(m.stone,0,0,y+3.25,depth*scale+.7,.2,w*scale+.7);
   for(const s of [-1,1])B(m.green,s*depth*(scale-.06)/2,0,y+3.65,.9,.7,w*scale*.85);
  }
 }else if(type===3){
  // Staggered monitor rooflights; ribbed industrial profile.
  for(let z=-w*.4;z<w*.5;z+=w/5){B(frame,0,z,h+1.2,depth*.92,2.2,w/7);B(m.panes[0],-sign*depth*.46,z,h+1.3,.1,1.8,w/7);}
 }else if(type===5){
  B(frame,0,0,h+1.5,depth*.88,2.5,w*.92);
  for(let z=-w*.45;z<w*.46;z+=2.5)B(m.stone,0,z,h+2.9,depth*.9,.12,.09);
  for(let z=-w*.42;z<w*.5;z+=w/6)B(m.stone,-sign*(depth/2+1),z,3.6,1.2,7.2,1.2);
 }
 // Roof services and a back entrance make secondary elevations intentional.
 B(m.roof,depth*.18,w*.15,h+1.1,3,1.6,4);
 return {type:ARCHETYPES[type],reference:type};
}
