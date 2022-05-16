/* cordon-joker.js */

/* code generated by command: python3 create_level.py "name=cordon-joker" "initialSpells=anagram,remove-edge,change-letter" "targetThing=rock" "room=name:room1,things:cordon,exits:E/room2/cordon" "room=name:room2,things:joker,exits:W/room1" */

levelList.push( { name:'cordon-joker', difficulty:0 } );

getLevelFunctions['cordon-joker'] = function() {

    let level = new Level('cordon-joker');
    level.levelPath = 'cordon-joker';

    level.defineThingSubclasses = function() {

        window.Cauldron = class Cauldron extends Thing {
            constructor(word, room, x, y) {
                super(word, room, x, y);
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
                for (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    ctx.arc(this.bubbles[i].x, this.bubbles[i].y, this.bubbles[i].radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            }
        }

        window.Condo = class Condo extends Thing {
            extraTransformIntoBehavior() {
                passages[0].obstacle = 'condo';
                passages[0].state = PASSAGE_STATE_BLOCKED;
            }
        }

        window.Condor = class Condor extends Thing {
            extraTransformIntoBehavior() {
                passages[0].obstacle = 'condor';
                passages[0].state = PASSAGE_STATE_BLOCKED;
            }

            passageBlockingBehavior() {
                displayMessage('squak!!');
            }
        }

        window.Cordon = class Cordon extends Thing {
        }

        window.Cork = class Cork extends Thing {
        }

        window.Joke = class Joke extends Thing {
        }

        window.Roc = class Roc extends Thing {
        }

        window.Rock = class Rock extends Thing {
            handleDblclick() {
                this.soundToPlayAfterMovement = sounds['splash'];
                if (this.movable === false) {
                    return; // if it's not movable it's because it's on its way to cauldron, so ignore any further clicks.
                }
                if (this.word in inventory) {
                    let cauldron = thingsHere['cauldron'];
                    if (cauldron.inRangeOfPlayer(EXTRA_SPELL_RADIUS + 20)) {
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
                } else {
                    super.handleDblclick();
                }
            }

            concludeMovement() {
                super.concludeMovement();
                window.setTimeout(completeLevel, 2000);
            }
        }
    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'cauldron' : return new Cauldron(word,room,x,y);
            case 'condo' : return new Condo(word,room,x,y);
            case 'condor' : return new Condor(word,room,x,y);
            case 'cordon' : return new Cordon(word,room,x,y);
            case 'cork' : return new Cork(word,room,x,y);
            case 'joke' : return new Joke(word,room,x,y);
            case 'roc' : return new Roc(word,room,x,y);
            case 'rock' : return new Rock(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 65; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 55;
    level.initialSpells = [ 'anagram', 'remove-edge', 'change-letter' ];
    level.initialInventory = {};
    level.initialMessage = "To complete Gombrecht's potion, add a rock to the cauldron!";
    level.backgroundMusicFile = undefined;
    level.allWords = [ 'cauldron','codon','coke','condo','condor','cordon','core','cork','donor','jock','joke','joker','ore','roc','rock','roe','rondo' ];
    level.initialThings = [ ['cauldron','room1',25,70], ['cordon','room1',81,50],['joker','room2',40,65] ];
    // level.targetThing = 'rock';
    level.immovableObjects = ['condor','condo','cordon','cauldron','donor','jock','roc'];
    level.initialRunes = [];

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 50, 'room2', 10, 50, true, 50, 50, 'cordon', PASSAGE_STATE_BLOCKED, 73, 50)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 50, 'room1', 90, 50, true, 50, 50)],
        },
    };
    return level;
}