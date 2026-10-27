"""Makes the scroll-mastery test of one rarity from tests/smast2-test.js (the Uncommon one).
Usage: python tests/gen-smast-test.py <rarity> <out file> <version> <example scroll> [noisy,ids] [left,out,ids]
e.g.   python tests/gen-smast-test.py rare tests/smast3-test.js v370 riftfang
The ladder check: Mastery 3 within 35% of the next rarity and Mastery 5 of almost two up; 'noisy' scrolls only have to come out clearly
stronger; 'left out' ones are skipped there (their clean-cast checks stay)."""
import sys, pathlib
RAR, OUT, VER, EX = sys.argv[1:5]
NOISY = [k for k in (sys.argv[5] if len(sys.argv) > 5 else '').split(',') if k]
LEFT = [k for k in (sys.argv[6] if len(sys.argv) > 6 else '').split(',') if k]
NM = {'common': 'Common', 'uncommon': 'Uncommon', 'rare': 'Rare', 'epic': 'Epic', 'legendary': 'Legendary', 'mythic': 'Mythic', 'ancient': 'Ancient'}
ORD = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'ancient']
i = ORD.index(RAR); N0, N1, N2 = NM[RAR], NM[ORD[i + 1]], NM[ORD[min(6, i + 2)]]
art = lambda w: ('an ' if w[0] in 'AEIOU' else 'a ') + w
here = pathlib.Path(__file__).parent
s = (here / 'smast2-test.js').read_text(encoding='utf-8')
def r(a, b):
    global s
    assert s.count(a) >= 1, a[:70]
    s = s.replace(a, b)
r("/* The Uncommon scrolls' masteries (v369): Simon's Uncommon ladder (SM_LAD.uncommon), its power labels, every Uncommon at every mastery\n   casting clean and tidying up, and its power at Mastery 3 (Rare) and 5 (almost Epic). Run on the dev page:\n   __kk.ev(await (await fetch('/tests/smast2-test.js')).text())",
  "/* The %s scrolls' masteries (%s; made by tests/gen-smast-test.py from smast2-test.js): their ladder (SM_LAD.%s), its power labels, every\n   %s at every mastery casting clean and tidying up, and its power at Mastery 3 (%s) and 5 (almost %s). Run on the dev page:\n   __kk.ev(await (await fetch('/tests/%s')).text())" % (N0, VER, RAR, N0, N1, N2, pathlib.Path(OUT).name))
r("const UNC=SCROLL_IDS.filter(k=>SPELLS_S[k].r==='uncommon');", "const UNC=SCROLL_IDS.filter(k=>SPELLS_S[k].r==='%s');" % RAR)
r("ok('every Uncommon scroll has 5 masteries, calibrated',UNC.length===11&&", "ok('every %s scroll has 5 masteries, calibrated',UNC.length>0&&" % N0)
r("ok('Simon\\'s Uncommon ladder: Mastery 3 is a Rare, Mastery 5 almost an Epic',SM_LAD.uncommon.join(',')==='0,0.3,0.7,1,1.4,1.85'&&Math.abs(smTarget('darkpulse',3)-SM_STEP)<1e-9&&smTarget('darkpulse',5)<SM_STEP*SM_STEP&&smTarget('darkpulse',5)>smTarget('darkpulse',4),SM_LAD.uncommon.join(','));",
  "ok('Simon\\'s ladder for the %ss: Mastery 3 is %s, Mastery 5 almost %s',SM_LAD.%s.join(',')==='0,0.3,0.7,1,1.4,1.85'&&Math.abs(smTarget('%s',3)-SM_STEP)<1e-9&&smTarget('%s',5)<SM_STEP*SM_STEP&&smTarget('%s',5)>smTarget('%s',4),SM_LAD.%s.join(','));" % (N0, art(N1), art(N2), RAR, EX, EX, EX, EX, RAR))
r("ok('the card says it in his words',['a stronger Uncommon','approaching Rare','Rare power','above Rare','almost Epic'].every((t,i)=>smPowerLabel('beam',i+1)===t)",
  "ok('the card says it in his words',['a stronger %s','approaching %s','%s power','above %s','almost %s'].every((t,i)=>smPowerLabel('%s',i+1)===t)" % (N0, N1, N1, N1, N2, EX))
r("/* ---- every Uncommon at every mastery ---- */", "/* ---- every %s at every mastery ---- */" % N0)
r("ok('every Uncommon scroll casts at every mastery without errors'", "ok('every %s scroll casts at every mastery without errors'" % N0)
r("for(const m in W)v[m]=power(k,m,12);", "for(const m in W){const R=%s.includes(k)?3:1;let q=0;for(let i=0;i<R;i++)q+=power(k,m,Math.max(4,Math.min(12,Math.round(100/SPELLS_S[k].cd))));v[m]=q/R;}" % repr(NOISY).replace(' ', ''))
r("for(const k of UNC.filter(k=>k!=='firewall')){", "for(const k of UNC.filter(k=>!%s.includes(k))){" % repr(LEFT).replace(' ', ''))
r(":['darkpulse','beam'].includes(k)?", ":%s.includes(k)?" % repr(NOISY).replace(' ', ''))   # (v391: smast2 checks SM.free first)
r("      /* one run of Dark Pulse (it pushes foes about) or the Beam (the line it happens to take) swings by 40%: those only have to come out\n         clearly stronger; the calibration used 4 runs for them */",
  "      /* the noisy ones (%s: one run swings with how the foes happen to stand, e.g. how many a piercing shard lines up) are measured\n         on 3 runs and only have to come out clearly stronger */" % (', '.join(NOISY) or 'none'))
