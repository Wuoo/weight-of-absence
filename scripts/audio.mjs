// Original five-note miniature. Additive synthesis; no sampled recordings.
import fs from 'node:fs';
const sr=48000,duration=15,n=sr*duration,left=new Float64Array(n),right=new Float64Array(n);
const notes=[[.6,57,.105],[3.3,64,.068],[6.0,69,.078],[8.8,71,.052],[11.0,64,.064]];
for(const [start,midi,amp] of notes){const f=440*2**((midi-69)/12);for(let i=Math.floor(start*sr);i<n;i++){const t=i/sr-start,env=(1-Math.exp(-t*35))*Math.exp(-t/2.5);let s=0;for(let h=1;h<=6;h++)s+=Math.sin(2*Math.PI*f*h*t+Math.sin(t*1.4)*.002)*Math.exp(-t*h*.19)/h**2.4;s*=amp*env;left[i]+=s;right[i]+=s*.94}}
for(let i=0;i<n;i++){for(const [delay,gain] of [[.173,.16],[.293,.12],[.431,.08],[.683,.055]]){const j=i-Math.round(delay*sr);if(j>=0){left[i]+=right[j]*gain*.22;right[i]+=left[j]*gain*.20}}const fade=Math.min(1,i/(sr*.35),(n-i)/(sr*1.8));left[i]*=fade;right[i]*=fade}
const data=Buffer.alloc(n*4),header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+data.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(sr,24);header.writeUInt32LE(sr*4,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(data.length,40);
for(let i=0;i<n;i++){data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,left[i]))*32767),i*4);data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,right[i]))*32767),i*4+2)}
fs.writeFileSync('public/soundtrack.wav',Buffer.concat([header,data]));console.log('Original soundtrack: 15s, stereo 48kHz');
