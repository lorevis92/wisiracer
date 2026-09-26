// One owner per held action. Other fingers can hold different actions concurrently.
export function heldAction(keys,owners,key){
 const release=e=>{if(owners[key]!==e.pointerId)return;delete owners[key];keys[key]=0;};
 return {
  onPointerDown:e=>{
   e.preventDefault();if(owners[key]!==undefined)return;
   e.currentTarget.setPointerCapture(e.pointerId);owners[key]=e.pointerId;keys[key]=1;
  },
  onPointerUp:release,onPointerCancel:release,onLostPointerCapture:release,
  onContextMenu:e=>e.preventDefault(),
 };
}
