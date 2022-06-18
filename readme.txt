readme.txt file for the Spell-Binder game prototype
Doug McLellan, created 2/4/2022
https://github.com/yomboy222/spellbinder.git

PROTOTYPE 2 LAUNCH CHECKLIST:

ensure immovable objects set
make returned obstacles go to originalX, originalY
ensure all images made
make sure backgrounds are part of necessary images (test by clearing cache and playing off remote)
make sure every level has initial instructions
put all animation image names into level.additionalImageNamesToPreload
check that walking back thru rooms works

TODO:

figure out why "host" caption remains sometimes on ghost level

points-added bubble

logic for where to discard something: why isn't wrapper > rapper working? change vectors to try.

refactor "reblocks when re-emerges" so just add a method

refactor additionalImagesToPreLoad so you can call them by name (dictionary vs. array)

When dropping things on Lobster puzzle couldn’t move so dropped on top of each other. Eventually figured to case spells from inventory.

design loading message

refactor all this.x = , this.y = to setCoordinatesUponAppearance()

keep track of whether certain reminder messages have been shown so as to show them exactly once:
  -- to pick up an object, double-click
  -- to use an object, double-click while it's in your inventory (maybe mark tool objects as such)

====================

things noted from other games --

choose your character

some more praise.

more audio flourishes

list of words obtained inc. bonus words

group puzzles by spells you have ... unlock new spells

tiers and packs :)

enough bonus words to get a special prize




===============================
strategy for loading images:

imagesRequiredToStartThisLevel = {}

separate objectData into dataForThingsInInitialRoom, dataForThingsElsewhere

loop through dataForThingsInInitialRoom, add each one's *name* to imagesRequiredToStartThisLevel. add "initialBackground => 'pending'" to imagesRequiredToStartThisLevel.

add anything else marked in the level as necessary to launch level, additionalImagePathsToPreLoadForThisLevel = [];
    additionalImagesToPreLoad

create initialRoom.backgroundImage, set its onload to launchLevelIf..., and add it to imagesRequiredToStartThisLevel, as initialBackground => (image object). 

loop through dataForThingsInInitialRoom, instantiating everything, and after each instantiation setting key => (actual image object)

finally call launchLevelIf..... just in case 



==============================


images to do or redo:
  cordon-joker: donor
  goon-hut: SEPARATE IMAGE FOR SECOND LOOT
  aromantics: boot bot soot
  thorn-divan:
  jerk-whiskeys: ??  brake, dyes, ryes, tubers, tubes, tubs
  fjord-widow: lots
  spook-gel:check for rest
  asp-lamia: ??? -- also fix axe usage! 

make script to automatically pull in & rate transforms in puzzle_ideas.txt

again, when starting level, say "loading" until first-room images and background are loaded. maybe wait 1.5 seconds to load and if not done, then put up the "loading" graphic. make optional level.additionalImagesToPreload

worth redoing the background graphics to fade them out more.

think how you can use css to draw attention to new messages

investigate ways of dragging/dropping objects. takes place of double-click. same distinction between movable/immovable objects. one big advantage is you have a more intuitive procedure for "using one thing on/against/with another thing". tools become more appealing for puzzles.

redraw runes

possibly put messages into an invisible div & let them just fit in sequentially

look up promise architecture (for images loading) and async/await just to be aware of it.



PHASE 2 STUFF:
use flip-a-clip to get walking player images

graphics: light shaft from windows through dust effect

––––––––––––––––––––––––––––––
Sneaky Snitch by Kevin MacLeod http://incompetech.com
Creative Commons — Attribution 3.0 Unported — CC BY 3.0
Free Download / Stream: http://bit.ly/sneaky-snitch
Music promoted by Audio Library https://youtu.be/7-rXQALDv-4
––––––––––––––––––––––––––––––
Lurking Sloth by Alexander Nakarada | https://www.serpentsoundstudios.com
Music promoted on https://www.chosic.com/free-music/all/
Creative Commons Attribution 4.0 International (CC BY 4.0)
https://creativecommons.org/licenses/by/4.0/

------------------------------
sound from freesound.org, ...


