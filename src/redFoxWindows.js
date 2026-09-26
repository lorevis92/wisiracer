import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Hand-arranged rooms: variation stays stable between visits to the city.
const rooms=[
 {left:.43,right:.58,lift:0,tone:0,lit:true},
 {left:1.24,right:1.12,lift:0,tone:1,lit:false},
 {left:.63,right:.37,lift:.48,tone:2,lit:false},
 {blind:.95,lift:0,tone:0,lit:true},
 {left:.86,right:.44,lift:0,tone:1,lit:false},
 {left:.35,right:.62,lift:.23,tone:0,lit:true},
 {left:1.3,right:1.28,lift:0,tone:2,lit:false},
 {left:.52,right:.38,lift:.38,tone:0,lit:false},
 {blind:1.85,lift:0,tone:1,lit:false},
 {left:.35,right:.76,lift:0,tone:2,lit:true},
 {left:.9,right:1.08,lift:0,tone:0,lit:false},
 {left:.4,right:.4,lift:.6,tone:1,lit:false},
];

export function buildRedFoxWindows(group,box,{stone,red,bronze,wood,dark,warm}){
 const fabrics=[0xc4b69a,0x918573,0x67776e].map(color=>new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide}));
 const cloth=fabrics.map(()=>[]);
 const walls=[0x797064,0x948575,0x686b61].map(color=>new THREE.MeshStandardMaterial({color,roughness:.95}));
 const litWall=new THREE.MeshStandardMaterial({color:0xaa9172,roughness:.95,emissive:0x8d6034,emissiveIntensity:.18});
 const glazing=new THREE.MeshStandardMaterial({color:0xb9cbd0,roughness:.08,metalness:.12,transparent:true,opacity:.19,depthWrite:false});
 // Folded fabric is geometry, including gathered waists and uneven hems.
 function curtain(x,top,width,height,side,tone,index){
  const g=new THREE.PlaneGeometry(width,height,24,14),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const u=(p.getX(i)+width/2)/width,v=(height/2-p.getY(i))/height;
   const gather=width<1?.22*Math.exp(-Math.pow((v-.64)/.19,2)):0;
   const span=width*(1-gather),origin=side<0?x-width/2:x+width/2-span;
   p.setXYZ(i,origin+u*span,top-v*height+.025*Math.sin(u*17+index)*v*v,7.8+.06*Math.cos(u*Math.PI*12)+.025*Math.sin(v*4+index));
  }
  g.computeVertexNormals();cloth[tone].push(g);
 }
 rooms.forEach((r,index)=>{
  const y=index<6?8.9:13.5,x=-14+(index%6+.5)*28/6;
  // Deeper room box: side reveals, floor and ceiling prevent sky showing through.
  const wall=r.lit?litWall:walls[index%3];
  box(wall,x,y,5.35,3.1,3.3,.12);
  for(const side of [-1,1])box(wall,x+side*1.5,y,6.7,.1,3.3,2.7);
  box(wood,x,y-1.58,6.7,3,.12,2.7);box(wall,x,y+1.58,6.7,3,.12,2.7);
  for(const side of [-1,1]){
   box(stone,x+side*1.52,y,8.8,.25,3.6,1);
   box(red,x+side*1.38,y,8.35,.11,3.15,.18);
  }
  box(stone,x,y+1.67,8.9,3.5,.22,1.1);
  box(stone,x,y-1.67,9,3.55,.2,1.35);box(dark,x,y-1.8,9.12,3.2,.035,.85);
  // Separate upper and lower sash, including handles and selectively raised sash.
  for(const [cy,z]of [[y+.75,8.25],[y-.75+r.lift,8.43]]){
   box(glazing,x,cy,z,2.63,1.38,.025);
   for(const side of [-1,1])box(red,x+side*1.32,cy,z+.04,.085,1.5,.1);
   for(const dy of [-.73,.73])box(red,x,cy+dy,z+.04,2.7,.085,.12);
   box(red,x,cy,z+.065,.045,1.43,.055);
  }
  box(bronze,x,y-1.39+r.lift,8.53,.22,.045,.07);
  box(bronze,x,y+1.48,7.82,2.85,.045,.045);
  if(r.blind){
   curtain(x,y+1.44,2.6,r.blind,-1,r.tone,index);
   for(let h=.18;h<r.blind;h+=.22)box(fabrics[r.tone],x,y+1.44-h,7.89,2.6,.025,.04);
   box(wood,x,y+1.44-r.blind,7.85,2.65,.055,.08);
  }else{
   curtain(x-1.3+r.left/2,y+1.43,r.left,2.88,-1,r.tone,index);
   curtain(x+1.3-r.right/2,y+1.43,r.right,2.82,1,r.tone,index+1);
  }
  // Partial furnishings give depth without another real-time light per window.
  if(r.lit||index%3===2){
   box(wood,x+.65,y-.91,6.1,.85,.1,.65);
   for(const dx of [-.33,.33])box(wood,x+.65+dx,y-1.23,6.1,.06,.58,.06);
   box(bronze,x+.65,y-.63,6.1,.045,.5,.045);
   box(r.lit?warm:fabrics[r.tone],x+.65,y-.35,6.1,.45,.32,.4);
  }else{
   box(wood,x-.65,y-.68,5.6,.8,1.65,.3);
   for(let i=0;i<4;i++)box(fabrics[(index+i)%3],x-.87+i*.14,y-.12,5.81,.1,.43+(i%2)*.12,.17);
  }
 });
 cloth.forEach((pieces,i)=>{
  const geometry=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());
  const mesh=new THREE.Mesh(geometry,fabrics[i]);mesh.name='Red Fox pleated curtains';mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 });
}
