/* tutorial_level.js */

levelList.push( { name:'tutorial level', difficulty:1 });

getLevelFunctions['tutorial level'] = function() {

    let level = new Level('tutorial level');
    level.levelPath = 'tutorial_level';

    level.defineThingSubclasses = function() {

        window.Bear = class Bear extends Thing{
            extraTransformFromBehavior() {
                displayMessage('Now you can change "cur" into "curb".');
            }
        }

        window.Cur = class Cur extends Thing{
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.sound = new Audio(levelPath + '/audio/327666__juan-merie-venter__dog-bark.wav');
            }
            passageBlockingBehavior() {
                this.sound.play();
                displayMessage('yikes!', DEFAULT_MESSAGE_DURATION);
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
                    displayMessage('The gate is now unlocked. In general, if an object can be used, you use it by double-clicking on it when it is in your inventory.');
                }
            }
        }

        window.Key = class Key extends Thing{
            tryToPickUp() {
                let returnValue = super.tryToPickUp();
                if (returnValue === 1) { // indicates it was picked up.
                    displayMessage('The key is now in your inventory. You can double-click it to use it.');
                    setTimeout(function () {
                            displayMessage('To unlock the gate, double-click on the key in your inventory.');
                        },
                        2500);
                };
                return returnValue;
            }
            handleDblclick() {
                if ('gate' in thingsHere && 'key' in inventory) {
                    let gate = thingsHere['gate'];
                    if (gate.inRangeOfPlayer(EXTRA_PICKUP_RADIUS)) {
                        gate.unlock();
                    }
                    else {
                        return super.handleDblclick();
                    }
                }
                else {
                    return super.handleDblclick();
                }
            }
        }

        window.Stand = class Stand extends Thing {
            okayToDisplayWord() {
                return false; // this just exists to hold Binder
            }
        }
    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'cur' : return new Cur(word,room,x,y);
            case 'bear' : return new Bear(word,room,x,y);
            case 'gate' : return new Gate(word,room,x,y);
            case 'key' : return new Key(word,room,x,y);
            case 'stand': return new Stand(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.showInitialTutorialMsg = function() {
        displayMessage("Click on arrow to move right, into the next room.", 0, 50, 5, true);
    }

    level.showRoom2Message = function () {
        if ('bear' in thingsHere) {
            displayMessage('Try to get past the cur by clicking on it and changing "cur" into "curb".', 0);
        }
    }

    level.showRoom3Message = function () {
        if ('key' in thingsHere) {
            displayMessage('Pick up the key by DOUBLE-clicking it.', 0);
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
    level.targetThing = 'treasure';
    level.otherGameData = {
        'grabbed binder' : false,
    };
    level.initialThings = [
        ['stand','room1', 48, 50],
        ['cur','room2',82,40],
        ['bear','room2',56,42],
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
            passages: [new Passage(PassageTypes.BASIC_RIGHT, 'E',95, 50, 'room2', 12, 80,
                true, 73, 80)],
        },
        'room2': {
            boundaries: [ ['n',30,26,100,26], ['n',100,54,84,54], ['n',84,54,84,95], ['n',0,95,84,95], ['n',0,70,56,70], ['n',56,70,56,54], ['n',56,54,30,54], ['n',30,54,30,26], ],
            filledPolygons: [ ['r',0,0,100,26], ['r',0,26,30,44], ['r',30,54,26,16], ['r',0,95,100,5], ['r',84,54,16,41], ],
            passages: [new Passage(PassageTypes.BASIC_RIGHT, 'E', 95, 40, 'room3', 12, 50,
                true, 20, 50, 'cur', PASSAGE_STATE_BLOCKED, 78, 53),
                new Passage(PassageTypes.INVISIBLE_VERTICAL, 'W', 5, 80, 'room1', 88,50),
                ],
            specificNewRoomBehavior: function() {
                window.setTimeout(level.showRoom2Message,2200);
            }
        },
        'room3': {
            boundaries: [ ['n',0,36,96,36], ['n',96,36,96,64], ['n',0,64,96,64], ],
            filledPolygons: [ ['r',0,0,100,36], ['r',96,36,4,64], ['r',0,64,96,36], ],
            passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL,'W',5, 50, 'room2', 88, 40),
                new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E',51,50, 'room3'),
            ],
            specificNewRoomBehavior: function() {
                window.setTimeout(level.showRoom3Message, 1200);
            }
        },
    };

    level.initializationFunction = function() {
        level.sounds = {
            'unlock': new Audio(levelPath + '/audio/410983__mihirfreesound__unlocking-door.wav'),
        };
        document.getElementById('binder-icon-holder').style.display = 'none';
        window.setTimeout(level.showInitialTutorialMsg, 500);
    };

    return level;
}