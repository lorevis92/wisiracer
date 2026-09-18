import * as THREE from 'three';
const corners=[[-900,-650],[850,-650],[1050,-400],[1050,350],[780,650],[100,650],[-180,430],[-500,650],[-1000,380]];
export function cityRoute(){
 const p=[];corners.forEach((v,i)=>{const a=corners[(i+corners.length-1)%corners.length],b=corners[(i+1)%corners.length];const x=v.map((n,j)=>n+(a[j]-n)*.16),y=v.map((n,j)=>n+(b[j]-n)*.16);for(let k=0;k<=12;k++){const t=k/12;p.push(v.map((n,j)=>(1-t)**2*x[j]+2*(1-t)*t*n+t*t*y[j]));}});
 // Insert the start on the long south straight; preserve the approved plan.
 const i=p.findIndex((a,k)=>{const b=p[(k+1)%p.length];return Math.abs(a[1]+650)<.01&&Math.abs(b[1]+650)<.01&&a[0]<-200&&b[0]>-200;});
 return [[-200,0,650],...p.slice(i+1).concat(p.slice(0,i+1)).map(([x,y])=>[x,0,-y])];
}
export const MASTERPLAN={label:'Canair · Prova città',desc:'Nuova città · un giro di circa 6 km · Utgenra e luoghi dei capitoli. Volumi provvisori.',city:true,masterplan:true,practice:true,halfWidth:35,bg:0x718ca0,fog:0x9aafbc,fogD:0.00022,amb:0xe4efff,sun:0xfff1d9,nebula:false,planet:false,rocks:0,pts:cityRoute()};
export function utgenraHeight(x,y){const u=(x-1100)/750,v=(y-120)/920;if(u<=0||u>=1||v<=0||v>=1)return 0;if(x>=1180&&x<=1300&&y>=430&&y<=550)return 115;return 340*Math.sin(Math.PI*u)**.9*Math.sin(Math.PI*v)**.9*(1+.10*Math.sin(x*.023)*Math.sin(y*.018));}
export const landmarks=[['THE RED FOX',-320,-550,24,70,55],['MAWHET ROSET',-740,-160,22,65,50],['LUBE TONE',440,160,25,80,60],['STRUMENTI',-270,-150,14,45,40],['CLUB',-170,-500,18,65,50],['ETICHETTA',620,450,45,80,60]];
export function buildMasterplan(scene,curve){
 const g=new THREE.Group();g.name='Canair masterplan';scene.add(g);
 const grey=new THREE.MeshStandardMaterial({color:0x9db2bf,roughness:.9}),stone=new THREE.MeshStandardMaterial({color:0xc5b799,roughness:1}),rock=new THREE.MeshStandardMaterial({color:0x647560,roughness:1,side:THREE.DoubleSide}),red=new THREE.MeshStandardMaterial({color:0xb85440,roughness:.8}),road=new THREE.MeshStandardMaterial({color:0x4c606a});
 const cube=new THREE.BoxGeometry(1,1,1);
 const box=(n,x,y,z,w,d,h,m=grey)=>{const o=new THREE.Mesh(cube,m);o.name=n;o.position.set(x,z+h/2-7,-y);o.scale.set(w,h,d);g.add(o);return o;};
 box('Fondazioni città',300,0,-13,3400,2300,12,new THREE.MeshStandardMaterial({color:0x577965}));
 for(const y of [-350,-50,250])box('Strada secondaria',-50,y,-.5,2200,40,.3,road);
 for(const x of [-750,-400,0,400,750])box('Strada secondaria',x,-25,-.5,32,1650,.3,road);
 box('Piazza centrale',100,100,0,180,150,.5,stone);
 const samples=curve.getSpacedPoints(800);
 let seed=92;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const items=[];
 for(let x=-1100;x<1050;x+=85)for(let y=-830;y<850;y+=85){
  if([-350,-50,250].some(v=>Math.abs(y-v)<55)||[-750,-400,0,400,750].some(v=>Math.abs(x-v)<50))continue;
  if(samples.some(p=>Math.hypot(x-p.x,-y-p.z)<75))continue;
  if(Math.abs(x-100)<150&&Math.abs(y-100)<120)continue;
  if(landmarks.some(p=>Math.abs(x-p[1])<110&&Math.abs(y-p[2])<100))continue;
  items.push([x,y,14+rand()*48,35+rand()*14,32+rand()*17]);
 }
 const inst=new THREE.InstancedMesh(cube,grey,items.length),dummy=new THREE.Object3D();items.forEach(([x,y,h,w,d],i)=>{dummy.position.set(x,h/2-7,-y);dummy.scale.set(w,h,d);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.computeBoundingSphere();g.add(inst);
 function sign(text,x,y,h){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#132435';ctx.fillRect(0,0,512,96);ctx.fillStyle='#fff1cb';ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,64);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(60,11.25),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));o.position.set(x,h,-y);let near=samples.reduce((a,p)=>p.distanceToSquared(o.position)<a.distanceToSquared(o.position)?p:a,samples[0]);o.lookAt(near.x,h,near.z);g.add(o);}
 landmarks.forEach(([n,x,y,h,w,d])=>{box(n,x,y,0,w,d,h,red);sign(n,x,y,h+3);});
 const pos=[],ind=[],nx=61,ny=73;
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=1100+750*i/(nx-1),y=120+920*j/(ny-1);pos.push(x,utgenraHeight(x,y)-7,-y);}
 for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const k=j*nx+i;ind.push(k,k+1,k+nx+1,k,k+nx+1,k+nx);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(ind);geo.computeVertexNormals();const mountain=new THREE.Mesh(geo,rock);mountain.name='Utgenra';g.add(mountain);
 box('Belvedere',1240,490,111,120,120,4,stone);
 for(const y of [435,545])box('Parapetto',1240,y,115,120,2,2,stone);
 for(const x of [1215,1265]){box('Oremo piedistallo',x,520,115,7,7,2,stone);box('Oremo corpo',x,520,117,3,2.5,7,stone);const head=new THREE.Mesh(new THREE.SphereGeometry(1.5,12,8),stone);head.position.set(x,119,-520);g.add(head);}
 const path=[[1050,100],[1100,140],[1140,210],[1160,290],[1200,340],[1220,410],[1240,435]];
 for(let i=0;i<path.length-1;i++)for(let k=0;k<12;k++){const a=path[i],b=path[i+1];const p=t=>{const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;return new THREE.Vector3(x,utgenraHeight(x,y)-6,-y);};const v=p(k/12),w=p((k+1)/12),dir=w.clone().sub(v);const o=new THREE.Mesh(cube,stone);o.position.copy(v).add(w).multiplyScalar(.5);o.scale.set(10,1,dir.length()+.3);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir.normalize());g.add(o);}
 sign('UTGENRA',1240,490,145);
 return g;
}
