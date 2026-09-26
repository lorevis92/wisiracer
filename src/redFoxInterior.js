import * as THREE from 'three';

// Real geometry shared by the racing scene and the close-up viewer.
export function buildRedFoxInterior(parent) {
 const room=new THREE.Group();room.name='Red Fox furnished pub';parent.add(room);
 const material=(color,roughness=.7,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const oak=material(0x745039),oakLight=material(0x896244),oakDark=material(0x53392b);
 const leather=material(0x65332d,.55),paint=material(0x384940),cream=material(0xd6c4a0);
 const brass=material(0xb99559,.32,{metalness:.72}),black=material(0x191d1c);
 const amber=material(0x805022,.24),green=material(0x294e37,.26);
 const ceramic=material(0xe2d6b9,.3);
 const bulb=material(0xffddb0,.3,{emissive:0xffba69,emissiveIntensity:2});
 const batches=new Map(),geometries={box:new THREE.BoxGeometry(1,1,1),round:new THREE.CylinderGeometry(.5,.5,1,12)};
 function item(shape,mat,x,y,z,w,h,d,ry=0){
  const key=shape+':'+mat.uuid;
  if(!batches.has(key))batches.set(key,{shape,mat,items:[]});
  batches.get(key).items.push({x,y,z,w,h,d,ry});
 }
 const box=(...v)=>item('box',...v),round=(...v)=>item('round',...v);
 // Ground-floor ceiling, beams and individual floorboards.
 box(cream,0,5.5,0,26.4,.22,16.4);
 for(const x of [-10,-5,0,5,10])box(oakDark,x,5.28,0,.2,.25,16.3);
 for(let row=0;row<32;row++)for(let col=0;col<9;col++){
  const x=-13.15+col*3, width=Math.min(2.96,13.15-x);
  if(width>0)box([oak,oakLight,oakDark][(row*7+col*11)%3],x+width/2,.265,-7.9+row*.5,width,.05,.48);
 }
 // Wainscoting, rails and inset panels behind the bar and along both sides.
 box(paint,0,2.8,-8.12,26.3,5,.08);
 for(const x of [-13.12,13.12]){
  box(paint,x,2.8,0,.08,5,16.3);box(oakDark,x,1.05,0,.16,1.5,16.3);
  box(brass,x,1.83,0,.19,.055,16.3);
  for(let z=-7.5;z<8;z+=1.2)box(oakLight,x,1.04,z,.2,1.3,.055);
 }
 // Counter leaves a staff aisle at the back and a central approach from the door.
 box(oakDark,0,1.05,-3.9,20,1.5,1.5);box(oak,0,1.86,-3.9,20.5,.18,1.85);
 box(brass,0,.59,-2.82,19,.07,.07);
 for(let x=-9;x<=9;x+=1.5){box(oakLight,x,1.08,-3.12,1.28,1.1,.07);box(oakDark,x,1.08,-3.06,1.08,.9,.055);}
 for(const x of [-8,-5.4,-2.8,2.8,5.4,8]){
  round(black,x,.36,-1.9,.68,.13,.68);round(brass,x,.79,-1.9,.12,.8,.12);
  round(leather,x,1.24,-1.9,.75,.18,.75);round(brass,x,.65,-1.9,.43,.055,.43);
 }
 // Backbar cabinetry, shaped bottles with shoulders, necks and cream labels.
 box(oakDark,0,1.1,-7.5,23,1.6,1);
 for(const y of [2.05,2.95,3.85]){
  box(oak,0,y,-7.55,23,.13,1.05);
  box(bulb,0,y-.09,-7.06,22.7,.025,.035);
  for(let i=0;i<35;i++){
   const x=-10.9+i*.64,h=.34+(i%4)*.06,m=i%3?green:amber;
   round(m,x,y+.08+h/2,-7.45,.2,h,.2);
   round(m,x,y+.08+h+.075,-7.45,.085,.15,.085);
   round(brass,x,y+.08+h+.16,-7.45,.09,.035,.09);
   box(ceramic,x,y+.08+h*.48,-7.342,.13,.14,.018);
  }
 }
 for(const x of [-11.5,-5.8,0,5.8,11.5])box(oakDark,x,3,-7.5,.13,3,1);
 // Beer taps, drip tray, register and stacked cups.
 for(const x of [-2,0,2]){
  round(brass,x,2.18,-3.85,.12,.5,.12);box(brass,x,2.4,-3.62,.12,.12,.48);
  round(black,x,2.61,-3.49,.1,.32,.1);box(black,x,1.97,-3.3,.8,.05,.5);
 }
 box(black,7.9,2.09,-3.9,.7,.3,.55);box(paint,7.9,2.36,-3.94,.65,.27,.08);
 for(let i=0;i<5;i++)round(ceramic,5+i*.28,2.12,-3.75,.18,.3,.18);
 // Window tables, proper chair frames, upholstered booths and table settings.
 function table(x,z){
  box(oak,x,1.28,z,2.4,.14,1.65);
  for(const dx of [-.94,.94])for(const dz of [-.57,.57])box(oakDark,x+dx,.76,z+dz,.1,.94,.1);
  for(const dx of [-.65,.65]){
   round(ceramic,x+dx,1.365,z,.37,.025,.37);
   round(amber,x+dx,1.49,z-.46,.15,.26,.15);
   box(ceramic,x+dx+.3,1.365,z,.13,.025,.3);
  }
  round(brass,x,1.43,z,.2,.19,.2);round(bulb,x,1.54,z,.095,.065,.095);
 }
 function chair(x,z,facing){
  box(leather,x,.76,z,.72,.14,.72);
  for(const dx of [-.27,.27])for(const dz of [-.27,.27])box(oakDark,x+dx,.48,z+dz,.07,.43,.07);
  box(oakDark,x,1.1,z+facing*.31,.74,.74,.1);
  box(leather,x,1.15,z+facing*.24,.6,.43,.08);
 }
 for(const x of [-9.7,-5,5,9.7]){
  table(x,5.5);chair(x-.6,6.9,1);chair(x+.6,6.9,1);
  box(oakDark,x,.55,3.95,2.65,.5,.8);box(leather,x,.87,3.95,2.6,.17,.8);
  box(leather,x,1.25,3.57,2.65,.92,.17);
  for(const dx of [-1.3,1.3])box(oakDark,x+dx,1.02,3.95,.12,.5,.85);
 }
 // Pendant fixtures visibly emit light; two bounded non-shadow lights light the room.
 for(const x of [-9,-4.5,4.5,9])for(const z of [-3.9,5.5]){
  round(brass,x,4.92,z,.035,.65,.035);round(paint,x,4.5,z,.85,.22,.85);
  round(bulb,x,4.36,z,.62,.06,.62);
 }
 for(const x of [-6.5,6.5]){
  const light=new THREE.PointLight(0xffcb8e,65,12,2);light.position.set(x,3.9,1.6);room.add(light);
 }
 // Menu panel and brass clock are readable modeled fixtures, not facade photos.
 box(oak,11.85,3.05,-8,1.75,1.95,.13);box(black,11.85,3.05,-7.91,1.5,1.7,.05);
 for(let i=0;i<6;i++)box(ceramic,11.72,3.62-i*.23,-7.87,i===0?1:.7,.025,.02);
 const clock=new THREE.Mesh(new THREE.CircleGeometry(.52,24),ceramic);clock.position.set(0,4.73,-8);room.add(clock);
 box(black,0,4.89,-7.98,.025,.3,.02);box(black,.12,4.73,-7.97,.25,.025,.02);
 const dummy=new THREE.Object3D();
 for(const {shape,mat,items} of batches.values()){
  const mesh=new THREE.InstancedMesh(geometries[shape],mat,items.length);mesh.name='Red Fox interior furnishings';
  items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(0,v.ry,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
  mesh.castShadow=mat!==bulb;mesh.receiveShadow=true;mesh.computeBoundingSphere();room.add(mesh);
 }
 return room;
}
