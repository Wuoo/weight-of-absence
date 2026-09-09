import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5187/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.artwork?.ready);
await page.evaluate(()=>window.artwork.seek(15));const before=await page.evaluate(()=>window.artwork.getState());
const rect=await page.locator('canvas').boundingBox();await page.mouse.move(rect.x+rect.width*.9,rect.y+rect.height*.6);await page.mouse.down();await page.waitForTimeout(3500);const held=await page.evaluate(()=>window.artwork.getState());console.log({before,held,rect});assert(held.angle>before.angle+.15,'drag changes angle');await page.mouse.up();await page.waitForTimeout(3500);const released=await page.evaluate(()=>window.artwork.getState());assert(released.angle<held.angle,'release returns');assert(released.time===15,'interaction persists after film');
await page.getByRole('button',{name:'重新播放',exact:true}).click();await page.waitForTimeout(300);assert((await page.evaluate(()=>window.artwork.getState())).time<2,'replay resets');assert.equal(errors.length,0);console.log(JSON.stringify({passed:true,before,held,released,errors}));await browser.close();

