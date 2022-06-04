/* trash_lobster.js */

levelList.push( { name:'trash-lobster', difficulty:5 });

getLevelFunctions['trash-lobster'] = function() {

    let level = new Level('trash/lobster level');
    level.folderName = 'trash_lobster';

    level.defineThingSubclasses = function() {

        window.Brats = class Brats extends Thing {
            handleDblclick() {
                this.soundToPlayAfterMovement = sounds['splash'];
                if (this.movable === false) {
                    return; // if it's not movable it's because it's on its way to cauldron, so ignore any further clicks.
                }
                let cauldron = thingsHere['cauldron'];
                if (this.getKey() in inventory) {
                    this.removeFromInventoryForUseOnScreen();
                }
                this.deleteAfterMovement = true;
                this.movementType = MOVEMENT_TYPE_PARABOLIC;
                this.setMovement(cauldron.x, cauldron.y - cauldron.halfHeight, 1000, undefined, undefined, true, false);
            }
            extraPostMovementBehavior() {
                window.setTimeout(completeLevel, 2000);
            }

        }
        window.Cauldron = class Cauldron extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.bubbles = [];
                for (let i = 0; i < 10; i++) {
                    let bubble = this.getRandomBubbleData();
                    this.bubbles.push(bubble);
                }
            }

            okayToDisplayWord() {
                return false;
            }

            getRandomBubbleData() {
                let offset = 0.8 * this.width * (Math.random() - 0.5);
                let bubbleX = this.x + offset;
                let bubbleY = this.y - this.halfHeight; // (Math.sqrt( 1000 - (offset * offset)));
                let timeToPop = Date.now() + 300 + (300 * Math.random());
                let radius = 3 + (5 * Math.random());
                let delta = 1.4 + (Math.random() * 0.8);
                return { 'x': bubbleX, 'y': bubbleY, 'timeToPop': timeToPop, 'radius': radius, 'delta':delta };
            }

            update() {
                super.update();
                let now = Date.now();
                for  (let i = 0; i < 10; i++) {
                    this.bubbles[i].y -= this.bubbles[i].delta;
                    if (now > this.bubbles[i].timeToPop) {
                        this.bubbles[i] = this.getRandomBubbleData();
                    }
                }
            }

            draw() {
                super.draw();
                ctx.strokeStyle = 'purple';
                ctx.lineWidth = 2;
                for  (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    ctx.arc(this.bubbles[i].x, this.bubbles[i].y, this.bubbles[i].radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        }
    }

    level.getThing = function (word, room, x, y) {
        switch (word) {
            case 'brat' :
            case 'brats' : return new Brats(word, room, x, y);
            case 'cauldron' : return new Cauldron(word,room,x,y);
            default : return undefined; // the generic getThing function will then create a plain-vanilla Thing object.
        }
    }

    level.initialRoom = 'room1';
    level.initialX = 39; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 62;
    level.initialSpells = [allSpells.ANAGRAM, allSpells.REMOVE_EDGE, allSpells.ADD_EDGE, allSpells.CHANGE_EDGE];
    level.initialInventory = {};
    level.backgroundMusicFile = 'Sneaky Snitch.mp3';
    level.allWords = ['art', 'arts', 'bar', 'bars', 'bast', 'bat', 'bats', 'bolster', 'bolsters', 'bra', 'bras',
        'brat', 'brats', 'hart', 'harts', 'hat', 'hats', 'holster', 'holsters', 'lobster', 'lobsters', 'rat', 'rats',
        'star', 'tab', 'tabs', 'tar', 'tars', 'trash'];
    level.pluralWords = {
        'bars': 'bar', 'bats': 'bat', 'bolsters': 'bolster', 'bras': 'bra', 'brats': 'brat',
        'harts':'hart','hats':'hat','holsters':'holster', 'lobsters':'lobster', 'rats':'rat','tabs':'tab', 'tars':'tar' };
    level.bonusWords = ['bar','bars','bast','bat','bats','bra','bras','hat','hats','star','tab','tabs'];
    level.solidObjects  = [ 'cauldron',  ];
    level.immovableObjects = [ 'hart', 'harts', ];
    level.bridgelikeObjects = [ ];
    level.otherGameData = {};
    level.initialThings = [
        ['trash','room1', 24, 76],
        ['lobster','room1',50,74],
        ['cauldron','room1',75,74],
    ];
    level.initialRunes = [];

    level.goalDescription = 'Add some kind of sausage to the cauldron!';

    level.rooms = {
        'room1': {
            boundaries: [['n', 10, 10, 90, 10], ['n', 90, 10, 90, 90], ['n', 90, 90, 10, 90], ['d', 10, 90, 10, 10], ],
            filledPolygons: [['r', 0, 0, 100, 10], ['r', 0, 10, 10, 90], ['r', 10, 90, 90, 10], ['r', 90, 10, 10, 90], ],
            passages: [],
        },
    };

    return level;
}