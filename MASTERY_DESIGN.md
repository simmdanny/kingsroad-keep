# How to design scroll masteries (Simon's framework)

Simon asked every session to design masteries this way from now on (28 Oct, after the Rare scrolls). The question is not
"what cool thing could happen when this spell is upgraded?" but **"what is the most interesting thing this particular spell
could become while still feeling unmistakably like itself?"**

## 1. Name the spell's identity first
Reduce the scroll to one sentence: not its numbers, rarity or looks, but what makes it different from every other spell.
Then list its design space (the parts the masteries can grow from).

| Scroll | Identity | Design space |
|---|---|---|
| Fire Tornado | a moving wall of fire that pushes into the enemy line while dragging foes toward its centre | movement, rotation, pull, the funnel's core, its trail, its collapse |
| Frost Wolves | two independent hunters that chase, bite, switch prey and shatter at the end | hunting, coordination, target choice, movement, the final shatter |
| Ice Tomb | imprisoning the toughest foe in a ticking ice bomb | the prison, crystal growth, pressure, cracking, detonation, fragments |
| Entangling Roots | restraining several foes while preparing them for follow-up Nature damage | root networks, entanglement, growth underground, thorns, Overgrown |

First filter: if a mastery could be pasted onto almost any scroll without changing its name, it is not specific enough.
"Deals 20% more damage" fits anything; "every third bite from a Frost Wolf cracks the target's icy shell, so the next bite hits
harder" belongs to Frost Wolves.

## 2. Look for the mechanics that already exist
Break the ability into its parts and ask what else each could do.

| Part | Questions |
|---|---|
| Targeting | prioritise differently, mark prey, reward staying on one target? |
| Movement | could moving deal damage, leave a trail, change how foes are approached? |
| Damage pattern | could hits build to a special strike, split into stages, trigger a payoff? |
| Status effects | interact with another status, reward timing, prepare foes for another spell? |
| Duration | build up, change phases, finish differently? |
| Visual elements | could something already visible become mechanically meaningful? |
| Existing synergies | deepen an existing combo without making it mandatory? |

A favourite: take a detail that is only cosmetic and make it matter (Fire Tornado's twelve orbiting rocks became Molten Orbit).

## 3. Change behaviour, not just statistics
A. **Behaviour change**: the ability does something differently. B. **A new phase** in its existing life (build-up, duration,
finale). C. **An interaction** with its own mechanics, another spell or a status. D. **A signature payoff**: something it already
does culminates in a memorable event (best for the top tier). A mastery may combine them, but it needs a reason to exist.

## 4. Give each mastery a different design question
Five variations of "it grows bigger" are boring even if each works. Give each mastery its own question and its own part of the
spell (Fire Tornado: the rocks as weapons / a deadlier centre / a dangerous path / a second rotating attack / the storm converging
into its finale). Check for redundancy (two ideas that are both "a second explosion happens") and check the roster: a Rare mastery
must not take over the identity of an Epic or Legendary scroll, and so on up.

## 5. Does it create an interesting decision?
Does it fix a weakness or reinforce a strength? Reward a situation (clusters, a durable boss)? Create an interaction with the
player's other scrolls? Make the spell useful in a different encounter? Change how the player values or positions it? It needs
a meaningful reason to use the spell differently, not just more output.

## 6. Check the numbers before calling an idea good
Estimate what the base spell already deals, how many foes it hits, how often the new effect triggers and what control it adds.
Watch: trigger frequency (once, five times, dozens per cast?), target count, overlap (two instances on one foe), control value
(stun, slow, knockback, pull), boss scaling, and synergy multiplication with other bonuses and combos. The percentage follows
from the effect's expected contribution, not from what sounds impressive. In this repo: `tests/sm-ladder.js` measures a scroll's
power per mastery against its rarity's ladder (`smTarget`).

## 7. Design the visual and the mechanic together
The player should understand what happened just by watching. Look for **readability** (it is clear what the ability is doing),
**anticipation** (a visible warning before its important event) and **payoff** (a satisfying effect when it happens). An effect
with no visible feedback feels flat; one that hides foes or other spells is just as bad. Simon's standing rule: no low-effort
effects, no bland 2D explosions or flat rings, progressively better visually.

## 8. Respect the game's constraints
Check the targeting logic exists, a spell can track several entities, foes can be displaced safely on the fixed road (pushing
them off the road edge is not supported), overlapping effects do not double-hit, the statuses exist, and it behaves with flyers,
bosses, Resolve and decoys, without clutter or performance trouble. Prefer ideas that are distinctive without being needlessly
hard to build.

## The checklist (every mastery, before presenting a set)
- [ ] **Identity**: it clearly belongs to this spell.
- [ ] **Novelty**: it is meaningfully different from the other four.
- [ ] **Gameplay**: it changes behaviour, timing, targeting, coverage or interactions.
- [ ] **Visuals**: the player can clearly see it happening.
- [ ] **Balance**: damage, frequency, target count, bosses and synergies considered.
- [ ] **Compatibility**: it respects pathing, status and targeting rules.
- [ ] **Rarity**: its complexity and payoff suit its tier.
- [ ] **Roster fit**: it copies no other scroll and steals no higher-rarity scroll's identity.

Some overlap is natural, but each set needs a distinct internal structure with a clear reason for each option.
