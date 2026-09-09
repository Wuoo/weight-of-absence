// A damped vertical lattice: loads exist only in the unwritten span.
// This is an authored 2D elastic model, not a paper/cloth solver.
export const W=1080,H=1920,DURATION=15,DT=1/120;
export const LETTER=[
  '今天又路过我们常去的那家花店。',
  '门口的白玫瑰，还是你喜欢的样子。',
  '我想买一束，送给　　　　。',
  '又想起，我们已经很久没有见面。',
  '回来的路上，下了一场很小的雨。',
  '我把伞往　　　　那边偏了一点。',
  '直到半边肩膀湿了，才慢慢收回来。',
  '其实也没有什么特别想说的话。',
  '只是天快凉了，想问　　　　，',
  '那件旧毛衣，你还留着吗。',
  '写到这里，又停了很久。',
  '晚安，　　　　。'
];
export const N=97,LEFT=166,RIGHT=925,TOP=604,SPACING=62;
export const smooth=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x)};
export class LetterModel{
  constructor(){this.reset()}
  reset(){this.time=0;this.rows=LETTER.map((text,r)=>({text,y:new Float64Array(N),v:new Float64Array(N),phase:r*.13,center:[.55,.54,.61,.56,.51,.47,.5,.52,.56,.52,.46,.41][r],depth:45+135*Math.sin((r+1)/13*Math.PI)}));this.touch={active:false,x:540,y:960};this.energy=0}
  step(){
    const t=this.time,dx=(RIGHT-LEFT)/(N-1);let energy=0;
    for(let r=0;r<this.rows.length;r++){
      const row=this.rows[r],old=row.y,vel=row.v;
      const reveal=smooth(1.7+r*.17,6.8+r*.17,t);
      // A smooth finite-width load is applied at the absent name.
      // Local forces propagate through neighbouring nodes; no global pose reset.
      for(let i=1;i<N-1;i++){
        const u=i/(N-1),k=2100;
        let load=0;
        for(const source of [2,5,8,11]){
          const sourceText=this.rows[source].text;
          const gap=sourceText.indexOf('　');
          const center=(gap+2)*35.5/(RIGHT-LEFT);
          const d=(u-center)/.09;
          const influence=Math.exp(-Math.abs(r-source)*.62);
          load+=540*smooth(1.7+source*.17,6.8+source*.17,t)*Math.exp(-.5*d*d)*influence;
        }
        const tension=k*(old[i-1]-2*old[i]+old[i+1]);
        const returnForce=-.74*old[i];
        const x=LEFT+i*dx,base=TOP+r*SPACING;
        const touchDist=((x-this.touch.x)/160)**2+((base+old[i]-this.touch.y)/200)**2;
        const lift=this.touch.active?-450*Math.exp(-touchDist*.5):0;
        vel[i]+=(load+tension+returnForce-2.7*vel[i]+lift)*DT;
      }
      for(let i=1;i<N-1;i++){old[i]+=vel[i]*DT;energy+=vel[i]*vel[i]}
    }
    this.energy=energy;this.time+=DT;
  }
  advance(t){if(t<this.time-DT)this.reset();while(this.time+DT/2<t)this.step()}
  sample(r,x){const row=this.rows[r],f=Math.max(0,Math.min(N-1,(x-LEFT)/(RIGHT-LEFT)*(N-1))),a=Math.floor(f),b=Math.min(N-1,a+1),u=f-a;return row.y[a]*(1-u)+row.y[b]*u}
  slope(r,x){return (this.sample(r,x+4)-this.sample(r,x-4))/8}
}
