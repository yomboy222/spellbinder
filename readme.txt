readme.txt file for the Spell-Binder game prototype
Doug McLellan, created 2/4/2022
https://github.com/yomboy222/spellbinder.git

TODO:

draw piece of paper in drawer when first opening
re-record host message to say goal is to get treasure chest
(or otherwise convey that that's how to complete a level.)

PHASE 2 STUFF:
use flip-a-clip to get walking player images
make released runes zip from the point of transformation into the inventory box
make stuff not pile up when you discard multiple things
check to make sure you can't discard something through a wall etc.


––––––––––––––––––––––––––––––
Sneaky Snitch by Kevin MacLeod http://incompetech.com
Creative Commons — Attribution 3.0 Unported — CC BY 3.0
Free Download / Stream: http://bit.ly/sneaky-snitch
Music promoted by Audio Library https://youtu.be/7-rXQALDv-4
––––––––––––––––––––––––––––––

sound from freesound.org, ...

dog bark -- https://freesound.org/s/327666/
unlock door -- https://freesound.org/s/410983/
pop bottle --- https://freesound.org/s/575527/
whoosh is https://freesound.org/s/530448/
beep beep https://freesound.org/s/423990/
https://freesound.org/s/420506/ (UpRising1)
fanfare -- https://freesound.org/s/524849/
splash -- https://freesound.org/people/InspectorJ/sounds/416710/ An example of how you might credit is by putting this in the description/credits:
          "Splash, Small, A.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org


================

people to send to --
john g
carl v
andrew, sophie
jason s
jason z
twitter
tree
jac
david l
sarah b / johnnie



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









