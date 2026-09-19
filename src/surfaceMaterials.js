// World-space mapping keeps materials at a fixed scale across instanced buildings.
export function worldMaterial(material,tileSize=20,facade=false){
 material.onBeforeCompile=shader=>{
  shader.uniforms.cityTileSize={value:tileSize};
  shader.vertexShader='varying vec3 vCityWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 cityPosition=vec4(transformed,1.0);
   #ifdef USE_INSTANCING
    cityPosition=instanceMatrix*cityPosition;
   #endif
   vCityWorld=(modelMatrix*cityPosition).xyz;`);
  shader.fragmentShader='varying vec3 vCityWorld;\nuniform float cityTileSize;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   #ifdef USE_MAP
    vec3 cityN=abs(normalize(cross(dFdx(vCityWorld),dFdy(vCityWorld))));
    vec2 cityUV=cityN.y>max(cityN.x,cityN.z)?vCityWorld.xz:(cityN.x>cityN.z?vCityWorld.zy:vCityWorld.xy);
    vec4 cityTex=texture2D(map,cityUV/cityTileSize);
    ${facade?'if(cityN.y>.7)cityTex=vec4(.32,.34,.35,1.0);':''}
    diffuseColor*=cityTex;
   #endif`);
 };
 material.customProgramCacheKey=()=>`city-world-${tileSize}-${facade}`;
 material.extensions={...material.extensions,derivatives:true};
 return material;
}
