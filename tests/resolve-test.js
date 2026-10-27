(function(){
/* Resolve test: the shared lock budget caps how long one foe can be stunned / pushed back.
   Run via __kk.ev on the dev build (src/kingsroad-keep.html) while a game is running: __kk.ev(await (await fetch('/tests/resolve-test.js')).text()) */
const o=[],ok=(c,m)=>o.push((c?'PASS ':'FAIL ')+m);
try{
if(state!=='playing')newGame(1);paused=true;
const mk=(type,boss)=>{spawnEnemy({type},5);const e=enemies[enemies.length-1];if(boss)e.boss=true;e.dist=2;return e;};
const clear=()=>{for(const e of enemies)removeEnemy(e);enemies=[];};
// 1. a regular foe stunned every 0.5 s for 1.6 s: locked about cap/(cap+imm) of the time
clear();let e=mk('soldier'),lock=0,T=0,dt=1/30,next=0;
for(let i=0;i<30/dt;i++){if(T>=next){stunE(e,1.6);next+=.5;}if(e.stunT>0)lock+=dt;moveEnemy(e,dt);if(e.dist>10)e.dist=2;T+=dt;}
const fr=lock/T;ok(fr>.28&&fr<.4,'regular foe under constant stuns is locked '+(fr*100).toFixed(0)+'% of the time (expected ~33%)');
// 2. a boss: about capB/(capB+immB)
clear();e=mk('ogre',true);lock=0;T=0;next=0;
for(let i=0;i<40/dt;i++){if(T>=next){stunE(e,1);next+=.5;}if(e.stunT>0)lock+=dt;moveEnemy(e,dt);if(e.dist>10)e.dist=2;T+=dt;}
const fb=lock/T;ok(fb>.04&&fb<.11,'boss under constant stuns is locked '+(fb*100).toFixed(0)+'% of the time (expected ~7%)');
// 3. push-back costs distance/speed seconds: a 10-unit push on a speed-1 foe only moves it back 2
clear();e=mk('soldier');e.spd=1;e.dist=12;const u=pushE(e,10);ok(Math.abs(u-2)<.01,'10-unit push gave '+u.toFixed(2)+' (expected 2.00)');
ok(e.unstopT>0,'the push used the whole budget, so the foe is Unstoppable ('+(e.unstopT||0).toFixed(1)+'s)');
ok(pushE(e,1)===0&&stunE(e,1)===0,'an Unstoppable foe ignores pushes and stuns');
e.slow=.5;e.slowT=1;moveEnemy(e,.1);ok(e.slowT>0&&e.slow===.5,'slows still apply while Unstoppable');
// 4. great spells (raw e.stunT) still work on an Unstoppable foe and do not spend the budget
const r0=e.rsv;e.stunT=1.5;const d0=e.dist;moveEnemy(e,.5);ok(e.dist===d0&&e.rsv===r0,'a raw stun from a great spell still holds an Unstoppable foe');
// 5. overlapping stuns only charge the extra time
clear();e=mk('soldier');stunE(e,1);stunE(e,.6);ok(Math.abs(e.rsv-1)<1e-6,'a shorter stun on top of a longer one costs nothing (rsv '+e.rsv.toFixed(2)+')');
stunE(e,1.5);ok(Math.abs(e.rsv-1.5)<1e-6,'a longer stun only charges the extension (rsv '+e.rsv.toFixed(2)+')');
// 6. the bar empties after 5 s free
for(let i=0;i<7/dt;i++)moveEnemy(e,dt);ok(!(e.rsv>0),'Resolve empties after 5 s without a lock');
// 7. Unstoppable ends after 4 s free and the foe can be stunned again
clear();e=mk('soldier');stunE(e,3);const t0=e.stunT;let tt=0;while(e.unstopT>0&&tt<20){moveEnemy(e,dt);tt+=dt;if(e.dist>10)e.dist=2;}
ok(Math.abs(t0-2)<1e-6&&Math.abs(tt-6)<.1,'a 3 s stun is cut to '+t0.toFixed(2)+' s and the foe is free of Unstoppable after '+tt.toFixed(2)+' s (expected 2 + 4)');
ok(stunE(e,.5)>0,'after Unstoppable ends the foe can be stunned again');
clear();
}catch(err){o.push('ERR '+err.message+' '+(err.stack||'').slice(0,300));}
return o.join('\n');})()
