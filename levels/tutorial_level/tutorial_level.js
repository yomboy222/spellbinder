/* tutorial_level.js */

levelList.push( { name:'tutorial level', difficulty:1 });

getLevelFunctions['tutorial level'] = function() {

    let level = new Level('tutorial level');
    level.folderName = 'tutorial_level';

    level.defineThingSubclasses = function() {

        window.Bear = class Bear extends Thing{
            constructor(word,room,x,y) {
                super(word, room, x, y);
                this.wordDisplayOffsetX = -105;
                this.wordDisplayOffsetY = -4;
            }
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

        window.Curb = class Curb extends Thing {
            extraTransformIntoBehavior() {
                this.x += 75;
                this.y += 18;
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
            case 'curb' : return new Curb(word,room,x,y);
            case 'bear' : return new Bear(word,room,x,y);
            case 'gate' : return new Gate(word,room,x,y);
            case 'key' : return new Key(word,room,x,y);
            case 'rutabaga': return new Rutabaga(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.showInitialTutorialMsg = function() {
        window.setTimeout( function() {
                displaySequenceableMessage("Double-click the rutabaga: this is how you pick things up.", "tutorial_instruction", "", 0, 50, 5, true);
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
    level.initialY = 80;
    level.initialSpells = ['remove-edge', 'add-edge'];
    level.initialInventory = {};
    level.backgroundMusicFile = 'Sneaky Snitch.mp3';
    level.allWords = [ 'bear', 'cur', 'ear', 'curb', 'key' ];
    level.solidObjects  = [ 'bear', 'cur', 'gate', 'hovel', 'hovels', 'stand', ];
    level.immovableObjects = [ 'bear', 'gate', 'cur', 'curb', 'curd', 'hovel', 'hovels',  ];
    level.bridgelikeObjects = [ 'span', 'ladder' ];
    level.targetThing = 'treasure';
    level.otherGameData = {
        'grabbed binder' : false,
    };
    level.initialThings = [
        ['rutabaga','room1', 65, 80],
        ['cur','room2',79,80],
        ['bear','room2',69,51],
        ['gate','room3',40,80],
        ['key','room3',17,80],
        ['treasure','room3',93,80],
    ];
    level.initialRunes = [];
    level.rooms = {
        'room1': {
            passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E',95, 75, 'room2', 12, 75,
                true, 60, 80)],
        },
        'room2': {
            boundaries: [ ['n',0,97,100,97], ['n',0,62,56,62], ['n',56,62,56,35], ['n',56,35,84,35], ['n',84,35,84,62], ['n',84,62,100,62]],
            filledPolygons: [ ['r',0,0,100,35], ['r',0,35,56,27], ['r',84,35,16,27], ['r',0,97,100,3], ],
            passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E', 95, 80, 'room3', 12, 80,
                true, 30, 80, 'cur', PASSAGE_STATE_BLOCKED, 76, 80),
                new Passage(PassageTypes.INVISIBLE_VERTICAL, 'W', 5, 80, 'room1', 88,80, true, 50, 80),
                ],
            specificNewRoomBehavior: function() {
                window.setTimeout(level.showRoom2Message,2200);
            }
        },
        'room3': {
            passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL,'W',5, 78, 'room2', 88, 80, true,64,80),
                new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E',76,78, 'room3', 78, 80, true,
                    -1, -1,'gate', PASSAGE_STATE_BLOCKED, 35, 80, 'Now double-click the treasure to pick it up!'),
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
        window.setTimeout(level.showInitialTutorialMsg, 500);
    };

    return level;
}