(async function(){
/* v475 (the Secret scrolls are rarity 'unique' in the code): recorded previews for the Mythic, Ancient and Secret masteries. Run on the dev page:
   await __kk.ev(await (await fetch('/tests/mpv-test.js')).text()) returns [name, ok, detail] rows.
   Every Mythic, Ancient and Secret scroll with masteries (23) has a recorded clip for no mastery and each of its 5 masteries in
   previews/ (made by tools/previews/record.js on the stages in tools/previews/scenarios.js), so its mastery card plays the clip instead of
   starting the live preview; each clip with a mastery says what its stage sets up. */
const out=[],ok=(n,c,d)=>out.push([n,!!c,d===undefined?'':String(d)]);
try{
  PVC.man=null;PVC.load=null;pvcMan();if(PVC.load)await PVC.load;const M=PVC.man;
  ok('the clip list is there',!!(M&&M.clips),M&&Object.keys(M.clips).length);
  const HI=SCROLL_IDS.filter(k=>['mythic','ancient','unique'].includes(SPELLS_S[k].r)&&SM_D[k]&&SM_D[k].length===5);
  const by=r=>HI.filter(k=>SPELLS_S[k].r===r).length;
  ok('23 Mythic, Ancient and Secret scrolls have masteries (8 Mythic, 7 Ancient, 8 Secret)',HI.length===23&&by('mythic')===8&&by('ancient')===7&&by('unique')===8,HI.length+': '+by('mythic')+'/'+by('ancient')+'/'+by('unique'));
  {const miss=[];for(const k of HI)for(let L=0;L<=5;L++)if(!pvcHas(k,L))miss.push(k+'-'+L);
   ok('every one has a clip for no mastery and each of its 5 masteries (138 clips)',!miss.length,miss.slice(0,10).join(' '));}
  {const gone=[];await Promise.all(HI.flatMap(k=>[0,1,2,3,4,5].map(async L=>{const id=k+'-'+L,r=await fetch('../previews/'+id+'.mp4',{method:'HEAD'});if(!r.ok)gone.push(id);})));
   ok('and every clip file exists',!gone.length,gone.slice(0,10).join(' '));}
  {const bad=[];for(const k of HI)for(let L=0;L<=5;L++){const c=M.clips[k+'-'+L];if(!c||!(c.len>=3&&c.len<=17)||!(c.bytes>1e5))bad.push(k+'-'+L+' '+(c&&c.len));}
   ok('each clip is 3 to 17 seconds long and not empty',!bad.length,bad.slice(0,8).join(' '));}
  {const bad=[];for(const k of HI)for(let L=1;L<=5;L++){const c=M.clips[k+'-'+L];if(!c||!c.note||c.note.length<20)bad.push(k+'-'+L);}
   ok('each mastery clip says what its stage sets up',!bad.length,bad.slice(0,8).join(' '));}
  /* the clips logged their mastery's moment when they were recorded: a clip of a mastery logs events, the clip without mastery none */
  {const bad=[];for(const k of HI){if(M.clips[k+'-0']&&M.clips[k+'-0'].ev&&Object.keys(M.clips[k+'-0'].ev).some(e=>!['cast','opts'].includes(e)))bad.push(k+'-0');
     for(let L=1;L<=5;L++){const c=M.clips[k+'-'+L];if(!c||!c.ev||!Object.keys(c.ev).some(e=>!['cast','opts'].includes(e)))bad.push(k+'-'+L);}}
   ok('every mastery clip logged its mastery at work, and no clip without one did',!bad.length,bad.slice(0,8).join(' '));}
  ok('the changelog tells of it',CLOG.some(c=>c.v==='v475'));
}catch(e){out.push(['ERROR',false,String(e&&e.stack||e).slice(0,600)]);}
return out;})()
