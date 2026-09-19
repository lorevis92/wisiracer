import * as THREE from 'three';
import {buildRedFoxInterior} from './redFoxInterior.js';
import {buildRedFoxWindows} from './redFoxWindows.js';
export const RED_FOX={x:-1280,z:2470,width:28,depth:18,height:17};
export function buildRedFox(scene,art){
 const group=new THREE.Group();group.name='Red Fox detailed building';group.position.set(RED_FOX.x,-7,RED_FOX.z);scene.add(group);
 const plaster=new THREE.MeshStandardMaterial({color:0xc9bca5,roughness:.93});
 const stone=art.stone,red=new THREE.MeshStandardMaterial({color:0x512526,roughness:.65});
 const bronze=new THREE.MeshStandardMaterial({color:0x9c8256,metalness:.7,roughness:.3});
 const dark=new THREE.MeshStandardMaterial({color:0x202a2c,roughness:.7});
 const wood=new THREE.MeshStandardMaterial({color:0x493728,roughness:.78});
 const glass=new THREE.MeshStandardMaterial({color:0xc5d1cc,metalness:0,roughness:.12,transparent:true,opacity:.14,depthWrite:false});
 const warm=new THREE.MeshStandardMaterial({color:0xeac58c,emissive:0xe5a259,emissiveIntensity:.65});
 const paving=new THREE.MeshStandardMaterial({color:0x909795,roughness:.95});
 const batches=new Map(),cube=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
 const box=(m,x,y,z,w,h,d,rx=0)=>{if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,rx});};
 // Raised paving: separate slabs, visible joints, granite curb and drain.
 for(let x=-18;x<18;x+=2)for(let z=9.6;z<19;z+=1.5)box(paving,x+1,.1,z+.75,1.96,.2,1.46);
 box(stone,0,.15,19.2,38,.3,.4);
 box(dark,0,-.03,19.8,4,.04,.5);for(let x=-1.9;x<2;x+=.2)box(bronze,x,0,19.8,.07,.04,.45);
 // Shell: solid rear/side walls, actual openings on the principal facade.
 box(plaster,0,8,-8.6,28,16,.8);for(const side of [-1,1])box(plaster,side*13.6,8,0,.8,16,18);
 box(wood,0,.12,0,27,.24,17);box(dark,0,16,0,28,.4,18);
 for(const [y,h]of [[6.5,1],[11.25,1.5],[15.7,1.4]])box(plaster,0,y,8.6,28,h,.8);
 for(let i=0;i<=6;i++)box(plaster,-14+i*28/6,11,8.6,i===0||i===6?.8:1.55,10,.8);
 buildRedFoxWindows(group,box,{stone,red,bronze,wood,dark,warm});
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
 buildRedFoxInterior(group);
 for(const x of [-12.8,12.8]){box(bronze,x,3.8,9.6,.12,.8,.8);box(warm,x,3.5,10,.32,.65,.3);box(dark,x,3.9,10,.5,.15,.5);}
 // Painted timber pilasters and recessed panels give the pub a crafted frontage.
 for(const x of [-13.5,-8,-2.2,2.2,8,13.5]){
  box(red,x,2.7,9.3,.8,5.4,.24);
  for(const y of [1.4,3.8]){box(wood,x,y,9.44,.5,1.65,.06);box(red,x,y,9.49,.4,1.5,.06);}
 }
 // Cornice brackets and facade panels echo the pub's joinery.
 for(let x=-13;x<=13;x+=1.6)box(stone,x,16.1,9.3,.28,.55,.75);
 for(const x of [-13.5,-8,-2.2,2.2,8,13.5]){
  for(const dx of [-.16,.16])box(bronze,x+dx,2.65,9.29,.035,4.5,.04);
 }
 // Raised parapet and roof services.
 for(const z of [-8.8,8.8])box(plaster,0,17,z,28,.7,.35);
 for(const x of [-13.8,13.8])box(plaster,x,17,0,.35,.7,18);
 box(dark,7,16.6,-4,3,.9,2);for(let i=0;i<8;i++)box(bronze,5.7+i*.36,17.08,-4,.1,.04,1.8);
 // Chapter 2: red name, fox alongside, its tail underlining the lettering.
 const c=document.createElement('canvas');c.width=1536;c.height=256;const ctx=c.getContext('2d');
 ctx.clearRect(0,0,1536,256);ctx.textAlign='center';ctx.font='600 150px Georgia';ctx.textBaseline='middle';
 ctx.shadowColor='#ff201a';ctx.shadowBlur=24;ctx.strokeStyle='#ff271d';ctx.lineWidth=3;ctx.strokeText('The Red Fox',768,128);
 ctx.shadowBlur=9;ctx.strokeStyle='#ffb19c';ctx.lineWidth=1.3;ctx.strokeText('The Red Fox',768,128);
 const signTex=new THREE.CanvasTexture(c);signTex.colorSpace=THREE.SRGBColorSpace;
 box(dark,0,6,9.35,24,2.1,.22);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(18,3),new THREE.MeshBasicMaterial({map:signTex,transparent:true,depthWrite:false,toneMapped:false}));sign.position.set(-1.1,6.05,9.52);group.add(sign);
 const neon=new THREE.MeshBasicMaterial({color:0xff3424,toneMapped:false});
 const halo=new THREE.MeshBasicMaterial({color:0xff2519,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
 function tube(points,closed=false){const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(x,y,9.6)),closed,'centripetal');
  for(const [radius,mat]of [[.025,neon],[.095,halo]]){const line=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(32,points.length*6),radius,5,closed),mat);group.add(line);}
 }
 // Pointed ears, muzzle and seated body; one continuous tail sweeps under the name.
 tube([[9,6.35],[8.7,6.75],[8.75,7.1],[9.1,6.88],[9.45,7.05],[9.63,6.7],[10.05,6.48],[9.6,6.3],[9.48,5.95],[9.8,5.55],[9.2,5.35],[8.6,5.45],[8.42,5.95],[8.7,6.28]],true);
 tube([[9.4,5.4],[10.1,5.2],[10.4,4.95],[9.5,4.9],[6,4.92],[2,4.93],[-2,4.93],[-6,4.94],[-10,5.03],[-11.2,5.18]]);
 const spill=new THREE.PointLight(0xff3825,12,9,2);spill.position.set(0,6,10.2);group.add(spill);
 for(const [material,items]of batches){const mesh=new THREE.InstancedMesh(cube,material,items.length);mesh.name='Red Fox architecture';items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,0,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=!material.transparent;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
 scene.userData.buildings ||= [];scene.userData.buildings.push({x:RED_FOX.x,z:RED_FOX.z,hx:14,hz:9});
 return group;
}
