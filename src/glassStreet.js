import * as THREE from 'three';

// One authored street segment, shared between city and inspection view.
export function buildGlassStreet(scene,art,{depth=38,width=56,height=65,x=0,z=0,y=0,yaw=0,backdrop=false}={}){
 const root=new THREE.Group();root.name='Glass street showcase';root.position.set(x,y,z);root.rotation.y=yaw;scene.add(root);
 const material=(color,roughness=.8,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const stone=art.stone,bronze=material(0x8c7860,.32,{metalness:.7}),dark=material(0x293333),floor=material(0xaaa698),wood=material(0x76604a);
 const glass=new THREE.MeshPhysicalMaterial({color:0xbbd0d1,metalness:.25,roughness:.095,transparent:true,opacity:.47,depthWrite:false,envMapIntensity:1.25,clearcoat:1,clearcoatRoughness:.06});
 const warm=material(0xd0bea0,.7,{emissive:0xc8a879,emissiveIntensity:.22});
 const geometry=new THREE.BoxGeometry(),dummy=new THREE.Object3D(),batches=new Map();
 function B(m,x,y,z,w,h,d){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d});}
 // Floor plates, recessed rooms and glass skin are independent layers.
 B(stone,0,.25,0,depth+.7,.5,width+.7);
 B(dark,depth*.2,height/2,0,depth*.4,height,width*.92);
 const levels=Math.max(3,Math.floor(height/6.5)),step=height/levels;
 for(let level=0;level<=levels;level++){
  const yy=level*step;
  B(floor,0,yy,0,depth,.28,width);
  if(level<levels){
   for(let a=0;a<6;a++){
    const zz=-width/2+(a+.5)*width/6;
    B(level%3===1?warm:floor,depth*.08,yy+step/2,zz,.14,step-.3,width/6-.2);
    B(wood,-depth*.25,yy+1.1,zz,3.2,.12,2.2);
    B(bronze,-depth*.25,yy+.58,zz,.13,1.05,1.5);
    B(dark,-depth*.25,yy+1.5,zz-.6,.15,.7,.85);
    B(dark,-depth*.13,yy+.7,zz,1,.13,1);B(dark,-depth*.1,yy+1.05,zz,.15,.8,1);
    B(warm,-depth*.27,yy+step-.25,zz,2,.06,.12);
   }
  }
 }
 for(const side of [-1,1]){
  for(let bay=0;bay<8;bay++)for(let level=0;level<levels;level++){
   const zz=-width/2+(bay+.5)*width/8;
   B(glass,side*(depth/2-.25),level*step+step/2,zz,.04,step-.32,width/8-.18);
  }
  for(let k=0;k<=8;k++)B(bronze,side*(depth/2+.12),height/2,-width/2+k*width/8,.45,height,.17);
  for(let level=1;level<levels;level++)B(bronze,side*(depth/2+.02),level*step,0,.18,.1,width);
 }
 for(const side of [-1,1]){
  B(glass,0,height/2,side*(width/2-.15),depth-.3,height,.035);
  for(let k=0;k<=5;k++)B(bronze,-depth/2+k*depth/5,height/2,side*width/2,.12,height,.25);
 }
 // Monumental stone base, recessed lobby and bronze canopy.
 for(const zz of [-width*.46,-width*.23,width*.23,width*.46])B(stone,-depth/2+.1,3.4,zz,1.1,6.8,1.1);
 B(bronze,-depth/2-1,6.6,0,3.3,.25,width*.54);
 B(stone,0,height+.2,0,depth+1,.4,width+1);
 B(dark,depth*.15,height+2,0,depth*.45,3.6,width*.72);
 // Paving modules and a clear walking strip outside the facade.
 const pavement=material(0x999d97,.95);
 for(let xx=-depth/2-22;xx<-depth/2;xx+=2)for(let zz=-width/2-3;zz<width/2+3;zz+=2)B(pavement,xx,.12,zz,1.96,.24,1.96);
 B(stone,-depth/2-22,.16,0,.3,.32,width+8);
 for(const zz of [-width*.35,0,width*.35]){
  B(bronze,-depth/2-5,.9,zz,1,.18,3.5);B(wood,-depth/2-4.55,1.3,zz,.13,.9,3.5);
  for(const dz of [-1.3,1.3])B(bronze,-depth/2-5,.5,zz+dz,.8,.8,.13);
 }
 // Fine geometric leaves allow gaps and cast irregular shadows without alpha cards.
 const bark=material(0x62513e),leafMat=material(0xffffff,1,{side:THREE.DoubleSide});
 const leafGeo=new THREE.PlaneGeometry(.35,.75);const leaves=[],branches=[];
 let seed=9381;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const zz of [-width*.42,-width*.14,width*.14,width*.42]){
  const tx=-depth/2-16;
  B(stone,tx,.38,zz,3,.76,3);B(wood,tx,.8,zz,2.6,.08,2.6);
  branches.push({a:new THREE.Vector3(tx,.8,zz),b:new THREE.Vector3(tx+.2,5.5,zz),r:.2});
  for(let limb=0;limb<7;limb++){
   const angle=limb*2.4,cy=4.4+rand()*2.8,cx=tx+Math.cos(angle)*1.7,cz=zz+Math.sin(angle)*1.7;
   branches.push({a:new THREE.Vector3(tx,3.1+limb*.28,zz),b:new THREE.Vector3(cx,cy,cz),r:.055});
   for(let n=0;n<110;n++){
    const a=rand()*Math.PI*2,u=rand()*2-1,r=Math.cbrt(rand())*1.6;
    leaves.push({x:cx+Math.cos(a)*Math.sqrt(1-u*u)*r,y:cy+u*r*.85,z:cz+Math.sin(a)*Math.sqrt(1-u*u)*r,rx:rand()*Math.PI,ry:rand()*Math.PI,scale:.7+rand()*.8});
   }
  }
 }
 const treeBranches=new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,7),bark,branches.length);
 branches.forEach(({a,b,r},i)=>{dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());dummy.scale.set(r,a.distanceTo(b),r);dummy.updateMatrix();treeBranches.setMatrixAt(i,dummy.matrix);});treeBranches.castShadow=true;treeBranches.computeBoundingSphere();root.add(treeBranches);
 const canopy=new THREE.InstancedMesh(leafGeo,leafMat,leaves.length);
 leaves.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx,v.ry,0);dummy.scale.setScalar(v.scale);dummy.updateMatrix();canopy.setMatrixAt(i,dummy.matrix);canopy.setColorAt(i,new THREE.Color().setHSL(.22+rand()*.07,.25+rand()*.15,.45+rand()*.18));});canopy.castShadow=true;canopy.receiveShadow=true;canopy.computeBoundingSphere();root.add(canopy);
 // Pedestrians move only along the protected walking strip, never across the race lane.
 const people=[],skin=material(0xb68e70),trousers=material(0x414a51),coat=[material(0x806e59),material(0x546779),material(0x6c514d)];
 const limbGeo=new THREE.CylinderGeometry(.09,.075,.8,7),headGeo=new THREE.SphereGeometry(.18,10,8),torsoGeo=new THREE.CylinderGeometry(.24,.17,.65,8);
 for(let i=0;i<8;i++){
  const person=new THREE.Group();person.name='Glass street pedestrian';const body=new THREE.Mesh(torsoGeo,coat[i%3]);body.position.y=1.2;person.add(body);
  const head=new THREE.Mesh(headGeo,skin);head.position.y=1.75;person.add(head);
  const arms=[],legs=[];
  for(const side of [-1,1]){
   const leg=new THREE.Group();leg.position.set(side*.13,.94,0);const mesh=new THREE.Mesh(limbGeo,trousers);mesh.position.y=-.38;leg.add(mesh);person.add(leg);legs.push(leg);
   const arm=new THREE.Group();arm.position.set(side*.29,1.43,0);const am=new THREE.Mesh(limbGeo,coat[i%3]);am.scale.set(.75,.85,.75);am.position.y=-.3;arm.add(am);person.add(arm);arms.push(arm);
  }
  person.traverse(o=>{if(o.isMesh)o.castShadow=true;});root.add(person);people.push({person,legs,arms,phase:i/8,lane:i%2});
 }
 const update=time=>{for(const p of people){const u=(p.phase+time*.012)%1,forward=u<.5,zz=(forward?u*2:(1-u)*2)*(width-8)-width/2+4;
  p.person.position.set(-depth/2-9-p.lane*2,.24,zz);p.person.rotation.y=forward?0:Math.PI;
  p.legs.forEach((l,i)=>l.rotation.x=Math.sin(time*5+p.phase*12+i*Math.PI)*.4);
  p.arms.forEach((l,i)=>l.rotation.x=-Math.sin(time*5+p.phase*12+i*Math.PI)*.3);
 }};update(0);
 if(backdrop){
  // Review-only context: in the race the surrounding metropolis already supplies the skyline.
  for(let i=0;i<9;i++){const hh=50+(i*37)%100;B(i%2?dark:floor,100+(i%3)*45,hh/2,-170+i*44,24,hh,30);for(let yy=5;yy<hh;yy+=6)B(bronze,87+(i%3)*45,yy,-170+i*44,.1,.2,30);}
 }
 const paneMeshes=[];
 for(const [m,items]of batches){const mesh=new THREE.InstancedMesh(geometry,m,items.length);items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(0,0,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=!m.transparent;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);if(m===glass)paneMeshes.push(mesh);}
 let reflection;
 function capture(renderer){
  // A static local probe includes surrounding architecture and trees; no six renders per frame.
  const target=new THREE.WebGLCubeRenderTarget(128,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
  const probe=new THREE.CubeCamera(.5,1200,target);root.updateMatrixWorld(true);probe.position.copy(root.localToWorld(new THREE.Vector3(-depth/2-2,height*.4,0)));
  paneMeshes.forEach(m=>m.visible=false);
  let pmrem;
  try{probe.update(renderer,scene);pmrem=new THREE.PMREMGenerator(renderer);reflection=pmrem.fromCubemap(target.texture);glass.envMap=reflection.texture;glass.needsUpdate=true;}
  catch(error){console.warn('Local reflection unavailable; keeping sky environment.',error);}
  finally{pmrem?.dispose();paneMeshes.forEach(m=>m.visible=true);target.dispose();}
 }
 function dispose(){reflection?.dispose();}
 return {root,update,capture,dispose,center:()=>root.getWorldPosition(new THREE.Vector3())};
}
