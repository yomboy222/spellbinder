/* tutorial_level.js */

levelList.push( { name:'tutorial level', difficulty:1 });

getLevelFunctions['tutorial level'] = function() {

    let level = new Level('tutorial level');
    levelPath = 'levels/tutorial_level';

    level.defineThingSubclasses = function() {

        window.Bear = class Bear extends Thing{
            extraTransformFromBehavior() {
                displayMessage('Now you can cast "cur > curb".', 3600);
            }
        }

        window.Cur = class Cur extends Thing{
            handleCollision() {
                level.sounds['dog bark'].play();
                super.handleCollision();
            }
        }

        window.Gate = class Gate extends Thing {
            unlock() {
                if (this.solid === true) {
                    // play unlocking sound, change image
                    level.sounds['unlock'].play();
                    this.destX = this.x + 80;
                    this.destY = this.y + 90;
                    this.beginMovementTime = Date.now();
                    this.movementDurationMS = 1200;
                    this.solid = false;
                    displayMessage('The gate is now unlocked. In general, if an object can be used, you use it by clicking on it when it is in your inventory.', 3600);
                }
            }
        }

        window.Key = class Key extends Thing{
            tryToPickUp() {
                let returnValue = super.tryToPickUp();
                if (returnValue === 1) { // indicates it was picked up.
                    displayMessage('The key is now in your inventory. You can click it to drop it.',3000);
                    setTimeout(function () {
                            displayMessage('To unlock the gate, go over to it and click on the key in your inventory.',3600);
                        },
                        2500);
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

        window.Stand = class Stand extends Thing {
            okayToDisplayWord() {
                return false; // this just exists to hold Binder
            }
            handleCollision() {
                if (otherData['grabbed binder'] === false) {
                    otherData['grabbed binder'] = true;
                    displayMessage('You got the Spell Binder! Type B to look inside.', 2500);
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
        displayMessage("Use arrow keys (or A-S-D-W) to move over to the Binder.", DEFAULT_MESSAGE_DURATION, 45, 10, true);
    }

    level.showRoom2Message = function () {
        if ('bear' in thingsHere) {
            displayMessage('Try to get past the cur by typing C and casting "cur > curb".', 3600);
        }
    }

    level.showRoom3Message = function () {
        if ('key' in thingsHere) {
            displayMessage('Go to the key, and pick it up, either by clicking it or by pressing space bar.', 3600);
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
    level.sounds = {
        'dog bark': new Audio(levelPath + '/audio/327666__juan-merie-venter__dog-bark.wav'),
        'unlock': new Audio(levelPath + '/audio/410983__mihirfreesound__unlocking-door.wav'),
    };
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