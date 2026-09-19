import * as THREE from 'three';
// A designed pedestrian plaza in the reserved square, between road crossings.
export function buildCivicQuarter(scene,art){
 const g=new THREE.Group();g.name='Canair civic plaza';scene.add(g);
 const stone=art.stone,bronze=new THREE.MeshStandardMaterial({color:0x8f7e69,metalness:.65,roughness:.35});
 const glass=new THREE.MeshStandardMaterial({color:0x739298,metalness:.3,roughness:.16});
 const water=new THREE.MeshStandardMaterial({color:0x579da7,metalness:.18,roughness:.12,transparent:true,opacity:.85});
 const white=new THREE.MeshStandardMaterial({color:0xe5e1d6,roughness:.8});
 const cube=new THREE.BoxGeometry(1,1,1);
 function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
 function box(mat,x,y,z,w,h,d){const m=mesh(cube,mat,x,y,z);m.scale.set(w,h,d);return m;}
 box(stone,320,-6.8,-580,220,.5,240);
 // Paving bands and generous paths connect all four sides.
 for(const x of [220,270,370,420])box(white,x,-6.51,-580,.6,.04,226);
 for(const z of [-685,-635,-525,-475])box(white,320,-6.51,z,204,.04,.6);
 const basin=mesh(new THREE.CylinderGeometry(17,17.6,1.2,48),stone,320,-6,-580);
 mesh(new THREE.CylinderGeometry(15.5,15.5,.12,48),water,320,-5.34,-580);
 const rim=mesh(new THREE.TorusGeometry(16.2,.6,8,64),white,320,-5.35,-580);rim.rotation.x=Math.PI/2;
 const droplets=[],positions=[];
 for(let jet=0;jet<12;jet++)for(let k=0;k<18;k++){droplets.push({angle:jet*Math.PI/6,phase:k/18});positions.push(0,0,0);}
 const sprayGeo=new THREE.BufferGeometry();sprayGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const spray=new THREE.Points(sprayGeo,new THREE.PointsMaterial({color:0xc4e9ed,size:.26,transparent:true,opacity:.7,depthWrite:false}));spray.frustumCulled=false;g.add(spray);
 function update(time){const p=sprayGeo.attributes.position;droplets.forEach((v,i)=>{const t=(v.phase+time*.38)%1,r=12*(1-t);p.setXYZ(i,320+Math.cos(v.angle)*r,-5.2+Math.sin(Math.PI*t)*8,-580+Math.sin(v.angle)*r);});p.needsUpdate=true;}
 scene.userData.cityAnimations ||= [];scene.userData.cityAnimations.push(update);update(0);
 // Gallery pavilion: stone piers, recessed glazing, a curved bronze canopy.
 box(stone,320,-6,-672,100,1.2,32);
 box(glass,320,.5,-680,91,12,1);
 for(let x=276;x<=364;x+=11){box(stone,x,.5,-660,1.2,13,1.2);box(bronze,x,.5,-680,.22,12,1.3);}
 const archPoints=[];for(let i=0;i<=32;i++){const x=-52+104*i/32;archPoints.push(new THREE.Vector3(320+x,9+5*Math.cos(x/52*Math.PI/2),-672));}
 const roofPositions=[],roofIndices=[];
 for(const p of archPoints)for(const dz of [-16,16])roofPositions.push(p.x,p.y+.45,p.z+dz);
 for(let i=0;i<archPoints.length-1;i++){const j=i*2;roofIndices.push(j,j+1,j+2,j+1,j+3,j+2);}
 const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(roofPositions,3));roofGeo.setIndex(roofIndices);roofGeo.computeVertexNormals();
 const canopyMaterial=white.clone();canopyMaterial.side=THREE.DoubleSide;mesh(roofGeo,canopyMaterial,0,0,0);
 for(const dz of [-16,0,16]){const points=archPoints.map(p=>p.clone().add(new THREE.Vector3(0,0,dz)));mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,.4,6,false),bronze,0,0,0);}
 for(let i=0;i<archPoints.length;i+=2){const p=archPoints[i];box(bronze,p.x,p.y,-672,.3,.3,32);}
 // Sculptural stone fins frame a clear sightline into the gardens.
 for(const side of [-1,1]){box(stone,320+side*36,-3,-480,10,7,10);const fin=mesh(new THREE.TorusGeometry(6,.55,8,48,Math.PI*1.65),bronze,320+side*36,5,-480);fin.rotation.z=side*.35;}
 for(const side of [-1,1])for(const z of [-620,-570,-520]){
  box(stone,320+side*90,-5.7,z,5,1.8,14);box(bronze,320+side*89,-4.6,z,3,.35,12);
 }
 scene.userData.buildings ||= [];
 scene.userData.buildings.push({x:320,z:-580,hx:17,hz:17},{x:320,z:-680,hx:46,hz:.7});
 return g;
}
