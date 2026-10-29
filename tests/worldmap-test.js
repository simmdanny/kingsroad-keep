(function(){
/* The world map, redrawn (v429): one natural island with a winding coast, a territory per land, mountain ranges, rivers to the sea,
   lakes, and roads that wind between the keeps and stay on land.
   Run on the dev page: __kk.ev(await (await fetch('/tests/worldmap-test.js')).text()) returns [name, ok, detail] rows. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);
try{
  const KEYS=Object.keys(WMP.sites),land=(u,v)=>wm2F(u,v)>0,W=1000,H=1400;
  {let err=null,dt=0;try{WMP.cv=null;const t=performance.now();wmpPaint();dt=performance.now()-t;}catch(e){err=e.message;}
   ok('the new map paints',!err&&wmpPaint===wm2Paint&&WMP.cv&&WMP.cv.width===1000&&WMP.cv.height===1400,err);
   ok('and paints quickly (under 3 s)',dt<3000,dt.toFixed(0)+' ms');}
  ok('six lands, six keeps',KEYS.length===6&&['plains','snow','tundra','taiga','whitewaste','highlands'].every(k=>WMP.sites[k]),KEYS.join(','));
  /* the island: keeps on land, the frame all sea, land a fair share of the page */
  {const off=KEYS.filter(k=>{const S=WMP.sites[k];return wm2F(S.u,S.v)<.15;});ok('every keep stands well inside the land',!off.length,off.join(','));}
  {let edge=0;for(let i=0;i<=100;i++){const t=i/100;for(const[u,v]of[[t,.005],[t,.995],[.005,t],[.995,t]])if(land(u,v))edge++;}ok('the island is surrounded by sea (nothing touches the frame)',!edge,edge);}
  const N=200,M=280,g=new Uint8Array(N*M);for(let j=0;j<M;j++)for(let i=0;i<N;i++)g[j*N+i]=land((i+.5)/N,(j+.5)/M)?1:0;
  {let n=0;for(const x of g)n+=x;const f=n/g.length;ok('land is a fair share of the page',f>.3&&f<.7,(f*100).toFixed(0)+'%');}
  /* one mainland that holds every keep; the coast winds (much longer than a circle of the same area) */
  {const seen=new Uint8Array(N*M),S=WMP.sites.plains,st=[Math.floor(S.v*M)*N+Math.floor(S.u*N)];seen[st[0]]=1;let area=0;
   while(st.length){const c=st.pop();area++;const i=c%N,j=(c/N)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=i+a,y=j+b;if(x<0||y<0||x>=N||y>=M)continue;const o=y*N+x;if(g[o]&&!seen[o]){seen[o]=1;st.push(o);}}}
   const lost=KEYS.filter(k=>{const s=WMP.sites[k];return !seen[Math.floor(s.v*M)*N+Math.floor(s.u*N)];});ok('one mainland holds every keep',!lost.length,lost.join(','));
   let per=0;for(let j=0;j<M;j++)for(let i=0;i<N;i++){if(!seen[j*N+i])continue;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=i+a,y=j+b;if(x<0||y<0||x>=N||y>=M||!seen[y*N+x])per++;}}
   const r=per/(2*Math.sqrt(Math.PI*area))/(4/Math.PI);ok('the coast winds (bays and capes, not a plain oval)',r>1.15,r.toFixed(2));
   let isl=0;for(let o=0;o<g.length;o++)if(g[o]&&!seen[o])isl++;ok('with an isle or two offshore',isl>20,isl);}
  /* territories */
  {const bad=KEYS.filter(k=>{const S=WMP.sites[k];return wmpTop(S.u,S.v)!==S.b;});ok('each keep stands in its own territory',!bad.length,bad.join(','));
   let cnt={};for(let j=0;j<60;j++)for(let i=0;i<40;i++){const u=(i+.5)/40,v=(j+.5)/60;if(!land(u,v))continue;const t=wmpTop(u,v);cnt[t]=(cnt[t]||0)+1;}
   ok('and every territory has room of its own',KEYS.every(k=>(cnt[WMP.sites[k].b]||0)>60),JSON.stringify(cnt));}
  /* mountains: the Highlands are the mountain country, the Plains are not */
  {const HG=wm2Height(),m=k=>{let s=0,n=0;for(let i=0;i<400;i++){const u=Math.random(),v=Math.random();if(!land(u,v)||wmpTop(u,v)!==WMP.sites[k].b)continue;s+=wm2Hs(HG.M,u,v);n++;}return s/Math.max(1,n);};
   const hm=m('highlands'),pm=m('plains');ok('the Highlands are mountain country, the Plains are open',hm>.4&&pm<.2&&hm>pm*3,hm.toFixed(2)+' vs '+pm.toFixed(2));}
  /* rivers run from the land down to the sea */
  {const R=WMP.rivers||[];const bad=R.filter(P=>{const a=P[0],b=P[P.length-1];return !(wm2F(a[0]/W,a[1]/H)>.05&&wm2F(b[0]/W,b[1]/H)<.03);});
   ok('rivers rise inland and run down to the sea',R.length>=4&&!bad.length,R.length+' rivers, '+bad.length+' bad');}
  /* roads: every keep reachable from the Plains, they wind, and they stay on land */
  {const bad=KEYS.filter(k=>k!=='plains'&&!(Array.isArray(wmpVia('plains',k))&&wmpVia('plains',k).length>4));ok('a road leads from the Plains to every keep',!bad.length,bad.join(','));
   let wet=0,n=0,wind=[];for(const k in WMP.paths){const P=WMP.paths[k];for(const p of P){n++;if(wm2F(p.x/W,p.y/H)<-.02)wet++;}
     let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y);const D=Math.hypot(P[P.length-1].x-P[0].x,P[P.length-1].y-P[0].y);wind.push(L/D);}
   ok('roads keep to the land',wet<=n*.01,wet+' of '+n+' points in the sea');
   ok('and wind instead of running straight',wind.every(w=>w>1.005)&&wind.reduce((a,b)=>a+b,0)/wind.length>1.04,wind.map(w=>w.toFixed(2)).join(' '));}
  /* the world map screen itself opens over the new drawing, keeps on their sites */
  {let err=null;try{openWorldMap(false);}catch(e){err=e.message;}const el=wmapEl(),b=el.querySelectorAll('button,[data-k],[data-site]').length;
   ok('the world map screen opens over it',!err&&el.classList.contains('on'),err||b);try{closeWorldMap();}catch(e){}}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v429'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
return out;})()
