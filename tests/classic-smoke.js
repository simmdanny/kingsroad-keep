(function(){
/* Kingsroad Keep smoke test: the classic board starts, towers can be placed, a wave runs to the end, nothing throws, saves land in the kingsroad.* keys. Run via __kk.ev on the dev build. */
const o=[];
try{
o.push('GAME='+GAME.id+' world='+meta.world+' OW.on='+OW.on+' board='+W+'x'+H);
newGame(1);o.push('state='+state+' wave='+wave);
let placed=0;for(let r=0;r<H&&placed<8;r++)for(let c=0;c<W&&placed<8;c++){placing={type:'archer'};if(grid[r][c]===0&&placeValid(c,r)&&gold>=TD.archer.cost){if(placeTower('archer',c,r,{}))placed++;}}placing=null;
o.push('towers placed='+placed);
callWave();let errs=0,maxAlive=0,t=0;
for(let i=0;i<9000;i++){try{update(.05);updFx(.05);}catch(e){errs++;if(errs<3)o.push('ERR '+e.message+' '+(e.stack||'').slice(0,200));break;}t+=.05;maxAlive=Math.max(maxAlive,enemies.length);if(i>200&&!enemies.length&&!spawners.length)break;}
o.push('simulated '+t.toFixed(0)+'s maxAlive='+maxAlive+' kills='+kills+' lives='+lives+' errs='+errs);
saveRun();const r=JSON.parse(localStorage.getItem('kingsroad.run'));o.push('saved run mode='+r.mode+' wave='+r.wave+' keys='+Object.keys(localStorage).sort().join(','));
}catch(e){o.push('ERR '+e.message+' '+(e.stack||'').slice(0,300));}
return o.join('\n');})()
