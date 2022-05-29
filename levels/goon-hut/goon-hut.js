/* goon-hut.js */

/* code generated by command: python3 create_level.py "name=goon-hut" "initialSpells=reversal,change-letter" "initialRunes=v,w" "targetThing=treasure" "room=name:room1,things:hut goon portcullis,exits:W/room0/goon E/room2/portcullis" "room=name:room0,things:loot oxen,exits:E/room1" "room=name:room2,things:tang shifter,exits:W/room1 E/room3/shifter" "room=name:room3,things:soiree treasure,exits:W/room2" */

levelList.push( { name:'goon-hut', difficulty:8 } );

getLevelFunctions['goon-hut'] = function() {

    let level = new Level('goon-hut');
    level.folderName = 'goon-hut';

    level.defineThingSubclasses = function() { 

        window.Goal = class Goal extends Thing {
        }

        window.Gnat = class Gnat extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.frameDisplayTimeMS = 240;
                this.startAnimating();
            }
            update() {
                super.update();
                let t1 = Math.round((Date.now() % 1000) * NUMBER_OF_FRAMES_IN_PASSAGE_ARROW_CYCLE / 1000);
                let t2 = Math.round((Date.now() % 380) * NUMBER_OF_FRAMES_IN_PASSAGE_ARROW_CYCLE / 380);
                this.x = this.initialX + (80 * arrowsAlphaLookupTable[t2]) - 40;
                this.y = this.initialY + (200 * arrowsAlphaLookupTable[t1]) - 150;
            }
        }

        window.Goon = class Goon extends Thing {
        }

        window.Gown = class Gown extends Thing {
            extraTransformIntoBehavior() {
                // when goon changes into gown, display it as goon *wearing* gown, looking down at himself, then running away
                startSuppressingPlayerInput();
                window.setTimeout(this.runAway.bind(this),2000);
            }
            runAway() {
                this.setMovement(0,this.y,1500,undefined,undefined,true, true);
                this.useAnimationImages = true;
                this.deleteAfterMovement = true;
                this.initiateMovement();
            }
        }

        window.Hole = class Hole extends Thing {
            okayToDisplayWord() {
                return false;
            }
        }

        window.Hut = class Hut extends Thing {
        }

        window.Lout = class Lout extends Thing {
        }

        window.Oven = class Oven extends Thing {
        }

        window.Portcullis = class Portcullis extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.doorstate = 'c'; // closed
            }
            okayToDisplayWord() {
                return false;
            }

            draw() {
                super.draw();
                if (this.doorstate === 'o') // open
                    return;
                let topX = this.x-61;
                let topY = this.y - 120;
                let bottomX = this.x - 65;
                let bottomY = this.y + 154;
                if (this.beginMovementTime > 0) { // opening...
                    let deltaT = Date.now() - this.beginMovementTime;
                    topX += Math.round(deltaT * 110 / 1500);
                    topY += Math.round(deltaT * 17/ 1500);
                    bottomX += Math.round(deltaT * 110 / 1500);
                    bottomY += Math.round(deltaT * 36/ 1500);
                }
                ctx.fillStyle = '#505';
                ctx.beginPath();
                ctx.moveTo(topX, topY);
                ctx.lineTo(this.x + 49,this.y - 103);
                ctx.lineTo(this.x + 45,this.y + 190);
                ctx.lineTo(bottomX,bottomY);
                ctx.closePath();
                ctx.fill();
            }


            extraPostMovementBehavior() {
                this.doorstate = 'o'; // open
            }

        }

        window.Shifter = class Shifter extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
                this.frameDisplayTimeMS = 1300;
                window.setTimeout(this.startAnimating.bind(this), 1200);
            }
        }

        window.Soiree = class Soiree extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                //this.useAnimationImages = true;
                //this.frameDisplayTimeMS = 1000;
            }
            passageBlockingBehavior() {
                displayMessageWithSound('Black tie only!',sounds['failure'], DEFAULT_MESSAGE_DURATION);
                // this.useAnimationImages = true;
                // window.setTimeout(this.stopAnimating.bind(this), DEFAULT_MESSAGE_DURATION);
            }
            okayToDisplayWord() {
                return false;
            }
        }

        window.Tool = class Tool extends Thing {
            handleDblclick(e) {
                let correspondingHoleWord = this.numberOfSides.toString() + 'hole';
                let correspondingHole = thingsHere[correspondingHoleWord];
                if (typeof correspondingHole === 'undefined' || !(this.getKey() in inventory))
                    return super.handleDblclick();

                // start the sequence to use the tool and increment the wheels:
                level.numberOfToolUses++;
                this.removeFromInventoryForUseOnScreen();
                this.incrementsCompletedInThisSequence = 0;
                this.setMovement(correspondingHole.x - 16, correspondingHole.y + 13, 500, player.x - 16, player.y + 13, true, false);
            }
            extraPostMovementBehavior() {
                if (this.incrementsCompletedInThisSequence < this.numberOfSides) {
                    for (let key in thingsHere) {
                        if (key.indexOf('wheel') >= 0) {
                            thingsHere[key].increment(1);
                        }
                    }
                    this.incrementsCompletedInThisSequence++;
                    this.setMovement(this.x,this.y,100,undefined,undefined,true,false)
                }
                else { // ... completed the 3 or 5 increments so wrap up:
                    this.incrementsCompletedInThisSequence = 0;
                    stopSuppressingPlayerInput();
                    let puzzleSolved = true; // by default; if either wheel isn't put into correct state, will set to false.

                    for (let key in thingsHere) {
                        if (key.indexOf('wheel') >= 0) {
                            if (thingsHere[key].pointer !== 0)
                                puzzleSolved = false;
                        }
                    }
                    if (puzzleSolved) {
                        let p = thingsHere['portcullis'];
                        p.unblockPassagesThisHadBeenBlocking();
                        p.setMovement(p.x,p.y,1500); // for door opening animation
                        level.sounds['unlock'].play();

                        if (level.numberOfToolUses <= 4) {
                            displayMessage('Bonus! You opened it in the smallest number of moves.', DEFAULT_MESSAGE_DURATION);
                            modifyScore(10);
                        }

                    }
                    this.returnToInventoryAfterUseOnScreen();
                }
            }
            extraTransformIntoBehavior() {
                if (typeof this.isonymIndex !== 'undefined' && this.isonymIndex === 1) {
                    this.numberOfSides = 5;
                    this.useAnimationImages = true; // will use alternate image tool0.png
                    this.image = this.images[0]; // use first (and only) animation image as main image too (used in inventory)
                    this.frameDisplayTimeMS = 0; // tells update code never to switch frames.
                }
                else {
                    this.numberOfSides = 3;
                    this.useAnimationImages = false; // use regular image tool.img
                }
            }
        }

        window.Treasure = class Treasure extends Thing {
        }

        window.Tux = class Tux extends Clothing {
            extraPickUpBehavior() {
                // need to change player images.
                level.setOrUnsetSoireeObstacle();
            }
            extraDiscardBehavior() {
                super.extraDiscardBehavior(); // this removes clothes from player image
                level.setOrUnsetSoireeObstacle();
            }
        }

        window.Wheel = class Wheel extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.radius = 30;
                this.numberOfTicks = parseInt(this.word.substr(0,2));
                this.pointer = (this.numberOfTicks === 10) ? 6 : 10;
                this.handLength = 34;
                this.centerX = this.x;
                this.centerY = this.y;
                this.handTipX = this.getHandTipX();
                this.handTipY = this.getHandTipY();

                this.numberOfTimesMoved = 0;
            }
            getHandTipX() {
                let angle = Math.PI * 2 * this.pointer / this.numberOfTicks;
                return this.centerX + ( Math.sin(angle) * this.handLength);
            }
            getHandTipY() {
                let angle = Math.PI * 2 * this.pointer / this.numberOfTicks;
                return this.centerY - (Math.cos(angle) * this.handLength);
            }
            okayToDisplayWord() {
                return false;
            }
            draw() {
                super.draw();
                ctx.strokeStyle = 'purple';
                ctx.lineWidth = 5;
                /*
                for (let i=0; i<this.numberOfTicks; i++) {
                    let angle = Math.PI * 2 * i / this.numberOfTicks;
                    let x = this.centerX + ( Math.sin(angle) * this.radius);
                    let y = this.centerY - (Math.cos(angle) * this.radius);
                    ctx.beginPath();
                    ctx.arc(x,y,3, 0, 2 * Math.PI);
                    ctx.stroke();
                }*/

                ctx.beginPath();
                ctx.moveTo(this.centerX, this.centerY);
                ctx.lineTo(this.handTipX, this.handTipY);
                ctx.stroke();
            }
            increment(aNumber) {
               // console.log('increment');
                this.pointer = (this.pointer + aNumber) % this.numberOfTicks;
                this.handTipX = this.getHandTipX();
                this.handTipY = this.getHandTipY();
                level.sounds['click'].play();
            }
        }

        window.Wool = class Wool extends Thing {
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'goal' : return new Goal(word,room,x,y);
            case 'gnat' : return new Gnat(word,room,x,y);
            case 'goon' : return new Goon(word,room,x,y);
            case 'gown' : return new Gown(word,room,x,y);
            case 'hut' : return new Hut(word,room,x,y);
            case 'lout' : return new Lout(word,room,x,y);
            case 'oven' : return new Oven(word,room,x,y);
            case 'portcullis' : return new Portcullis(word,room,x,y);
            case 'shifter' : return new Shifter(word,room,x,y);
            case 'soiree' : return new Soiree(word,room,x,y);
            case 'tool' : return new Tool(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'tux' : return new Tux(word,room,x,y);
            case 'wool' : return new Wool(word,room,x,y);
            case '10wheel' : return new Wheel(word,room,x,y);
            case '12wheel' : return new Wheel(word,room,x,y);
            case '3hole' : return new Hole(word,room,x,y);
            case '5hole' : return new Hole(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 35; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 75;
    level.initialSpells = [ 'reversal', 'change-letter' ];
    level.initialInventory = {};
    level.backgroundMusicFile = 'LurkingSloth-320bit.mp3';
    level.allWords = [ 'gang','gnat','goal','goat','gong','goon','gown','gut','hat','hut','loon','loot','lout','nut','oat','oven','oxen','portcullis','shifter','snifter','soiree','tang','tool','tool0','toon','treasure','tug','tun','tux','vat' ];
    level.bonusWords = [ 'gang','goal','gong','gut','hat','loon','lout','oat','toon','town','tug','vat','wool' ];
    level.initialThings = [ ['hut','room2',18,81],['goon','room1',18,68],['portcullis','room1',78,58],['10wheel','room1',94,50],['12wheel','room1',94,75],
        ['3hole','room1',60,40], ['5hole','room1',60,60], ['loot','room0',18,88,0],['loot','room0',8,81,1], ['oxen','room0',55,81],['tang','room2',57,85],['shifter','room2',81,68],['soiree','room3',47,66],['treasure','room3',91,81],
    ];
    level.targetThing = 'treasure';
    level.immovableObjects = [ 'gang','gnat','goal','goat','gong','goon','hut','lout','oven','oxen','portcullis','shifter',
        'soiree','wheel','hole','3hole','5hole','10wheel','12wheel','town','tug','tun','vat' ];
    level.initialRunes = ['v','w'];
    level.additionalImageNamesToPreload = ['tool_0','shifter_0','shifter_1','soiree_0','gown_0'];
    level.sounds = {
        'click' : new Audio(getLevelPathFromFolderName(level.folderName + '/audio/click3.wav')),
        'unlock': new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/410983__mihirfreesound__unlocking-door.wav'),
    };
    level.initialMessage = 'Your goal: get the treasure!';
    level.numberOfToolUses = 0;

    level.setOrUnsetSoireeObstacle = function() {
        if (currentRoom != 'room3' || !('soiree' in thingsHere) )
            return;
        let soiree = thingsHere['soiree'];
        if ('tux' in inventory) {
            console.log('here');
            soiree.activateOrDeactivateObstacle(false);
        }
        else {
            console.log('here2');
            soiree.activateOrDeactivateObstacle(true);
        }
    }

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room0', 90, 77, true, 80, 77, 'goon', PASSAGE_STATE_BLOCKED, 26, 63),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E', 75, 75, 'room2', 10, 75, false, 35, 75, 'portcullis', PASSAGE_STATE_BLOCKED, 75, 70),
            ],
        },
        'room0': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',37, 77, 'room0', 40, 77, true, -1, -1, 'oxen', PASSAGE_STATE_BLOCKED, 70, 75),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room1', 10, 77, true, 35, 77)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room1', 74, 77, true, 35, 77),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room3', 10, 77, true, 18, 77, 'shifter', PASSAGE_STATE_BLOCKED, 73, 63)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room2', 90, 77, true, 50, 77),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',75, 77, 'room3', 75, 77, true, -1, -1, 'soiree', PASSAGE_STATE_BLOCKED, 35, 75),
            ],
            specificNewRoomBehavior: function() {
                level.setOrUnsetSoireeObstacle();
            },
        },
    };
    return level;
}