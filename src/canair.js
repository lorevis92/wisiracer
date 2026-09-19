import * as THREE from 'three';
import {buildCityLandscape} from './cityLandscape.js';
import {cityMaterials,buildCityArt} from './cityArt.js';
import {buildMasterplan} from './masterplan.js';

export const CANAIR = {
  label: 'Canair Afterdark',
  desc: 'Stollin Rones · boulevard dorati, Red Fox e galleria sopraelevata.',
  city: true, halfWidth: 56, bg: 0x0c1327, fog: 0x20263b,
  fogD: 0.00075, amb: 0xa8bed8, sun: 0xffd2a3,
  nebula: false, planet: false, rockColor: 0x555555, rocks: 0,
  pts: [[0,0,0],[0,0,-220],[0,0,-440],[150,0,-620],[400,2,-620],
    [600,8,-420],[580,22,-140],[710,32,80],[590,32,350],
    [380,18,520],[150,2,600],[0,0,440],[0,0,220]],
};

// Geometry and bundled Higgsfield materials.
export function buildCanair(scene, curve, startT = 0, track = CANAIR) {
  const HW = track.halfWidth;
  const art=track.masterplan ? cityMaterials() : null;
  const widthAt=t=>track.widthAt ? track.widthAt(t) : HW;
  const group = new THREE.Group(); group.name = 'Canair Afterdark'; scene.add(group);
  const stone = new THREE.MeshStandardMaterial({color:0x303747, roughness:0.86});
  const road = art?.asphalt || new THREE.MeshStandardMaterial({color:0x697988, emissive:0x263442, emissiveIntensity:0.35, roughness:0.9, metalness:0.02, side:THREE.DoubleSide});
  const gold = new THREE.MeshBasicMaterial({color:0xffce85});
  const cyan = new THREE.MeshBasicMaterial({color:0x65d9dd});
  const pink = new THREE.MeshBasicMaterial({color:0xf66b83});
  const cube = new THREE.BoxGeometry(1,1,1);
  const dummy = new THREE.Object3D();
  let seed = 92;
  function rand() { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }
  function frame(t) {
    const p=curve.getPointAt((t+1)%1), tangent=curve.getTangentAt((t+1)%1);
    const side=new THREE.Vector3().crossVectors(tangent,new THREE.Vector3(0,1,0)).normalize();
    return {p,tangent,side,yaw:Math.atan2(tangent.x,tangent.z)};
  }
  function box(pos, scale, material, yaw=0) {
    const mesh=new THREE.Mesh(cube,material); mesh.position.copy(pos); mesh.scale.set(...scale); mesh.rotation.y=yaw; group.add(mesh); return mesh;
  }
  function ribbon(offset,width,height,mat) {
    const positions=[],indices=[],uv=[];
    for(let i=0;i<=800;i++) {
      const {p,side}=frame(i/800);
      for(const edge of [-0.5,0.5]) {
        const v=p.clone().addScaledVector(side,(typeof offset === "function" ? offset(i/800) : offset)+edge*(typeof width === "function" ? width(i/800) : width)); positions.push(v.x,v.y+height,v.z); uv.push((edge+.5)*(typeof width === "function" ? width(i/800) : width)/6,i/800*curve.getLength()/6);
      }
      if(i<800) { const n=i*2; indices.push(n,n+2,n+1,n+1,n+2,n+3); }
    }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices); geo.computeVertexNormals(); group.add(new THREE.Mesh(geo,mat));
  }
  ribbon(0,t=>widthAt(t)*2,-7,road);
  for(const sign of [-1,1]) {
    if(track.masterplan){
      ribbon(t=>sign*(widthAt(t)+13),26,-6.65,art.stone);
      ribbon(t=>sign*(widthAt(t)-1),.6,-6.85,new THREE.MeshBasicMaterial({color:0xe5dfce}));
      continue;
    }
    ribbon(t=>sign*(widthAt(t)+5),10,-6.8,stone);
    ribbon(t=>sign*(widthAt(t)-4),2.4,-6.85,sign===1?cyan:gold);
    const wallVertices=[],wallIndices=[],wallUV=[];
    for(let i=0;i<=800;i++) {
      const {p,side}=frame(i/800);p.addScaledVector(side,sign*widthAt(i/800));
      wallVertices.push(p.x,p.y-7,p.z,p.x,p.y+7,p.z);
      wallUV.push(i/800*curve.getLength()/8,0,i/800*curve.getLength()/8,1.75);
      if(i<800){const n=i*2;wallIndices.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
    const wallGeo=new THREE.BufferGeometry();wallGeo.setAttribute('position',new THREE.Float32BufferAttribute(wallVertices,3));
    wallGeo.setAttribute("uv",new THREE.Float32BufferAttribute(wallUV,2));wallGeo.setIndex(wallIndices);wallGeo.computeVertexNormals();
    const wallMat=new THREE.MeshStandardMaterial({color:0xd2b58b,emissive:0x6e4b21,emissiveIntensity:0.4,roughness:0.9,side:THREE.DoubleSide});
    if(art){wallMat.map=art.stone.map;wallMat.color.setHex(0xd2c7af);wallMat.emissiveIntensity=.12;}
    group.add(new THREE.Mesh(wallGeo,wallMat));
    const points=Array.from({length:401},(_,i)=>{const {p,side}=frame(i/400);return p.clone().addScaledVector(side,sign*widthAt(i/400)).add(new THREE.Vector3(0,7,0));});
    const railCurve=new THREE.CatmullRomCurve3(points.slice(0,-1),true);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(railCurve,800,1.1,5,true),stone));
    const lightPoints=points.slice(0,-1).map(p=>p.clone().add(new THREE.Vector3(0,1.1,0)));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lightPoints,true),800,0.5,4,true),sign===1?cyan:gold));
  }
  const ground=box(new THREE.Vector3(180,-34,0),[2400,8,2100],new THREE.MeshStandardMaterial({color:0x101b22,roughness:0.95}));
  ground.name='City foundations';

  if (track.masterplan) {
    buildMasterplan(scene,curve,art);
    buildCityLandscape(scene,art.stone);
    buildCityArt(scene,curve,widthAt,art);
    // Broken lane markings orient the driver without closing the street.
    const paint=new THREE.MeshBasicMaterial({color:0xe9e1cc});
    const count=Math.floor(curve.getLength()/45);
    const marks=new THREE.InstancedMesh(cube,paint,count);
    for(let i=0;i<count;i++){const {p,yaw}=frame(i/count);dummy.position.copy(p);dummy.position.y-=6.9;dummy.rotation.set(0,yaw,0);dummy.scale.set(.65,.05,12);dummy.updateMatrix();marks.setMatrixAt(i,dummy.matrix);}
    marks.computeBoundingSphere();group.add(marks);
    const {p,yaw}=frame(startT);p.y-=6.7;box(p,[HW*2,0.1,3],cyan,yaw);
    return group;
  }

  if (track.practice) {
    // A quiet test track isolates steering and camera feel from scenery.
    for(let i=0;i<80;i++){const {p,yaw}=frame(i/80);p.y-=6.8;box(p,[0.5,0.08,9],gold,yaw);}
    const {p,yaw}=frame(startT);p.y-=6.7;box(p,[HW*2,0.1,2],cyan,yaw);
    return group;
  }

  // Instanced facades/windows keep draw calls low on mobile.
  const buildings=[], windows=[], lamps=[], plants=[];
  const pathSamples=curve.getSpacedPoints(240);
  for(let i=0;i<116;i++) for(const sign of [-1,1]) {
    const {p,side,yaw}=frame(i/116);
    const depth=22+rand()*13, width=15+rand()*9, height=22+rand()*78;
    const center=p.clone().addScaledVector(side,sign*(HW+31+rand()*8));
    // No facades protruding into an adjacent stretch of road.
    if(pathSamples.some(q=>Math.hypot(q.x-center.x,q.z-center.z)<HW+17)) continue;
    buildings.push({p:new THREE.Vector3(center.x,p.y-7+height/2,center.z),s:[depth,height,width],yaw});
    const face=center.clone().addScaledVector(side,-sign*(depth/2+0.1));
    for(let row=0;row<Math.floor(height/7);row++) for(let col=-1;col<=1;col++) {
      if(rand()<0.25)continue;
      const v=face.clone().addScaledVector(new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),col*5);
      v.y=p.y-3+row*7; windows.push({p:v,s:[0.3,2.2,2.3],yaw});
    }
  }
  for(let i=0;i<90;i++) {
    const {p,side,yaw}=frame(i/90);
    for(const sign of [-1,1]) {
      const v=p.clone().addScaledVector(side,sign*(HW+6)); v.y+=4;
      lamps.push({p:v,s:[0.5,22,0.5],yaw});
      const crown=v.clone(); crown.y+=10; plants.push({p:crown,s:[3.6,0.7,3.6],yaw});
    }
    const dash=p.clone();dash.y-=6.8;box(dash,[0.4,0.08,7],gold,yaw);
  }
  function instances(items,mat,name) {
    const mesh=new THREE.InstancedMesh(cube,mat,items.length); mesh.name=name;
    items.forEach((x,i)=>{dummy.position.copy(x.p);dummy.rotation.set(0,x.yaw,0);dummy.scale.set(...x.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.computeBoundingSphere();group.add(mesh);
  }
  instances(buildings,stone,'Canair facades');instances(windows,gold,'Warm windows');
  instances(lamps,stone,'Streetlights');instances(plants,gold,'Lanterns');

  function sign(t,offset,title,subtitle,color,width=35) {
    const {p,side,tangent}=frame(t);
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=384;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#101724';ctx.fillRect(0,0,1024,384);
    ctx.strokeStyle=color;ctx.lineWidth=12;ctx.strokeRect(12,12,1000,360);
    ctx.textAlign='center';ctx.fillStyle=color;ctx.font='bold 100px sans-serif';ctx.fillText(title,512,175);
    ctx.fillStyle='#f4dbb5';ctx.font='30px sans-serif';ctx.fillText(subtitle,512,280);
    if(title==='THE RED FOX') {
      ctx.strokeStyle=color;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(145,205);ctx.bezierCurveTo(950,205,850,220,900,165);ctx.stroke();
    }
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*0.375),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
    mesh.position.copy(p).addScaledVector(side,offset);mesh.position.y+=17;
    mesh.lookAt(mesh.position.clone().add(offset===0?tangent:side.clone().multiplyScalar(-Math.sign(offset))));group.add(mesh);
  }
  sign(0.20,-(HW+9),'THE RED FOX','LIVE MUSIC · CANAIR','#ff6378',43);
  sign(0.36,HW+11,'LUBE TONE','STOLLIN RONES · AFTER DARK','#ffcf83');
  sign(startT,0,'CANAIR','WISIVERSE GRAND PRIX','#70e2da',52);
  // An open-sided gallery: roofs are above the chase camera and racing envelope.
  for(let i=0;i<18;i++) {
    const {p,side,yaw}=frame(0.52+i*0.003);
    box(p.clone().add(new THREE.Vector3(0,30,0)),[HW*2+19,2,9],stone,yaw);
    for(const sg of [-1,1])box(p.clone().addScaledVector(side,sg*(HW+7)).add(new THREE.Vector3(0,11,0)),[2,38,2],stone,yaw);
    box(p.clone().add(new THREE.Vector3(0,28.8,0)),[HW*2-3,0.25,0.5],i%2?pink:cyan,yaw);
  }
  // Green terraces: the planet is lush, even in the city.
  const foliage=new THREE.MeshStandardMaterial({color:0x235e50,roughness:1});
  const plantGeo=new THREE.IcosahedronGeometry(1,1);
  for(let i=0;i<52;i++) {
    const {p,side}=frame(i/52);const tree=new THREE.Mesh(plantGeo,foliage);
    tree.position.copy(p).addScaledVector(side,(i%2?1:-1)*(HW+11));tree.position.y+=2;
    tree.scale.set(3,6,3);group.add(tree);
  }
  return group;
}

export const PRACTICE = {
  ...CANAIR, label: 'Prova guida', practice: true, halfWidth: 64,
  desc: 'Pista larga · curva veloce, tornante e esse. Prova sterzo, freno, boost e sparo.',
  bg: 0x536e88, fog: 0x71879b, fogD: 0.00035, amb: 0xe4efff, sun: 0xfff1d9,
  pts: [[0,0,0],[0,0,-220],[0,0,-440],[150,0,-620],[420,0,-620],
    [650,0,-420],[650,0,-160],[530,0,40],[650,0,260],
    [460,0,490],[180,0,600],[0,0,440],[0,0,220]],
};
