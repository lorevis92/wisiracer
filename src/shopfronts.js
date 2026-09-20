import * as THREE from 'three';
export const SHOP_LABELS=['CAFFÈ','LIBRI','FIORI','ATELIER','MERCATO','MUSICA'];
export function shopMaterials(){
 const colors=[0x436451,0x345c77,0x7b4760,0x9a663d,0x657437,0x4e526f];
 const trims=colors.map(color=>new THREE.MeshStandardMaterial({color,roughness:.7}));
 const signs=SHOP_LABELS.map((text,i)=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#'+colors[i].toString(16).padStart(6,'0');ctx.fillRect(0,0,512,128);ctx.fillStyle='#f7ead3';ctx.font='500 52px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,67);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({map,roughness:.75});
 });
 return {trims,signs,glass:new THREE.MeshStandardMaterial({color:0xd6ded9,roughness:.12,metalness:.08,transparent:true,opacity:.18,depthWrite:false}),
  cream:new THREE.MeshStandardMaterial({color:0xe4cfa9,roughness:.75}),
  fruit:[0xd29534,0xa33e3e,0x719846].map(color=>new THREE.MeshStandardMaterial({color,roughness:.8}))};
}
// Shallow modeled display rooms: the building's recessed core forms their back wall.
export function shopfront(F,u,bay,kind,m){
 const s=m.shops,trim=s.trims[kind],width=bay-.65;
 F(m.wood,u,2.9,-1.23,width,5.6,.08);
 F(m.stone,u,.45,-.65,width,.16,1.2);
 F(s.glass,u,3.2,-.14,width,5.3,.025);
 F(trim,u,5.85,.06,width+.2,.82,.22);
 F(s.signs[kind],u,5.87,.19,width*.88,.66,.025);
 F(trim,u-width/2,3.1,.04,.15,5.6,.26);
 F(trim,u+width/2,3.1,.04,.15,5.6,.26);
 // Door bay at one side, with threshold, jamb and pull handle.
 const door=u+width*.31;
 F(trim,door-width*.15,2.8,-.06,.09,4.7,.18);
 F(m.stone,door,.33,.18,width*.28,.12,.75);
 F(m.frames[1],door-width*.1,2.6,.08,.045,.65,.08);
 const display=u-width*.16,dw=width*.55;
 F(m.warm,display,5.31,-.3,dw,.065,.08);
 if(kind===0){
  F(m.wood,display,1.7,-.7,dw,.2,.75);
  F(m.frames[3],display-dw*.22,2.1,-.88,.75,.6,.45);
  for(let i=0;i<4;i++)F(s.cream,display-dw*.3+i*dw*.19,1.93,-.4,.17,.27,.15);
  F(trim,display,3.7,-1.1,dw*.65,1.3,.07);
  for(let i=0;i<3;i++)F(s.cream,display,4-i*.28,-1.04,dw*.46,.035,.03);
 }else if(kind===1){
  for(const yy of [1.3,2.5,3.7]){
   F(m.wood,display,yy,-.65,dw,.12,.8);
   for(let i=0;i<8;i++)F(s.trims[(i+Math.floor(yy))%6],display-dw*.44+i*dw*.12,yy+.4,-.53,dw*.085,.45+(i%3)*.17,.23);
  }
 }else if(kind===2){
  for(let i=0;i<5;i++){
   const px=display-dw*.4+i*dw*.2,base=1+(i%2)*.5;
   F(m.stone,px,base,-.64,.35,.6,.4);
   F(m.green,px,base+.6,-.65,.08,.7,.08);
   for(const dx of [-.17,0,.17])F(s.fruit[(i+1)%3],px+dx,base+1,-.66,.22,.22,.22);
  }
 }else if(kind===3){
  for(const dx of [-dw*.25,dw*.25]){
   F(m.wood,display+dx,2.5,-.9,.9,2.6,.13);
   F(s.cream,display+dx,3.1,-.77,1.1,1.4,.06);
   F(s.trims[dx<0?1:2],display+dx,3.1,-.72,.7,.9,.035);
  }
 }else if(kind===4){
  for(const yy of [1.3,2.3])for(let i=0;i<3;i++){
   const px=display-dw*.32+i*dw*.32;
   F(m.wood,px,yy,-.65,dw*.28,.35,.7);
   for(let n=0;n<3;n++)F(s.fruit[i],px+(n-1)*dw*.075,yy+.26,-.43,.18,.2,.18);
  }
 }else{
  for(const dx of [-dw*.3,dw*.3]){
   F(s.trims[3],display+dx,2.3,-.64,.63,.8,.18);
   F(s.trims[3],display+dx,2.83,-.64,.46,.5,.18);
   F(m.frames[3],display+dx,3.65,-.64,.12,1.2,.13);
   F(s.cream,display+dx,3.3,-.54,.025,2.1,.015);
  }
  F(m.frames[3],display,1,-.8,.6,.9,.4);
 }
}
