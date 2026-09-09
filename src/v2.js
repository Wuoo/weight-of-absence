import * as THREE from 'three';
import './style.css';
import {LETTER,smooth} from './model.js';
const capture=new URLSearchParams(location.search).has('capture');if(capture)document.body.classList.add('capture');
await document.fonts.load('32px WenKai');
const canvas=document.querySelector('#canvas'),surface=document.createElement('canvas');surface.width=1080;surface.height=1920;const c=surface.getContext('2d');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(capture?1:Math.min(devicePixelRatio,2));
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;const tex=new THREE.CanvasTexture(surface);tex.colorSpace=THREE.SRGBColorSpace;scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:tex})));
let time=0,sim=0,angle=0,velocity=0,target=-.19,active=false,playing=!capture,last=performance.now(),sound=false;const audio=document.querySelector('#audio');audio.volume=.6;
const ink='#ffecc8',coral='#ff816f',mint='#9cd7c8';
function text(s,x,y,size=30,color=ink,alpha=1){c.globalAlpha=alpha;c.fillStyle=color;c.font=`${size}px WenKai`;c.fillText(s,x,y);c.globalAlpha=1}
function stroke(p,color,width=1,alpha=1){c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.globalAlpha=1}
function point(x,y,t){return [540+x*Math.cos(t)-y*Math.sin(t),1100+x*Math.sin(t)+y*Math.cos(t)]}
function update(dt){for(let t=0;t<dt;t+=1/120){velocity+=((target-angle)*18-velocity*5)/120;angle+=velocity/120;sim+=1/120}}
function draw(){
 const m=smooth(3.5,9,time),rain=smooth(7,10,time),tilt=angle*smooth(7,10,time);const bg=c.createLinearGradient(0,0,1080,1920);bg.addColorStop(0,'#092f39');bg.addColorStop(.65,'#124b52');bg.addColorStop(1,'#092d3b');c.fillStyle=bg;c.fillRect(0,0,1080,1920);
 text('情 书 / 001',112,174,21,mint,.8);text('空白也有重量',112,266,58);text('有些习惯，还在替你撑伞。',112,330,25,mint);
 for(let j=0;j<84;j++){const row=j/7,u=j/83,p=[];for(let i=0;i<=70;i++){const v=i/70,sx=128+824*v,sy=505+row*65+Math.sin(v*Math.PI)*65*smooth(.6,3,time);const q=point((u-.5)*760*v,-390+250*v*v+Math.sin(u*Math.PI*7)*13*v,tilt);p.push([sx*(1-m)+q[0]*m,sy*(1-m)+q[1]*m])}stroke(p,j%7===0?coral:mint,j%7===0?2:1,.12+.65*m*(j%7===0?1:.5))}
 LETTER.forEach((s,r)=>{let x=132;[...s].forEach((ch,i)=>{const f=smooth(4+r*.12,8+r*.12,time);if(ch!=='　')text(ch,x+(x-540)*f*.25,490+r*65+Math.sin(i/22*Math.PI)*65*smooth(.6,3,time)+f*(240+i%5*40),31,r===11?coral:ink,1-f);x+=35})});
 if(m>.01){let p=[];for(let i=0;i<=140;i++){const x=-380+i/140*760;p.push(point(x,-140+Math.sin((x+380)/760*Math.PI*7)*13,tilt))}stroke(p,coral,3,m);p=[];for(let i=0;i<=40;i++)p.push(point(0,-390+i/40*680,tilt));for(let i=0;i<=36;i++){const a=i/36*Math.PI;p.push(point(-37+37*Math.cos(a),290+37*Math.sin(a),tilt))}stroke(p,coral,3,m)}
 for(let i=0;i<175;i++){const x=(i*193.731%1000)+40,y=390+((i*137.19+sim*(100+i%7*14))%1050),dx=x-540,dy=y-1100,lx=dx*Math.cos(tilt)+dy*Math.sin(tilt),ly=-dx*Math.sin(tilt)+dy*Math.cos(tilt);if(Math.abs(lx)<376&&ly>-145&&ly<390)continue;stroke([[x,y],[x-3,y+16+i%11]],i%8===0?coral:mint,i%8===0?2:1,rain*(.15+i%5*.08));if(i%12===0)text('，',x,y,19,mint,rain*.6)}
 const f=smooth(9,12,time);text('我把伞往你那边偏了一点。',132,1560,34,ink,f);text('才想起，你已经不在身边。',132,1620,29,mint,f);if(!capture)text(active?'雨落在这里，伞偏向你。':'左右拖动，让伞偏向你。',132,1760,24,coral,f);
 tex.needsUpdate=true;renderer.render(scene,camera);document.querySelector('.progress i').style.width=`${Math.min(time/15,1)*100}%`;document.querySelector('.time').textContent=time<15?`00:${String(Math.floor(time)).padStart(2,'0')} / 00:15`:'雨还在下 · 可以继续互动';
}
function resize(){const b=canvas.getBoundingClientRect();renderer.setSize(b.width,b.height,false)}addEventListener('resize',resize);resize();renderer.setAnimationLoop(now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(playing){time=Math.min(15,time+dt);update(dt)}draw()});
function reset(){time=0;sim=0;angle=0;velocity=0;target=-.19;active=false}
function replay(){reset();playing=true;audio.currentTime=0;if(sound)audio.play().catch(()=>{});document.querySelector('#pause').textContent='暂停'}
document.querySelector('#replay').onclick=replay;document.querySelector('#pause').onclick=()=>{playing=!playing;document.querySelector('#pause').textContent=playing?'暂停':'播放';if(!playing)audio.pause();else if(sound)audio.play().catch(()=>{})};document.querySelector('#sound').onclick=()=>{sound=!sound;document.querySelector('#sound').textContent=`声音 · ${sound?'开启':'关闭'}`;if(sound){audio.currentTime=Math.min(time,14);audio.play().catch(()=>{})}else audio.pause()};
function pointer(e){const b=canvas.getBoundingClientRect();target=Math.max(-.42,Math.min(.42,((e.clientX-b.left)/b.width-.5)*.9))}canvas.addEventListener('pointerdown',e=>{active=true;canvas.setPointerCapture(e.pointerId);pointer(e);playing=true});canvas.addEventListener('pointermove',e=>{if(active)pointer(e)});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{active=false;target=-.19});
window.artwork={ready:true,seek(t){playing=false;reset();time=t;for(let i=0;i<Math.round(t*120);i++)update(1/120);draw()},reset(){reset();draw()},getState(){return {time,angle,target,finite:Number.isFinite(angle),phase:time<3.5?'letter':time<9?'canopy':'rain'}}};draw();document.querySelector('.loading').classList.add('done');
