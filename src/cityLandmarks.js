import * as THREE from 'three';
export const AUTHORED_LANDMARKS=[
 {name:'MAWHET ROSET',x:-2830,z:590,w:42,d:32,h:22,reference:'mawhet'},
 {name:'LUBE TONE',x:1760,z:-620,w:58,d:38,h:23,reference:'lube'},
];
export function buildAuthoredLandmark(scene,index,art,{placeInCity=true}={}){
 const spec=AUTHORED_LANDMARKS[index],g=new THREE.Group();g.name=spec.name;
 g.userData.authoredLandmark=true;
 if(placeInCity)g.position.set(spec.x,-7,spec.z);scene.add(g);
 const mat=(color,roughness=.8,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const plaster=mat(0xcfc4aa),sage=mat(0x556255),olive=mat(0x44493c),wood=mat(0x66503b);
 const brass=mat(0xa68d5b,.32,{metalness:.65}),black=mat(0x242926),linen=mat(0xd1c5ae);
 const green=mat(0x41573a),wine=mat(0x633b34),stone=art.stone;
 const glass=mat(0xc0c9c4,.12,{transparent:true,opacity:.13,depthWrite:false});
 const warm=mat(0xf2d5a1,.4,{emissive:0xffc173,emissiveIntensity:1.4});
 const batches=new Map(),geos={box:new THREE.BoxGeometry(),round:new THREE.CylinderGeometry(.5,.5,1,12)};
 function add(shape,m,x,y,z,w,h,d,rx=0){const key=shape+m.uuid;if(!batches.has(key))batches.set(key,{shape,m,items:[]});batches.get(key).items.push({x,y,z,w,h,d,rx});}
 const B=(...v)=>add('box',...v),R=(...v)=>add('round',...v);
 function rail(x,y,z,width){B(brass,x,y+1,z,width,.07,.07);for(let a=-width/2;a<=width/2;a+=.55)B(brass,x+a,y+.5,z,.045,1,.045);}
 function table(x,z){R(wood,x,1.4,z,2,.16,2);R(brass,x,.85,z,.13,1,.13);R(black,x,.36,z,.9,.13,.9);for(const dx of [-1.5,1.5]){B(wine,x+dx,.78,z,.9,.18,.85);B(wood,x+dx,.49,z,.12,.5,.12);B(wine,x+dx,1.15,z-.4,.9,.8,.12);}R(warm,x,1.62,z,.15,.3,.15);}
 function planter(x,z){B(stone,x,.6,z,2.2,1.2,2.2);for(const dx of [-.6,0,.6])R(green,x+dx,1.8,z,1,1.6,1);}
 function label(text,x,y,z,width){const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=index===0?'#a58d62':'#41473b';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=index===0?'#303e33':'#d5bd80';ctx.font='48px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,80);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*160/1024),new THREE.MeshStandardMaterial({map:tex,roughness:.6}));mesh.position.set(x,y,z);g.add(mesh);}
 const {w,d,h}=spec;
 B(wood,0,.14,0,w,.28,d);B(plaster,0,h/2,-d/2+.3,w,h,.6);
 for(const s of [-1,1])B(index===0?plaster:stone,s*(w/2-.3),h/2,0,.6,h,d);
 B(plaster,0,h,0,w+1,.35,d+1);
 if(index===0){
  for(const y of [7,14,21])B(plaster,0,y,15.7,w,1.6,.6);
  for(const [x,width]of [[-19,4],[-7,8],[7,8],[19,4]])B(plaster,x,14,15.7,width,14,.6);
  for(const x of [-20,-4,4,20])B(sage,x,3.4,15.8,.4,6.8,.5);
  for(const x of [-12,12]){B(glass,x,3.3,15.6,15.4,5.9,.04);B(sage,x,6.2,15.85,15.8,.2,.22);B(sage,x,.5,15.85,15.8,.7,.3);}
  B(glass,0,3.1,15.1,7.5,5.8,.04);B(sage,0,3.1,15.25,.12,5.8,.2);
  label(spec.name,0,6.95,16.08,9);
  // Bedroom boxes contain the bed, wardrobe, desk and balcony from chapter 2.
  for(const y of [10.6,17.6])for(const x of [-14,0,14]){
   B(wood,x,y-2.75,11.8,6,.15,7.6);B(plaster,x,y,8,6,5.4,.15);
   for(const s of [-1,1])B(plaster,x+s*3,y,11.8,.12,5.4,7.6);
   B(wood,x,y-2.4,10.8,2.5,.5,3.6);B(linen,x,y-2.04,10.8,2.45,.25,3.4);
   B(linen,x,y-1.84,9.5,1.8,.18,.7);for(const dx of [-1.8,1.8])B(wood,x+dx,y-2.13,9.6,.65,.7,.65);B(wood,x-2,y-1.2,8.6,1,3,.8);
   B(wood,x+1.95,y-1.45,12,1.7,.12,.85);B(wood,x+1.95,y-2.08,12,.1,1.2,.1);
   B(warm,x+1.95,y-.99,12,.3,.6,.3);
   B(glass,x,y,15.4,5.5,5.3,.04);
   for(const s of [-1,1])B(sage,x+s*2.78,y,15.75,.16,5.6,.3);
   for(const dy of [-2.7,2.7])B(sage,x,y+dy,15.8,5.7,.16,.3);
   B(sage,x,y,15.8,.1,5.4,.2);
   const cw=.5+((x+14)/14+(y>14?1:0))%3*.45;
   for(const s of [-1,1])for(let n=0;n<5;n++)B(linen,x+s*(2.6-cw/2)+(n-2)*cw/5,y,15.12+(n%2)*.07,cw/5,5.2,.06);
   B(stone,x,y-2.8,16.6,6.2,.2,2);rail(x,y-2.7,17.5,6.2);
   for(const s of [-1,1])B(brass,x+s*3.05,y-2.15,16.6,.06,1.1,1.8);
  }
  B(plaster,0,6.8,0,w,.2,d); // Breakfast room ceiling.
  for(const x of [-13,-7,7,13])table(x,9);
  B(wood,-10,1.3,-7,13,2.6,2);B(stone,-10,2.66,-7,13.5,.14,2.3);
  B(wood,10,1.3,-7,8,2.6,2);B(warm,10,3.1,-7,2,.4,.5);
  for(const x of [-18,18])planter(x,18);
  B(stone,0,21.6,0,w+1.6,.3,d+1.6);B(stone,0,22.1,0,w+2,.25,d+2);
 }else{
  // Clear, tall lower glazing reveals a furnished live-music room.
  B(olive,0,12,18.7,w,3,.6);B(olive,0,21,18.7,w,4,.6);
  for(const x of [-28,-18,-8,2,12,22,28])B(brass,x,16.3,19.3,.24,12.7,1.1);
  B(glass,0,16,18.65,55,5,.045);
  for(const x of [-28,-14,0,14,28])B(brass,x,5.2,19,.18,10.4,.25);
  B(glass,0,5.2,18.8,55,10,.04);B(brass,0,10.5,20.1,59,.4,3.3);
  for(const x of [-27,27])B(stone,x,5.1,19.1,2,10.2,1.4);
  label(spec.name,18,21,19.12,13);
  B(olive,0,10.9,0,w,.3,d);
  B(wood,0,.6,-10,22,1.2,10); // Stage with piano, drum kit and microphone.
  B(black,-5,2.05,-10,4,1.5,3);B(black,-5,2.85,-10,4.6,.2,3.4);
  for(let k=0;k<16;k++)B(linen,-6.85+k*.24,2.44,-8.45,.21,.08,.5);
  for(const x of [-6.6,-3.4])B(black,x,1.4,-10,.15,1.6,.15);
  R(wine,5,2,-9,2.3,1.5,2.3,Math.PI/2);R(linen,5,2,-8.2,2.2,.06,2.2,Math.PI/2);
  for(const x of [3.5,6.5]){R(brass,x,2.5,-11,.06,2.5,.06);R(brass,x,3.7,-11,1.6,.07,1.6);}
  R(black,0,2.6,-7,.06,2.8,.06);B(black,0,4,-7,.35,.12,.12);
  for(const x of [-10,10])B(black,x,2,-10,1.2,2.5,1);
  for(const x of [-18,-9,0,9,18])for(const z of [4,12])table(x,z);
  B(wood,-24,1.4,-2,3,2.8,14);B(brass,-24,2.9,-2,3.4,.18,14);
  for(const x of [-21,-7,7,21]){R(brass,x,8.5,7,.06,3,.06);R(warm,x,7,7,1.1,.25,1.1);}
  for(const x of [-24,24])planter(x,21.5);
  for(const z of [-18,18])rail(0,23,z,56);
  for(const x of [-24,-12,12,24]){B(stone,x,23.5,0,4,1,3);R(green,x,24.6,0,3,1.5,2);}
 }
 const light=new THREE.PointLight(0xffcd91,index===0?75:110,24,2);light.position.set(0,index===0?4.7:7,7);g.add(light);
 const dummy=new THREE.Object3D();
 for(const {shape,m,items}of batches.values()){const mesh=new THREE.InstancedMesh(geos[shape],m,items.length);items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,0,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.name=spec.name+' architecture';mesh.castShadow=!m.transparent;mesh.receiveShadow=true;mesh.computeBoundingSphere();g.add(mesh);}
 if(placeInCity){scene.userData.buildings ||= [];scene.userData.buildings.push({x:spec.x,z:spec.z,maxY:h-5,hx:w/2,hz:d/2});}
 return g;
}
