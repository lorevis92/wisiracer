import {AUTHORED_LANDMARKS,buildAuthoredLandmark} from './cityLandmarks.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {architectureMaterials,buildStreetArchitecture,ARCHETYPES} from './cityArchitecture.js';
import {cityMaterials} from './cityArt.js';
import {cityEnvironment} from './cityEnvironment.js';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xc0ced5);cityEnvironment(renderer,scene);scene.add(new THREE.HemisphereLight(0xe5f3ff,0x766451,1.7));
const sun=new THREE.DirectionalLight(0xffefd9,3);sun.position.set(-65,120,80);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-90,right:90,top:90,bottom:-90,near:1,far:280});sun.shadow.normalBias=.1;scene.add(sun);
const art=cityMaterials(),materials=architectureMaterials(art),cube=new THREE.BoxGeometry(),dummy=new THREE.Object3D();
const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400),art.asphalt);ground.rotation.x=-Math.PI/2;ground.position.y=-.2;ground.receiveShadow=true;scene.add(ground);
const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,600);camera.position.set(-90,45,85);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,22,0);controls.minDistance=8;controls.maxDistance=220;controls.maxPolarAngle=Math.PI*.49;controls.enableDamping=true;
let building;
function show(id){
 if(building){scene.remove(building);const disposed=new Set();const free=o=>{if(o&&!disposed.has(o)){disposed.add(o);o.dispose();}};building.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(building.userData.authoredLandmark&&o.isMesh){free(o.geometry);if(o.material!==art.stone){free(o.material.map);free(o.material);}}});}
 if(id>=6){building=buildAuthoredLandmark(scene,id-6,art,{placeInCity:false});document.getElementById('reference').src='/assets/canair/references/'+AUTHORED_LANDMARKS[id-6].reference+'.webp';return;}
 building=new THREE.Group();scene.add(building);const batches=new Map();
 buildStreetArchitecture({id,depth:38,w:56,h:[43,75,43,34,51,29][id],sign:1,yaw:0,materials,
 place:(x,z,y)=>new THREE.Vector3(x,y,z),add:(mat,p,size)=>{if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push({p,size});}});
 for(const [mat,items]of batches){const mesh=new THREE.InstancedMesh(cube,mat,items.length);items.forEach((v,i)=>{dummy.position.copy(v.p);dummy.scale.set(...v.size);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();building.add(mesh);}
 document.getElementById('reference').src='/assets/canair/references/type-'+id+'.webp';
}
const select=document.getElementById('building');[...ARCHETYPES,...AUTHORED_LANDMARKS.map(a=>a.name)].forEach((label,id)=>{const o=document.createElement('option');o.value=id;o.textContent=label;select.appendChild(o);});select.addEventListener('change',()=>show(Number(select.value)));show(0);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
