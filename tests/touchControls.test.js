import test from 'node:test';
import assert from 'node:assert/strict';
import {heldAction} from '../src/touchControls.js';
const event=id=>({pointerId:id,preventDefault(){},currentTarget:{setPointerCapture(){}}});
test('fire and boost can be held together and release independently',()=>{
 const keys={},owners={},fire=heldAction(keys,owners,'fire'),boost=heldAction(keys,owners,'boost');
 fire.onPointerDown(event(1));boost.onPointerDown(event(2));assert.deepEqual(keys,{fire:1,boost:1});
 fire.onPointerUp(event(1));assert.deepEqual(keys,{fire:0,boost:1});
 boost.onLostPointerCapture(event(2));assert.equal(keys.boost,0);
});
test('second finger and stale release cannot cancel the owning finger',()=>{
 const keys={},owners={},brake=heldAction(keys,owners,'brake');
 brake.onPointerDown(event(1));brake.onPointerDown(event(2));brake.onPointerUp(event(2));assert.equal(keys.brake,1);
 brake.onPointerCancel(event(1));assert.equal(keys.brake,0);
 brake.onPointerDown(event(3));brake.onLostPointerCapture(event(1));assert.equal(keys.brake,1);
});
