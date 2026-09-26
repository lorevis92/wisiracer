// Recognize translation gestures, not absolute phone height. Both sensor vectors
// are required: estimating gravity from raw acceleration would confuse steering
// rotations with vertical movement. DeviceMotion uses m/s² and timestamps in ms.
const vector = v => v && [v.x,v.y,v.z].every(Number.isFinite);
export function verticalAcceleration(event) {
  const a=event.acceleration, total=event.accelerationIncludingGravity;
  if(!vector(a)||!vector(total))return null;
  const g=[total.x-a.x,total.y-a.y,total.z-a.z];
  const length=Math.hypot(...g);
  if(length<7||length>12)return null;
  return (a.x*g[0]+a.y*g[1]+a.z*g[2])/length;
}
export function createAltitudeGesture() {
  let last=null,quiet=0,armed=false,candidate=0,duration=0,lockedUntil=0;
  return {
    reset(){last=null;quiet=0;armed=false;candidate=0;duration=0;lockedUntil=0;},
    sample(value,now){
      if(!Number.isFinite(value)||!Number.isFinite(now)){this.reset();return 0;}
      if(last===null||now-last>250||now<=last){this.reset();last=now;return 0;}
      const dt=now-last;last=now;
      if(Math.abs(value)<.55)quiet+=dt;else quiet=0;
      // Rearm only after stopping: the braking half of a gesture is not a
      // command in the opposite direction. Initial pickup is ignored as well.
      if(!armed){if(now>=lockedUntil&&quiet>=300)armed=true;return 0;}
      const sign=Math.abs(value)>=1.3?Math.sign(value):0;
      if(sign===0){candidate=0;duration=0;return 0;}
      if(sign!==candidate){candidate=sign;duration=0;}
      duration+=dt;
      if(duration<45)return 0;
      armed=false;quiet=0;candidate=0;duration=0;lockedUntil=now+650;
      return sign;
    }
  };
}
export function gestureCommand(keys,now) {
  return now<keys.motionUntil?(keys.motionLift||0):0;
}
