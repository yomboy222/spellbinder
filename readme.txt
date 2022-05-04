readme.txt file for the Spell-Binder game prototype
Doug McLellan, created 2/4/2022
https://github.com/yomboy222/spellbinder.git

TODO:

investigate ways of dragging/dropping objects. takes place of double-click. same distinction between movable/immovable objects. one big advantage is you have a more intuitive procedure for "using one thing on/against/with another thing". tools become more appealing for puzzles.

different sounds for different spells?

screen-resizing issues

finish upgrading tutorial level.

possibly put messages into an invisible div & let them just fit in sequentially

consider marking words not necessary for level-solving as "bonus words". this would be a way to make red-herring words come across as positive, rather than as annoyances. exact definition might be tricky. can't just be "there exists a solution that doesn't involve the word", because could be two equally good (to be precise, say equally long) solutions to the level. more likely -- "any solution that involves this word could be simplified to remove it," but might be annoying to program automatic way to detect this.

when changing object in inventory, don't change inventory order

look up promise architecture (for images loading) and async/await just to be aware of it.

notification sound for messages and an initial visual effect to draw attention


PHASE 2 STUFF:
use flip-a-clip to get walking player images

difficulty rating feedback at end of each level


––––––––––––––––––––––––––––––
Sneaky Snitch by Kevin MacLeod http://incompetech.com
Creative Commons — Attribution 3.0 Unported — CC BY 3.0
Free Download / Stream: http://bit.ly/sneaky-snitch
Music promoted by Audio Library https://youtu.be/7-rXQALDv-4
––––––––––––––––––––––––––––––

sound from freesound.org, ...

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









