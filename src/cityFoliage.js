import * as THREE from 'three';
export const FOLIAGE_COLORS=[0x347b3c,0x89b841,0xe3b63c,0xcd6331,0x9f3545,0x4b954c];
export function foliageTexture(){const t=new THREE.TextureLoader().load('/assets/canair/foliage-cutout.webp');t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
export function buildCityFoliage(scene,trees,{texture=foliageTexture()}={}){
 const group=new THREE.Group();group.name='Canair varied foliage';scene.add(group);
 const foliage=new THREE.MeshStandardMaterial({map:texture,alphaTest:.45,side:THREE.DoubleSide,roughness:.93});
 const bark=new THREE.MeshStandardMaterial({color:0x66513c,roughness:1});
 const card=new THREE.PlaneGeometry(1,1),branch=new THREE.CylinderGeometry(1,1,1,6),dummy=new THREE.Object3D(),chunks=new Map();
 for(const [index,tree]of trees.entries()){
  const {x,y,z,height=9,radius=3.4}=tree,key=Math.floor(x/500)+':'+Math.floor(z/500);
  if(!chunks.has(key))chunks.set(key,{leaves:[],branches:[]});const chunk=chunks.get(key);
  let seed=((Math.round(x*13+z*19)+index*37)>>>0)||1;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const tone=tree.tone??Math.abs(Math.round(x/37+z/51))%FOLIAGE_COLORS.length;
  const base=new THREE.Vector3(x,y,z),top=new THREE.Vector3(x+.15,y+height*.83,z);
  chunk.branches.push({a:base,b:top,r:height*.019});
  for(let limb=0;limb<6;limb++){
   const angle=limb*2.4+rand(),cx=x+Math.cos(angle)*radius*.65,cz=z+Math.sin(angle)*radius*.65,cy=y+height*(.63+rand()*.3);
   chunk.branches.push({a:new THREE.Vector3(x,y+height*.45,z),b:new THREE.Vector3(cx,cy,cz),r:height*.005});
   for(let k=0;k<14;k++){
    const a=rand()*6.283,u=rand()*2-1,r=Math.cbrt(rand())*radius*.65;
    const color=new THREE.Color(FOLIAGE_COLORS[tone]);color.offsetHSL((rand()-.5)*.025,(rand()-.5)*.08,(rand()-.5)*.1);
    chunk.leaves.push({x:cx+Math.cos(a)*r,y:cy+u*r*.7,z:cz+Math.sin(a)*r,rx:rand()*Math.PI,ry:rand()*Math.PI,rz:rand()*Math.PI,size:radius*(.5+rand()*.25),color});
   }
  }
 }
 for(const [key,chunk]of chunks){
  const wood=new THREE.InstancedMesh(branch,bark,chunk.branches.length);wood.name='Tree branches '+key;
  chunk.branches.forEach((v,i)=>{dummy.position.copy(v.a).add(v.b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.b.clone().sub(v.a).normalize());dummy.scale.set(v.r,v.a.distanceTo(v.b),v.r);dummy.updateMatrix();wood.setMatrixAt(i,dummy.matrix);});
  const leaves=new THREE.InstancedMesh(card,foliage,chunk.leaves.length);leaves.name='Leaf clusters '+key;
  chunk.leaves.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.scale.setScalar(v.size);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,v.color);});
  for(const mesh of [wood,leaves]){mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
 }
 group.userData.treeCount=trees.length;return group;
}
