import * as THREE from 'three';
import './style.css';
import {LetterModel,W,H,DURATION,LEFT,RIGHT,TOP,SPACING,N,smooth} from './model.js';
const params=new URLSearchParams(location.search),capture=params.has('capture');
if(capture)document.body.classList.add('capture');
await document.fonts.load('32px WenKai');
const canvas=document.querySelector('#canvas');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(capture?1:Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#f7f6f0');
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,W,0,H,-100,100);
camera.position.z=10;
const model=new LetterModel(),glyphs=[],rules=[];
const ink='#384b48',blue='#8ca9bb',red='#a35452';
function makeTexture(text,size,color,spacing=0){
  const c=document.createElement('canvas'),ctx=c.getContext('2d'),scale=3;
  ctx.font=`${size*scale}px WenKai`;const chars=[...text];
  const widths=chars.map(ch=>ctx.measureText(ch).width/scale);
  const width=Math.ceil(widths.reduce((a,b)=>a+b,0)+Math.max(0,chars.length-1)*spacing+12),height=Math.ceil(size*1.7);
  c.width=width*scale;c.height=height*scale;ctx.scale(scale,scale);ctx.font=`${size}px WenKai`;ctx.fillStyle=color;ctx.textBaseline='middle';
  let x=6;chars.forEach((ch,i)=>{ctx.fillText(ch,x,height/2);x+=widths[i]+spacing});
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  return {texture,width,height};
}
function textMesh(text,size,color,x,y,spacing=0){
  const {texture,width,height}=makeTexture(text,size,color,spacing);
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,transparent:true,depthTest:false,depthWrite:false}));
  mesh.scale.y=-1;mesh.position.set(x+width/2-6,y,2);mesh.renderOrder=3;scene.add(mesh);return mesh;
}
// Stationary paper grain. Grain does not flicker or swim between video frames.
const paper=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.ShaderMaterial({
  depthTest:false,depthWrite:false,uniforms:{},
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){vec2 px=floor(vUv*vec2(1080.,1920.));float g=(hash(px)-.5)*.012;float edge=pow(abs(vUv.x-.5)*2.,3.)*.009;vec3 col=vec3(.93,.922,.896)+g-edge;gl_FragColor=vec4(col,1.); #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`.replace('; #include',';\n #include')
}));paper.position.set(W/2,H/2,-2);paper.renderOrder=0;scene.add(paper);
textMesh('情 书 / 001',17,'#89948c',166,248,1.8);
textMesh('空白也有重量',49,ink,166,322,7);
textMesh('给',30,ink,166,497);textMesh('：',30,ink,340,497);
// Tiny incomplete address marks draw attention without adding a visible object.
function line(points,color,opacity){const g=new THREE.BufferGeometry().setFromPoints(points.map(([x,y])=>new THREE.Vector3(x,y,0)));const m=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthTest:false,depthWrite:false});const l=new THREE.Line(g,m);l.renderOrder=1;scene.add(l);return l}
line([[225,517],[320,517]],blue,.35);
for(let r=0;r<model.rows.length;r++){
  const row=model.rows[r],arr=new Float32Array(N*3);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
  const rule=new THREE.Line(geo,new THREE.LineBasicMaterial({color:blue,transparent:true,opacity:.32,depthTest:false}));rule.renderOrder=1;scene.add(rule);rules.push(rule);
  let x=LEFT;[...row.text].forEach((ch,i)=>{
    const step=35.5;
    if(ch!=='　'&&ch!==' '){const mesh=textMesh(ch,30.5,(r===11&&ch==='。')?red:ink,x,TOP+r*SPACING);glyphs.push({mesh,r,x:x+15.25,origin:x+15.25,seed:i*7+r*13})}
    x+=step;
  });
}
const sign=textMesh('没有署名的夜晚',21,'#89948c',669,1485,2);
const foot=textMesh('最重的那一处，我没有写。',27,'#6c7771',166,1652,2);
const small=textMesh('信里没有你的名字。',20,'#949d95',166,1700,1);
foot.material.opacity=0;small.material.opacity=0;
let playing=!capture,playTime=0,last=performance.now(),soundOn=false;
const audio=document.querySelector('#audio');audio.volume=.6;
function resize(){const box=canvas.getBoundingClientRect();renderer.setSize(Math.round(box.width),Math.round(box.height),false)}
addEventListener('resize',resize);resize();
function draw(){
 for(let r=0;r<rules.length;r++){const a=rules[r].geometry.attributes.position;for(let i=0;i<N;i++){const x=LEFT+(RIGHT-LEFT)*i/(N-1);a.setXYZ(i,x,TOP+r*SPACING+21+model.rows[r].y[i],0)}a.needsUpdate=true;rules[r].geometry.computeBoundingSphere()}
 for(const g of glyphs){const d=model.sample(g.r,g.origin);g.mesh.position.y=TOP+g.r*SPACING+d;g.mesh.rotation.z=Math.atan(model.slope(g.r,g.origin))*.85}
 const f=smooth(10.5,12.8,playTime);foot.material.opacity=f*.9;small.material.opacity=f*.8;
 renderer.render(scene,camera);
 document.querySelector('.progress i').style.width=`${Math.min(100,playTime/DURATION*100)}%`;
 document.querySelector('.time').textContent=`00:${String(Math.floor(playTime)).padStart(2,'0')} / 00:15`;
}
function tick(now){const elapsed=Math.min(.06,(now-last)/1000);last=now;if(playing){playTime=Math.min(DURATION,playTime+elapsed);model.advance(playTime);if(playTime>=DURATION){playing=false;document.querySelector('#pause').textContent='播放'}}draw()}
renderer.setAnimationLoop(tick);
function replay(){model.reset();playTime=0;playing=true;audio.currentTime=0;if(soundOn)audio.play().catch(()=>{});document.querySelector('#pause').textContent='暂停'}
document.querySelector('#replay').onclick=replay;
document.querySelector('#pause').onclick=()=>{if(playTime>=DURATION){replay();return}playing=!playing;document.querySelector('#pause').textContent=playing?'暂停':'播放';if(soundOn){if(playing)audio.play().catch(()=>{});else audio.pause()}};
document.querySelector('#sound').onclick=()=>{soundOn=!soundOn;document.querySelector('#sound').textContent=`声音 · ${soundOn?'开启':'关闭'}`;if(soundOn&&playing){audio.currentTime=playTime;audio.play().catch(()=>{})}else audio.pause()};
function setPointer(e){const b=canvas.getBoundingClientRect();model.touch.x=(e.clientX-b.left)/b.width*W;model.touch.y=(e.clientY-b.top)/b.height*H}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);setPointer(e);model.touch.active=true;if(playTime>=DURATION){playTime=10;model.time=10;playing=true}});
canvas.addEventListener('pointermove',e=>{if(model.touch.active)setPointer(e)});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>model.touch.active=false);
window.artwork={ready:true,seek(t){playing=false;model.advance(t);playTime=t;draw()},reset(){model.reset();playTime=0;draw()},getState(){return {time:model.time,energy:model.energy,maxSag:Math.max(...model.rows.flatMap(r=>[...r.y])),glyphCount:glyphs.length,renderer:renderer.info.render,finite:model.rows.every(r=>[...r.y,...r.v].every(Number.isFinite))}},model};
draw();document.querySelector('.loading').classList.add('done');

