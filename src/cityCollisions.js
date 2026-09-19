// Spatial lookup plus circle-versus-oriented-building contact in world X/Z.
export function buildingIndex(boxes,cellSize=160){
 const cells=new Map();
 for(const box of boxes){const r=Math.hypot(box.hx,box.hz)+8;
  for(let x=Math.floor((box.x-r)/cellSize);x<=Math.floor((box.x+r)/cellSize);x++)for(let z=Math.floor((box.z-r)/cellSize);z<=Math.floor((box.z+r)/cellSize);z++){
   const key=x+':'+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(box);
  }
 }
 return (x,z)=>cells.get(Math.floor(x/cellSize)+':'+Math.floor(z/cellSize))||[];
}
export function resolveBuilding(body,box,radius=7){
 const c=Math.cos(box.yaw||0),s=Math.sin(box.yaw||0),dx=body.x-box.x,dz=body.z-box.z;
 const x=c*dx-s*dz,z=s*dx+c*dz;
 const qx=Math.max(-box.hx,Math.min(box.hx,x)),qz=Math.max(-box.hz,Math.min(box.hz,z));
 let nx=x-qx,nz=z-qz,d=Math.hypot(nx,nz),penetration;
 if(d>=radius)return null;
 if(d>1e-8){nx/=d;nz/=d;penetration=radius-d;}
 else {const px=box.hx-Math.abs(x),pz=box.hz-Math.abs(z);if(px<pz){nx=x<0?-1:1;nz=0;penetration=radius+px;}else{nx=0;nz=z<0?-1:1;penetration=radius+pz;}}
 const wx=c*nx+s*nz,wz=-s*nx+c*nz;
 body.x+=wx*(penetration+.001);body.z+=wz*(penetration+.001);
 const closing=-(body.vx*wx+body.vz*wz);
 if(closing>0){body.vx+=wx*closing*1.15;body.vz+=wz*closing*1.15;}
 return {speed:Math.max(0,closing),nx:wx,nz:wz};
}
