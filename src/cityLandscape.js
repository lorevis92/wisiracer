import {buildCityFoliage} from './cityFoliage.js';
import * as THREE from 'three';
import {worldMaterial} from './surfaceMaterials.js';
export function buildCityLandscape(scene,stone){
 const g=new THREE.Group();g.name='Canair central garden';scene.add(g);
 const texture=name=>{const t=new THREE.TextureLoader().load(`/assets/canair/${name}.webp`);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;};
 const grass=worldMaterial(new THREE.MeshStandardMaterial({map:texture('grass'),roughness:1}),4);
 const bronze=new THREE.MeshStandardMaterial({color:0x8a7560,metalness:.65,roughness:.3});
 const cube=new THREE.BoxGeometry(1,1,1);
 function box(x,y,z,w,h,d,material){const o=new THREE.Mesh(cube,material);o.position.set(x,y,z);o.scale.set(w,h,d);o.receiveShadow=true;g.add(o);return o;}
 // Garden occupies the reserved central-square plot, between the grid streets.
 box(320,-6.9,-220,320,.6,220,stone);
 for(const dx of [-83,83])for(const dz of [-58,58])box(320+dx,-6.5,-220+dz,145,.3,90,grass);
 box(320,-6.4,-220,18,.35,220,stone);box(320,-6.4,-220,320,.35,16,stone);
 const trees=[];
 for(let i=0;i<24;i++){
  const x=180+(i%8)*40,z=i<8?-312:i<16?-128:-270+(i%2)*100;
  if(i>=16&&Math.abs(x-320)<25)continue;
  trees.push({x,y:-6.2,z,height:9+i%4,radius:4,tone:i%6});
 }
 buildCityFoliage(scene,trees);
 // A small sculpture at the meeting of the paths, without assigning new lore.
 box(320,-5,-220,12,3,12,stone);
 for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(5.5,.35,8,48),bronze);ring.position.set(320,2+i*2,-220);ring.rotation.set(.35+i*.55,i*.8,.25);ring.castShadow=true;g.add(ring);}
 for(const dx of [-25,25])for(const dz of [-35,35]){
  box(320+dx,-4.7,-220+dz,8,.4,2.2,bronze);box(320+dx,-3.9,-219+dz,8,1.6,.3,bronze);
  for(const leg of [-3,3])box(320+dx+leg,-5.6,-220+dz,.4,1.8,1.6,bronze);
 }
 const water=new THREE.MeshStandardMaterial({color:0x31596b,roughness:.32,metalness:.35});
 water.onBeforeCompile=s=>{s.uniforms.coastTime={value:0};water.userData.shader=s;s.fragmentShader='uniform float coastTime;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 normal=normalize(normal+vec3(sin(vViewPosition.x*.018+coastTime)*.055,cos(vViewPosition.z*.025+coastTime*.7)*.055,0.0));`);};
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(100000,100000),water);sea.name='Canair water horizon';sea.rotation.x=-Math.PI/2;sea.position.y=-24;sea.onBeforeRender=()=>{if(water.userData.shader)water.userData.shader.uniforms.coastTime.value=performance.now()*.0003;};scene.add(sea);
 return g;
}
