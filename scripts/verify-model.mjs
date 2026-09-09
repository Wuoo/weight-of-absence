import assert from 'node:assert/strict';
import {LetterModel,DT} from '../src/model.js';
const m=new LetterModel();m.advance(1.5);
assert.equal(Math.max(...m.rows[5].y),0,'letter starts at rest');
m.advance(15);const state=m.rows.map(r=>[...r.y]);
assert(m.rows.every(r=>[...r.y,...r.v].every(Number.isFinite)),'finite simulation');
assert(m.rows.every(r=>r.y[0]===0&&r.y.at(-1)===0),'anchored margins');
assert(Math.max(...state.flat())>30,'visible load response');
assert(Math.max(...state.flat())<250,'bounded deformation');
m.advance(0);m.advance(15);assert.deepEqual(m.rows.map(r=>[...r.y]),state,'deterministic replay');
const normal=new LetterModel(),touch=new LetterModel();normal.advance(8);touch.advance(8);touch.touch={active:true,x:550,y:1050};
for(let i=0;i<120;i++){normal.step();touch.step()}
assert(touch.rows[5].y[48]<normal.rows[5].y[48],'touch lifts local letters');
touch.touch.active=false;for(let i=0;i<1200;i++)touch.step();
assert(touch.rows.every(r=>[...r.y,...r.v].every(Number.isFinite)),'release remains stable');
console.log(JSON.stringify({passed:true,maxSag:Math.max(...state.flat()),fixedStep:DT,tests:['rest','finite','anchors','amplitude','replay','touch','release']},null,2));
