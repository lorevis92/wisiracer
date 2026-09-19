import * as THREE from 'three';
// A small generated lighting environment, not an image-generation asset.
// Gives glass and metal a sky/ground reflection without six city renders/frame.
export function cityEnvironment(renderer,scene){
 const env=new THREE.Scene();
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{top:{value:new THREE.Color(0x83aaca)},horizon:{value:new THREE.Color(0xd3d9d6)},ground:{value:new THREE.Color(0x62685e)}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform vec3 top;uniform vec3 horizon;uniform vec3 ground;void main(){float h=normalize(p).y;vec3 c=h>0.?mix(horizon,top,pow(h,.5)):mix(horizon,ground,min(1.,-h*4.));gl_FragColor=vec4(c,1.);}'});
 const sphere=new THREE.Mesh(new THREE.SphereGeometry(100,24,12),material);env.add(sphere);
 const generator=new THREE.PMREMGenerator(renderer),target=generator.fromScene(env,.04,.1,200);
 scene.environment=target.texture;
 generator.dispose();sphere.geometry.dispose();material.dispose();
 return ()=>{scene.environment=null;target.dispose();};
}
