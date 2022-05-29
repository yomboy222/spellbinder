/* thorn-divan.js */

/* code generated by command: python3 create_level.py "name=thorn-divan" "initialSpells=add-edge,remove-edge" "targetThing=treasure" "room=name:room1,things:thorn,exits:E/room2/thorn" "room=name:room2,things:divan,exits:E/room3/divan W/room1" "room=name:room3,things:pigmen,exits:E/room4/pigmen W/room2" "room=name:room4,things:treasure,exits:W/room3" */

levelList.push( { name:'thorn-divan', difficulty:1 } );

getLevelFunctions['thorn-divan'] = function() {

    let level = new Level('thorn-divan');
    level.folderName = 'thorn-divan';

    level.defineThingSubclasses = function() {

        window.Diva = class Diva extends Thing {
            extraTransformIntoBehavior() {
                this.setMovement(this.x - 100, this.y - 90, 1000);
            }
            extraPostMovementBehavior() {
                level.sounds['opera'].play();
            }
        }

        window.Divan = class Divan extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
                this.cannotPickUpMessage = 'The divan is too heavy to move away from the door!';
            }
            passageBlockingBehavior() {
                displayMessage('The divan is too heavy to move away from the door!');
            }
        }

        window.Horn = class Horn extends Thing {
            extraTransformIntoBehavior() {
                level.sounds['horn'].play();
            }
        }

        window.Pigmen = class Pigmen extends Thing {
            passageBlockingBehavior() {
                level.sounds['oink'].play();
                displayMessage('Blocked!', DEFAULT_MESSAGE_DURATION);
            }
        }

        window.Pigment = class Pigment extends Thing {
            extraTransformIntoBehavior() {
                level.sounds['oink'].play();
                this.y = 420;
                this.wordDisplayOffsetX += 25;
            }
        }

        window.Thorn = class Thorn extends Thing {
            passageBlockingBehavior() {
                displayMessage('Ouch!');
            }
        }

        window.Treasure = class Treasure extends Thing {
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'diva' : return new Diva(word,room,x,y);
            case 'divan' : return new Divan(word,room,x,y);
            case 'horn' : return new Horn(word,room,x,y);
            case 'pigmen' : return new Pigmen(word,room,x,y);
            case 'pigment' : return new Pigment(word,room,x,y);
            case 'thorn' : return new Thorn(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 55; // expressed as % of way across x axis, i.e. value range is 0-100 
    level.initialY = 75;
    level.initialSpells = [ 'add-edge', 'remove-edge' ];
    level.initialInventory = {};
    level.backgroundMusicFile = 'FoamRubber-320bit.mp3';
    level.allWords = [ 'diva','divan','horn','pigmen','pigment','thorn','treasure' ];
    level.initialThings = [ ['thorn','room1',74,80],['divan','room2',81,76],['pigmen','room3',81,75],['treasure','room4',75,81] ];
    level.targetThing = 'treasure';
    level.immovableObjects = ['diva','divan','pigmen','thorn'];
    level.initialRunes = [];
    level.sounds = {
        'horn' : new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/413203__joepayne__clean-and-pompous-fanfare-trumpet.mp3'),
        'oink' : new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/pigmen.m4a'),
        'opera' : new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/216502__tweedledee3__soprano-riff-three.mp3')
    }
    level.initialMessage = 'Your goal: find the treasure!';

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room2', 10, 77, true, 50, 77, 'thorn', PASSAGE_STATE_BLOCKED, 73, 77)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room3', 10, 77, true, 50, 77, 'divan', PASSAGE_STATE_BLOCKED, 73, 77),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room1', 90, 77, true, 50, 77)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room4', 10, 77, true, 50, 77, 'pigmen', PASSAGE_STATE_BLOCKED, 73, 77),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room2', 90, 77, true, 50, 77)],
        },
        'room4': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room3', 90, 77, true, 50, 77)],
        },
    };
    return level;
}