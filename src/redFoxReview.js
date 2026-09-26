import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {cityMaterials} from './cityArt.js';
import {buildRedFox} from './redFox.js';
import {cityEnvironment} from './cityEnvironment.js';
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xbdc9cd);cityEnvironment(renderer,scene);scene.add(new THREE.HemisphereLight(0xe4f1ff,0x5f534a,1.4));
const sun=new THREE.DirectionalLight(0xffefd8,2.8);sun.position.set(-25,45,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:150});sun.shadow.normalBias=.06;scene.add(sun);
const art=cityMaterials(),fox=buildRedFox(scene,art);fox.position.set(0,0,0);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({map:art.asphalt.map,color:0x68727b,roughness:.95}));ground.material.map.repeat.set(30,30);ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,250);camera.position.set(33,16,45);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,7,3);controls.minDistance=8;controls.maxDistance=100;controls.maxPolarAngle=Math.PI*.49;controls.enableDamping=true;
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});

// The same furnished room as in the city; no substitute render or image.
function viewInterior(inside){
 controls.minDistance=inside?.5:8;controls.maxDistance=inside?18:100;
 camera.position.set(...(inside?[.2,2.65,7.3]:[33,16,45]));
 controls.target.set(...(inside?[0,2,-3.9]:[0,7,3]));controls.update();
}
document.getElementById('interior').addEventListener('click',()=>viewInterior(true));
document.getElementById('exterior').addEventListener('click',()=>viewInterior(false));
