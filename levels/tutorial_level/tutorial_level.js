/* tutorial_level.js */

levelList.push( { name:'tutorial level', difficulty:1 });

getLevelFunctions['tutorial level'] = function() {

    let level = new Level('tutorial level');
    level.folderName = 'tutorial_level';

    level.defineThingSubclasses = function() {

        window.Bear = class Bear extends Thing{
            extraTransformFromBehavior() {
                displaySequenceableMessage('Now you can change "cur" into "curb"!', 'tutorial_instruction', 'tutorial_instruction');
            }
        }

        window.Cur = class Cur extends Thing{
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.sound = new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/327666__juan-merie-venter__dog-bark.wav');
            }
            passageBlockingBehavior() {
                this.sound.play();
                displayMessage('yikes!', DEFAULT_MESSAGE_DURATION);
            }
            extraTransformFromBehavior() {
                displaySequenceableMessage('... and now you can click on the arrow at right, to move to next room!', 'tutorial_instruction', 'tutorial_instruction');
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
                    this.unblockPassagesThisHadBeenBlocking();
                    displaySequenceableMessage('The gate is now unlocked. In general, if an object can be used, you use it by double-clicking on it when it is in your inventory.','gate-unlocked', 'got-key-message');
                }
            }
            okayToDisplayWord() {
                return false;
            }
        }

        window.Key = class Key extends Thing{
            tryToPickUp() {
                let returnValue = super.tryToPickUp();
                if (returnValue === true) { // indicates it was picked up.
                    displaySequenceableMessage('The key is now in your inventory. To unlock the gate, double-click the key in your inventory.','got-key-message', 'pick-up-key-message');
                };
                return returnValue;
            }
            handleDblclick(e) {
                if ('gate' in thingsHere && 'key' in inventory) {
                    let gate = thingsHere['gate'];
                    if (gate.inRangeOfPlayer(EXTRA_PICKUP_RADIUS)) {
                        gate.unlock();
                    }
                    else {
                        return super.handleDblclick(e);
                    }
                }
                else {
                    return super.handleDblclick(e);
                }
            }
        }

        window.Rutabaga = class Rutabaga extends Thing {
            extraPickUpBehavior() {
                displaySequenceableMessage("The rutabaga is in your inventory now. You can double click it to drop it (you won't need it)", 'tutorial_instruction', 'tutorial_instruction');
            }

            extraDiscardBehavior() {
                displaySequenceableMessage("Now click on the arrow at right to go to the next room.", "tutorial_instruction", "tutorial_instruction");
            }

        }

        /* window.Stand = class Stand extends Thing {
             okayToDisplayWord() {
                 return false; // this just exists to hold Binder
             }
         } */
    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'cur' : return new Cur(word,room,x,y);
            case 'bear' : return new Bear(word,room,x,y);
            case 'gate' : return new Gate(word,room,x,y);
            case 'key' : return new Key(word,room,x,y);
            case 'rutabaga': return new Rutabaga(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.showInitialTutorialMsg = function() {
        window.setTimeout( function() {
                displaySequenceableMessage("Double-click the rutabaga to pick it up.", "tutorial_instruction", "", 0, 50, 5, true);
             },
            1000);
    }

    level.showRoom2Message = function () {
        if ('bear' in thingsHere) {
            displaySequenceableMessage('Try to get past the cur by clicking on it and changing "cur" into "curb".', 'tutorial_instruction');
        }
    }

    level.showRoom3Message = function () {
        if ('key' in thingsHere) {
            displaySequenceableMessage('Pick up the key by double-clicking it.', 'pick-up-key-message');
        }
    }

    level.initialRoom = 'room1';
    level.initialX = 50; // expressed as % of way across x axis, i.e. value range is 0-100
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
        ['rutabaga','room1', 40, 50],
        ['cur','room2',83,80],
        ['bear','room2',67,53],
        ['gate','room3',63,50],
        ['key','room3',43,50],
        ['treasure','room3',92,47],
    ];
    level.initialRunes = [];
    level.rooms = {
        'room1': {
            boundaries: [ ['n',10, 30, 30, 30], ['n',10,70,30,70], ['n',10,30,10,70], ['d',30,30,42,18], ['n',42,18,54,18],
                ['d',54,18,66,30], ['n',66,30,100,30], ['d',30,70,42,82], ['n',42,82,54,82], ['d',54,82,66,70], ['n',66,70,100,70] ],
            filledPolygons: [ ['r',0,0,10,100],['r',10,0,20,30],['p',30,30,42,18,42,0,30,0],['r',42,0,58,18],
                ['p',54,18,66,30,100,30,100,18],  ['r',10,70,20,30], ['p',30,70,42,82,42,100,30,100],
                ['r',42,82,58,18], ['p',54,82,66,70,100,70,100,82], ],
            passages: [new Passage(PassageTypes.BASIC_RIGHT, 'E',95, 50, 'room2', 12, 80,
                true, 64, 80)],
        },
        'room2': {
            boundaries: [ ['n',0,97,100,97], ['n',0,62,56,62], ['n',56,62,56,35], ['n',56,35,84,35], ['n',84,35,84,62], ['n',84,62,100,62]],
            filledPolygons: [ ['r',0,0,100,35], ['r',0,35,56,27], ['r',84,35,16,27], ['r',0,97,100,3], ],
            passages: [new Passage(PassageTypes.BASIC_RIGHT, 'E', 95, 80, 'room3', 12, 50,
                true, 53, 50, 'cur', PASSAGE_STATE_BLOCKED, 76, 80),
                new Passage(PassageTypes.INVISIBLE_VERTICAL, 'W', 5, 80, 'room1', 88,50, true, 50, 50),
                ],
            specificNewRoomBehavior: function() {
                window.setTimeout(level.showRoom2Message,2200);
            }
        },
        'room3': {
            boundaries: [ ['n',0,36,96,36], ['n',96,36,96,64], ['n',0,64,96,64], ],
            filledPolygons: [ ['r',0,0,100,36], ['r',96,36,4,64], ['r',0,64,96,36], ],
            passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL,'W',5, 50, 'room2', 88, 80, true,64,80),
                new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E',78,50, 'room3', 78, 50, true,
                    -1, -1,'gate', PASSAGE_STATE_BLOCKED, 57, 50),
            ],
            specificNewRoomBehavior: function() {
                window.setTimeout(level.showRoom3Message, 1200);
            }
        },
    };

    level.initializationFunction = function() {
        level.sounds = {
            'unlock': new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/410983__mihirfreesound__unlocking-door.wav'),
        };
        document.getElementById('binder-icon-holder').style.display = 'none';
        window.setTimeout(level.showInitialTutorialMsg, 500);
    };

    return level;
}