r("ok('Mastery 3 lands near a Rare and Mastery 5 near an Epic (within 35%; the two noisy ones clearly stronger)',!off.length,'targets '+smTarget('beam',3).toFixed(2)+'/'+smTarget('beam',5).toFixed(2)+' '+JSON.stringify(res));",
  "ok('Mastery 3 lands near %s and Mastery 5 near %s (within 35%%%s)',!off.length,'targets '+smTarget('%s',3).toFixed(2)+'/'+smTarget('%s',5).toFixed(2)+' '+JSON.stringify(res));" % (art(N1), art(N2), '; noisy ones clearly stronger' if NOISY else '', EX, EX))
# Epic and up: a big scroll's hits sit near the test foes' 600 HP, so 19% more power can tip a whole crowd from 'nearly dead' to 'dead'
# (or a crowd it already wipes out cannot die faster); real waves have mixed health and scale smoothly. Like the calibration, measure
# the masteries' own effects at base power and put the multiplier (smP) on top.
if RAR in ('epic', 'legendary', 'mythic'):
    r("castScrollNow(k,heroU,tStats(heroU),inR.length?inR:F.filter(e=>!e.dead),100*smP(k),oF(k))",
      "castScrollNow(k,heroU,tStats(heroU),inR.length?inR:F.filter(e=>!e.dead),100,oF(k))")
    r("meta.spells[k].lvl=lv0;return dmg/casts;}", "meta.spells[k].lvl=lv0;return dmg/casts*smP(k);}\n"
      "/* (Epic and up: the masteries' effects at base power, the multiplier smP on top, as the calibration does; a big scroll's hits sit near\n"
      "   the test foes' 600 HP, so a little more power can tip a whole crowd at once, which mixed real waves do not) */")
# the big scrolls kill the whole test crowd at once: like the game (big() returns 'none'), do not cast at an empty field
r("for(let c=0;c<3;c++){castScrollNow(k,heroU,tStats(heroU),enemies.filter(x=>!x.dead),100*smP(k),oF(k));run(SPELLS_S[k].cd);}",
  "for(let c=0;c<3;c++){const al=enemies.filter(x=>!x.dead);if(!al.length&&!SPELLS_S[k].global)break;castScrollNow(k,heroU,tStats(heroU),al,100*smP(k),oF(k));run(SPELLS_S[k].cd);}")
if RAR == 'mythic':
    # the Mythics climb the half-step ladder (SM_XH) to Ancient power at Mastery 5, and never become domains (Simon)
    r("ok('Simon\\'s ladder for the Mythics: Mastery 3 is an Ancient, Mastery 5 almost an Ancient',SM_LAD.mythic.join(',')==='0,0.3,0.7,1,1.4,1.85'&&Math.abs(smTarget('%s',3)-SM_STEP)<1e-9&&smTarget('%s',5)<SM_STEP*SM_STEP&&smTarget('%s',5)>smTarget('%s',4),SM_LAD.mythic.join(','));" % (EX, EX, EX, EX),
      "ok('the Mythics climb the half-step ladder: Mastery 5 is Ancient power',!SM_LAD.mythic&&SM_XH.join(',')==='0,0.25,0.5,0.68,0.88,1'&&Math.abs(smTarget('%s',5)-SM_STEP)<1e-9&&smTarget('%s',4)<smTarget('%s',5),SM_XH.join(','));" % (EX, EX, EX))
    r("['a stronger Mythic','approaching Ancient','Ancient power','above Ancient','almost Ancient']",
      "['a little stronger','stronger','much stronger','close to Ancient','Ancient power, no domain']")
    r("ok('Mastery 3 lands near an Ancient and Mastery 5 near an Ancient (within 35%",
      "ok('Mastery 3 and 5 land on the half-step ladder toward an Ancient (within 35%")
    r("  ok('no errors',errs===0,errs);",
      "  /* Simon: they do not become domains; only the Aeon Dial, a domain from the start, may open one */\n"
      "  {const dom=[];for(const k of UNC.filter(k=>k!=='aeon')){play();setL(k,5);SM.cnt[k]=0;const bd=near();for(let i=0;i<8;i++)foe(bd+.3*(i-3.5),i,2000,false);\n"
      "      const lv=()=>Object.keys(ANC.live||{}).filter(x=>ANC.live[x]),b0=lv();castScrollNow(k,heroU,tStats(heroU),enemies.filter(x=>!x.dead),100*smP(k),oF(k));\n"
      "      let opened=false;for(let i=0;i<SPELLS_S[k].cd/.5;i++){run(.5);if(lv().some(x=>!b0.includes(x)))opened=true;}if(opened)dom.push(k);setL(k,0);}\n"
      "    ok('no Mythic opens a domain at Mastery 5 (the Aeon Dial was one already)',!dom.length,dom.join(','));}\n"
      "  ok('no errors',errs===0,errs);")
(pathlib.Path(OUT)).write_text(s, encoding='utf-8', newline='')
print('wrote', OUT)