door opening ... https://freesound.org/s/632128/
knock ... https://freesound.org/s/447075/
notification ... https://freesound.org/s/316798/
bear growl ... https://freesound.org/s/345733/
failure sound -- https://freesound.org/s/342756/
hawk -- https://freesound.org/s/362426/
dog bark -- https://freesound.org/s/327666/
unlock door -- https://freesound.org/s/410983/
pop bottle --- https://freesound.org/s/575527/
whoosh is https://freesound.org/s/530448/
beep beep https://freesound.org/s/423990/
https://freesound.org/s/420506/ (UpRising1)
fanfare -- https://freesound.org/s/524849/
splash -- https://freesound.org/people/InspectorJ/sounds/416710/ An example of how you might credit is by putting this in the description/credits:
          "Splash, Small, A.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
"UI Confirmation Alert, A1.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
click https://freesound.org/s/192277/
opera in thorn/divan , https://freesound.org/s/216502/
horn in thorn/divan https://freesound.org/s/413203/
collapse in easy soap bowtie -- https://freesound.org/s/434897/
collapse there -- https://freesound.org/s/77074/

================

people to send to --
x john g
x carl v
x andrew, sophie
x jason s
x jason z
x twitter
tree
jac
+ david l
+ sarah b / johnnie


survey questions.

Spell-Binder is fundamentally a puzzle game where the player
 transforms words for objects into other words, causing the objects to transform accordingly. But there are many directions
 it could be taken in.

syntactic vs. conceptual

The game could be made completely syntactic, a la Wordle (you'd be given some initial objects and spells, and told what target words you are supposed to obtain).
Or it could have more conceptual puzzles, where you come across obstacles and challenges and have to imagine what objects would allow you to get past them.

Even more purely syntactic than the "tare-dicer" puzzle
About as syntactic as the "tare-dicer" puzzle
More conceptual, like the "ghost" level, requiring you infer what objects you will need
Even more slanted toward conceptual puzzles than the "ghost" level

Mostly blank backgrounds (like "ghost" level)
Some background images (like "tare-dicer" puzzle)
Backgrounds everywhere, but of a hand-drawn or hand-painted character
M more backgrounds, more professionally rendered.

How much should the medieval/haunted-house angle be played up? (Currently it's hardly played up at all).
A lot
A little
Hardly at all

Should the vibe be more whimsical (like the "griffy" font I've used) or more serious than it is now?

Do you like the low-tech 2D game area, or would you prefer more depth/"parallax" so that i.e. when you go "up", you also move "away" and the player appears to get smaller?
2D as is
more 3D

Would you be more interested in a puzzle-a-day or puzzle-a-week format, or a stand-alone multi-level game (where e.g. you climb the tower and the final goal is
turning lead into gold)

One main variable in puzzle design here is how many red-herring paths to allow. (Like in the tare-dicer puzzle, if you turn dicer into dice, you've gone astray.)
How many red-herring paths would be ideal?
More than in the ghost and tare-dicer levels
About the same as in the those levels
Fewer than in those levels

Do you think a level with (among other spells) a "synonym" spell (e.g. pigs > swine) would be interesting?
Yes
Maybe
No

How long should the ideal "level" or "puzzle" be?
Short like the tare-dicer puzzle
in between tare-dicer puzzle and ghost level
longer like the ghost puzzle
even longer than the ghost puzzle

Do you think spatial puzzles (where you have to place objects in various configurations, say) or timing challenges (like you have to cast "pets > step" when
the pets who move around are underneath something high you need to reach) would be good to add?
yes
maybe
no, too gimmicky and/or beside the point


==============

ideas for redoing runes so that they can zip to/from inventory
for simplicity, don't set up system to allow dropping runes.
might want to make spell-execution interval a period when normal input is suppressed, so wouldn't have to worry about leaving room while spell is executing.

let spellCurrentlyExecuting = false;
runesComingToInventory = []; // each will be a game element
runesLeavingInventory = []

class Rune extends GameElement

letter:


when spell is cast:
spellCurrentlyExecuting = true;

for the rune being used, create a new Rune object, set destination & time etc.









