import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
const full=process.argv.includes('--video');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-background-timer-throttling','--hide-scrollbars','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://127.0.0.1:5187/?capture',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.artwork?.ready);
await fs.mkdir('qa',{recursive:true});await fs.mkdir('delivery',{recursive:true});
for(const t of [0,3,6,9,12,15]){await page.evaluate(t=>window.artwork.seek(t),t);await page.screenshot({path:`qa/frame-${t}.png`})}
const state=await page.evaluate(()=>window.artwork.getState());
await fs.writeFile('qa/browser.json',JSON.stringify({errors,state},null,2));
if(errors.length)throw new Error(errors.join('\n'));
if(full){
 await page.evaluate(()=>window.artwork.reset());
 const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','png','-framerate','30','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart','delivery/weight-of-absence-silent.mp4'],{stdio:['pipe','inherit','inherit']});
 const completed=new Promise((resolve,reject)=>{ff.on('close',c=>c===0?resolve():reject(new Error(`ffmpeg exit ${c}`)));ff.on('error',reject)});
 for(let i=0;i<450;i++){
  await page.evaluate(t=>window.artwork.seek(t),i/30);
  const png=Buffer.from(await page.evaluate(()=>document.querySelector('canvas').toDataURL('image/png').split(',')[1]),'base64');
  if(!ff.stdin.write(png))await new Promise(resolve=>ff.stdin.once('drain',resolve));
  if(i%60===0)console.log(`Rendered ${i}/450`);
 }
 ff.stdin.end();await completed;
}
await page.goto('http://127.0.0.1:5187/',{waitUntil:'networkidle'});await page.setViewportSize({width:1440,height:1000});await page.waitForFunction(()=>window.artwork?.ready);await page.evaluate(()=>window.artwork.seek(12));await page.screenshot({path:'qa/web-desktop.png'});
await page.getByRole('button',{name:'重新播放',exact:true}).click();await page.waitForTimeout(300);
const replayTime=await page.evaluate(()=>window.artwork.getState().time);if(replayTime>2)throw new Error('Replay failed');
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.artwork.seek(12));await page.screenshot({path:'qa/web-mobile.png'});
console.log(JSON.stringify({errors,state,replayTime}));await browser.close();
