/* tutorial_level.js */

getLevelFunctions['tutorial level'] = function() {

    let level = new Level('tutorial level');
    level.defineThingSubclasses = function() {

        console.log('got here');

        window.Bear = class Bear extends Thing{
            extraTransformFromBehavior() {
                displayMessage('Now you can cast "cur > curb".');
            }
        }

        window.Cur = class Cur extends Thing{
            handleCollision() {
                // displayMessage('Yikes!');
                super.handleCollision();
            }
        }

        window.Gate = class Gate extends Thing {
            constructor(word, room, x, y) {
                super(word, room, x, y);
                this.locked = true;
            }
            unlock() {
                if (this.locked === true) {
                    // play unlocking sound, change image
                    this.solid = false;
                    displayMessage('The gate is now unlocked. In general, if an object can be used, you use it by clicking on it when it is in your inventory.');
                }
            }
        }

        window.Key = class Key extends Thing{
            tryToPickUp() {
                let returnValue = super.tryToPickUp();
                if (returnValue === 1) { // indicates it was picked up.
                    displayMessage('The key is now in your inventory. You can click it to drop it.');
                    setTimeout(function () {
                            displayMessage('To unlock the gate, go over to it and click on the key in your inventory.');
                        },
                        DEFAULT_MESSAGE_DURATION + 500);
                };
                return returnValue;
            }
            handleClick() {
                if ('gate' in thingsHere && 'key' in inventory) {
                    let gate = thingsHere['gate'];
                    if (gate.inRangeOfPlayer(EXTRA_SPELL_RADIUS + 20)) {
                        gate.unlock();
                    }
                    else {
                        return super.handleClick();
                    }
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Shovel = class Shovel extends Thing{
            handleClick() {
                if ('shovel' in inventory && currentRoom === 'pirate room') { // or whatever to check if digging in right place? }
                    displayMessage('yo');
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Stand = class Stand extends Thing {
            okayToDisplayWord() {
                return false; // this just exists to hold Binder
            }
            handleCollision() {
                if (otherData['grabbed binder'] === false) {
                    otherData['grabbed binder'] = true;
                    displayMessage('You got the Spell Binder! Type B to look inside.');
                    this.solid = false;
                    sounds['pickup'].play();
                    this.image.src = levelPath + '/things/stand-no-binder.png';
                }
                else {
                    return super.handleClick();
                }
            }
        }


        window.Treasure = class Treasure extends Thing {
            tryToPickUp() {
                completeLevel();
                return super.tryToPickUp();
            }

            handleClick() {
                completeLevel();
                return super.handleClick();
            }

            handleCollision() {
                completeLevel();
                super.handleCollision();
            }
        }
    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'cur' : return new Cur(word,room,x,y);
            case 'bear' : return new Bear(word,room,x,y);
            case 'gate' : return new Gate(word,room,x,y);
            case 'key' : return new Key(word,room,x,y);
            case 'shovel' : return new Shovel (word,room,x,y);
            case 'stand': return new Stand(word,room,x,y);
            case 'treasure': return new Treasure(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.showInitialTutorialMsg = function() {
        displayMessage("Use arrow keys (or A-S-D-W) to move over to the Binder.", 45, 10, true);
    }

    level.showRoom2Message = function () {
        if ('bear' in thingsHere) {
            displayMessage('Try to get past the cur by typing C and casting "cur > curb".');
        }
    }

    level.showRoom3Message = function () {
        if ('key' in thingsHere) {
            displayMessage('Go to the key, and pick it up, either by clicking it or by pressing space bar.');
        }
    }

    level.initialRoom = 'room1';
    level.initialX = 20; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 50;
    level.initialSpells = ['remove-edge', 'add-edge'];
    level.initialInventory = {};
    level.backgroundMusicFile = 'Sneaky Snitch.mp3';
    level.allWords = [ 'hovel', 'shovel', 'hovels', 'bear', 'cur', 'ear', 'curb', 'curd', 'cure', 'key' ];
    level.solidObjects  = [ 'bear', 'cur', 'gate', 'hovel', 'hovels', 'stand', ];
    level.immovableObjects = [ 'bear', 'gate', 'cur', 'curb', 'curd', 'hovel', 'hovels',  ];
    level.bridgelikeObjects = [ 'span', 'ladder' ];
    level.otherGameData = {
        'grabbed binder' : false,
    };
    level.initialThings = [
        ['stand','room1', 48, 50],
        ['cur','room2',85,40],
        ['bear','room2',25,40],
        ['gate','room3',63,50],
        ['key','room3',25,50],
        ['treasure','room3',90,47],
    ];
    level.initialRunes = [];
    level.rooms = {
        'room1': {
            boundaries: [ ['n',10, 36, 30, 36], ['n',10,64,30,64], ['n',10,36,10,64], ['d',30,36,42,18], ['n',42,18,54,18],
                ['d',54,18,66,36], ['n',66,36,100,36], ['d',30,64,42,82], ['n',42,82,54,82], ['d',54,82,66,64], ['n',66,64,100,64] ],
            filledPolygons: [ ['r',0,0,10,100],['r',10,0,20,36],['p',30,36,42,18,42,0,30,0],['r',42,0,58,18],
                ['p',54,18,66,36,100,36,100,18],  ['r',10,64,20,36], ['p',30,64,42,82,42,100,30,100],
                ['r',42,82,58,18], ['p',54,82,66,64,100,64,100,82], ],
            passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'room2', 50, 80)],
        },
        'room2': {
            boundaries: [ ['n',10,26,100,26], ['n',100,54,64,54], ['n',64,54,64,100], ['n',36,100,36,54], ['n',36,54,10,54], ['n',10,54,10,26], ],
            filledPolygons: [],
            passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 40, 'room3', 12, 50),
            ],
            specificNewRoomBehavior: function() {
                window.setTimeout(level.showRoom2Message,1600);
            }
        },
        'room3': {
            boundaries: [ ['n',0,36,96,36], ['n',96,36,96,64], ['n',0,64,96,64], ],
            filledPolygons: [],
            passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'room2', 88, 40),
            ],
            specificNewRoomBehavior: function() {
                window.setTimeout(level.showRoom3Message, 1200);
            }
        },
        'pirate room': {
            boundaries: [ ['n',0,36,100,36], ['n',0,64,75,64], ['n',75,64,75,100], ['n',92,100,92,64], ['n',92,64,100,64]] ,
            filledPolygons: [ ['r',0,0,100,36], ['r',0,64,75,36], ['r',92,64,8,36], ],
            passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'entry point', 90, 50),
            ],
        },
    };

    level.initializationFunction = function() {
        window.setTimeout(level.showInitialTutorialMsg, 1200);
    };

    return level;
}