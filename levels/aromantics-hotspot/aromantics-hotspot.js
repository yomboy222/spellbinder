/* aromantics-hotspot.js */

/* code generated by command: python3 create_level.py "name=aromantics-hotspot" "initialSpells=add-letter,remove-letter,change-letter" "targetThing=treasure" "room=name:room1,things:aromantics hotspot broth manifesto tyrannosaur,exits:E/room2/tyrannosaur" "room=name:room2,things:treasure,exits:W/room1" */

/* manifesto should hint at aromatic vegetables */

/*
The true Path is not just Vegetarianism but Asceticism. The Elimination of Flavors such as Cheeses; Onion and other Aromatic Vegetables; Thyme and other Herbs,

Ship's Manifest as of 6 April 1341:
180 lbs Smoked Gouda
90 lbs Onions
30 lbs Dried Herbs
 */


levelList.push( { name:'aromantics-hotspot', difficulty:0 } );

getLevelFunctions['aromantics-hotspot'] = function() {

    let level = new Level('aromantics-hotspot');
    level.folderName = 'aromantics-hotspot';

    level.defineThingSubclasses = function() { 

        window.Armoire = class Armoire extends Thing {
            handleClick(e) {
                level.sounds['knock'].play();
                if (level.tapestryClickCount >= 3) {
                    level.armoireClickCount++;
                    if (level.armoireClickCount === 3 && level.armoireOpen === false) {
                        // change armoire image to open.
                        level.armoireOpen = true;
                        let newPassage = new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'N', 75, 50, 'secret room', 50, 90, true, 50, 50);
                        passages.push(newPassage);
                        rooms[currentRoom].passages.push(newPassage);
                    }
                }
                else {
                    level.armoireClickCount = 0;
                    level.tapestryClickCount = 0;
                }
                console.log('a=' + level.armoireClickCount.toString() + ', t=' + level.tapestryClickCount.toString());
            }
            handleDblclick(e) {
                return false;
            }
            okayToDisplayWord() {
                return false;
            }

        }

        window.Aromatics = class Aromatics extends Thing {
            handleDblclick(e) {
                if ((!this.word in inventory) || !('hotpot' in thingsHere || 'hotpots' in thingsHere))
                    return super.handleDblclick(e);

                if (this.movable === false) {
                    return; // if it's not movable it's because it's on its way to cauldron, so ignore any further clicks.
                }

                this.soundToPlayAfterMovement = sounds['splash'];

                let cauldron = ('hotpots' in thingsHere) ? thingsHere['hotpots'] : thingsHere['hotpot'];
                thingsHere[this.word] = this;
                this.deleteAfterMovement = true;
                this.deleteCaptionIfAny();
                this.removeFromInventory();
                this.movable = false; // so player can't pick up again as it moves
                this.movementType = MOVEMENT_TYPE_PARABOLIC;
                this.beginMovementTime = Date.now();
                this.movementDurationMS = 1000;
                this.initialX = player.x;
                this.initialY = player.y;
                this.destX = cauldron.x;
                this.destY = cauldron.y - cauldron.halfHeight;
            }

            methodToCallAfterMovement() {
                super.methodToCallAfterMovement();
                let cauldron = ('hotpots' in thingsHere) ? thingsHere['hotpots'] : thingsHere['hotpot'];
                let broth = new Hotpot('broth',currentRoom,cauldron.x,cauldron.y);
                thingsHere['broth'] = broth;
                broth.captionDiv = getNewCaptionDiv('broth');
                broth.setCaptionPositionInThingsHere();
                cauldron.dispose();
                this.dispose();
            }
        }

        window.Hint = class Hint extends Thing {
            extraTransformIntoBehavior() {
                console.log('xScaleFactor is ' + xScaleFactor.toString());
                let x = (50 * xScaleFactor)  + canvasOffsetX;
                this.x = x;
                let y = (40 * yScaleFactor) + canvasOffsetY;
                this.y = y;
            }
        }

        window.Hotpot = class Hotpot extends Thing {
            constructor(word, room, x, y) {
                super(word, room, x, y);
                this.bubbles = [];
                for (let i = 0; i < 10; i++) {
                    let bubble = this.getRandomBubbleData();
                    this.bubbles.push(bubble);
                }
            }

            getRandomBubbleData() {
                let offset = 0.8 * this.width * (Math.random() - 0.5);
                let bubbleX = this.x + offset;
                let bubbleY = this.y - this.halfHeight; // (Math.sqrt( 1000 - (offset * offset)));
                let timeToPop = Date.now() + 300 + (300 * Math.random());
                let radius = 2 + (4 * Math.random());
                let delta = 1.4 + (Math.random() * 0.8);
                return {'x': bubbleX, 'y': bubbleY, 'timeToPop': timeToPop, 'radius': radius, 'delta': delta};
            }

            update() {
                super.update();
                let now = Date.now();
                for (let i = 0; i < 10; i++) {
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
                for (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    ctx.arc(this.bubbles[i].x, this.bubbles[i].y, this.bubbles[i].radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        }

        window.Lambkin = class Lambkin extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                let path = getLevelPathFromFolderName(level.folderName) + '/audio/baaaa.m4a';
                console.log(path);
                this.shriek = new Audio(path);
            }
            passageBlockingBehavior() {
                this.shriek.play();
            }
        }

        window.Robot = class Robot extends Thing {
            extraTransformIntoBehavior() {
                super.extraTransformIntoBehavior();
                let monster = thingsHere['tyrannosaur'];
                if (typeof monster === 'object') {
                    this.destX = monster.x - 90;
                    this.destY = monster.y + 50;
                    this.initiateMovement(0.2);
                    this.methodToCallAfterMovement = this.killMonster.bind(this);
                }
            }

            killMonster() {
                super.methodToCallAfterMovement(); // updates caption location
                let monster = thingsHere['tyrannosaur'];
                displayMessage('zap! (need graphics and sound for this)', DEFAULT_MESSAGE_DURATION);
                monster.dispose();
            }
        }


        window.Tapestry = class Tapestry extends Thing {
            handleClick(e) {
                level.sounds['knock'].play();
                if (level.armoireClickCount > 0) {
                    level.tapestryClickCount = 1;
                    level.armoireClickCount = 0;
                }
                else {
                    level.tapestryClickCount++;
                    level.armoireClickCount = 0;
                }

                console.log('a=' + level.armoireClickCount.toString() + ', t=' + level.tapestryClickCount.toString());
            }
            handleDblclick(e) {
                return false;
            }
            okayToDisplayWord() {
                return false;
            }

        }



        window.Tit = class Tit extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.startFlight();
                this.useAnimationImages = false;
            }

            stopAnimating() {
                this.useAnimationImages = false;
                this.setCaptionPositionInThingsHere();
            }

            startFlight() {
                this.useAnimationImages = true; // wing-flapping while flying
                this.initialX = this.x;
                this.initialY = this.y;
                this.destY = this.y;
                this.destX = canvasOffsetX + (CANVAS_WIDTH / 2) + Math.round( Math.random() * CANVAS_WIDTH / 2.3);
                this.movementType = MOVEMENT_TYPE_PARABOLIC;
                this.movementDurationMS = 500 + Math.round(Math.abs(this.x - this.destX) * 2);
                this.beginMovementTime = Date.now();
                this.methodToCallAfterMovement = this.stopAnimating.bind(this);
                let nextTakeoffTime = this.movementDurationMS + 500 + Math.round(Math.random() * 1200);
                window.setTimeout(this.startFlight.bind(this), nextTakeoffTime);
            }
        }


    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'armoire' : return new Armoire(word,room,x,y);
            case 'aromatics' : return new Aromatics(word,room,x,y);
            case 'hint' : return new Hint(word,room,x,y);
            case 'hotpot' : return new Hotpot(word,room,x,y);
            case 'hotpots' : return new Hotpot(word,room,x,y);
            case 'lambkin': return new Lambkin(word,room,x,y);
            case 'robot' : return new Robot(word,room,x,y);
            case 'robots' : return new Robot(word,room,x,y);
            case 'tit' : return new Tit(word,room,x,y);
            case 'tapestry' : return new Tapestry(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.showHintMessage = function() {
        displayMessage('You may need a hint to pass through this room!', 2 * DEFAULT_MESSAGE_DURATION);
    }

    level.initialRoom = 'room1';
    level.initialX = 38; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 35;
    level.initialSpells = [ 'add-letter-nfs', 'remove-letter-nfs', 'change-letter-nfs' ];
    level.initialInventory = {};
    level.backgroundMusicFile = undefined;
    level.allWords = ['treasure', 'aromantics', 'aromatics', 'hotpot', 'hotpot', 'hotspot', 'hotspot', 'manifest', 'manifesto', 'romantics',
        'boor', 'boot', 'booth', 'bot', 'broth', 'robot', 'roost', 'root', 'rot', 'shoot', 'shot', 'soot',
        'lambkin', 'lambskin',
        'tit','tint','tin','nit','hint',
    ];
    level.initialThings = [ ['aromantics','room1',42,72],['hotspot','room1',57,40],['lambkin','room1',18,50],['tyrannosaur','room1',85,70],
        ['manifesto','room3',48,65],
        ['tit','room2',65,25], ['armoire','room2',75,50], ['tapestry','room2',25,50],
        ['treasure','secret room',50,50]
    ];
    level.immovableObjects = ['aromantics', 'hotpot', 'hotpot', 'hotspot', 'hotspot','manifest','manifesto','romantics',
        'boor', 'booth', 'broth', 'robot', 'roost', 'lambkin', 'tyrannosaur',
        'tit', 'hint'];
    level.targetThing = 'treasure';
    level.initialRunes = []; // ['h','t','n'];
    level.initialMessage = 'You need something to battle the Tyrannosaur!';

    level.tapestryClickCount = 0;
    level.lastTapestryClickTime = 0;
    level.armoireClickCount = 0;
    level.lastArmoireClickTime = 0;
    level.armoireOpen = false;
    level.sounds = { 'knock': new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/447075__sol5__golpe-mesa-nina.wav'), };

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_VERTICAL, 'W', 3, 50, 'room3', 90, 50, true, 65,50, 'lambkin', PASSAGE_STATE_BLOCKED, 20, 50 ),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 70, 'room2', 10, 70, true, 50, 75, 'tyrannosaur', PASSAGE_STATE_BLOCKED, 77, 65)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 50, 'room1', 90, 70, true, 36, 50)
            ],
            specificNewRoomBehavior: function() {
                if ('tit' in thingsHere)
                    window.setTimeout(level.showHintMessage, 1200);
            }
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97,50,'room1',10,50, true, 38, 50)
            ]
        },
        'secret room': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'S',50,97,'room2',50,10, true, 50, 50)
            ]
        }
    };
    return level;
}