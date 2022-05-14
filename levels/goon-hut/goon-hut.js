/* goon-hut.js */

/* code generated by command: python3 create_level.py "name=goon-hut" "initialSpells=reversal,change-letter" "initialRunes=v,w" "targetThing=treasure" "room=name:room1,things:hut goon portcullis,exits:W/room0/goon E/room2/portcullis" "room=name:room0,things:loot oxen,exits:E/room1" "room=name:room2,things:tang shifter,exits:W/room1 E/room3/shifter" "room=name:room3,things:soiree treasure,exits:W/room2" */

levelList.push( { name:'goon-hut', difficulty:0 } );

getLevelFunctions['goon-hut'] = function() {

    let level = new Level('goon-hut');
    level.folderName = 'goon-hut';

    level.defineThingSubclasses = function() { 

        window.Goal = class Goal extends Thing {
        }

        window.Goat = class Goat extends Thing {
        }

        window.Goon = class Goon extends Thing {
        }

        window.Hut = class Hut extends Thing {
        }

        window.Lout = class Lout extends Thing {
        }

        window.Oven = class Oven extends Thing {
        }

        window.Portcullis = class Portcullis extends Thing {
        }

        window.Shifter = class Shifter extends Thing {
        }

        window.Tool = class Tool extends Thing {
            handleDblclick(e) {
                if ('portcullis' in thingsHere && 'tool' in inventory) {
                    let portcullis = thingsHere['portcullis'];
                    this.removeFromInventoryForUseOnScreen();
                    this.setMovement(portcullis.x, portcullis.y, 1000, player.x, player.y, true);
                    this.methodToCallAfterMovement = function() {
                        level.sounds['unlock'].play();
                        thingsHere['portcullis'].unblockPassagesThisHadBeenBlocking();
                        this.returnToInventoryAfterUseOnScreen();
                        normalPlayerInputSuppressed = false;
                    };
                    this.initiateMovement();
                }
                else {
                    return super.handleDblclick(e);
                }
            }
        }

        window.Treasure = class Treasure extends Thing {
        }

        window.Vat = class Vat extends Thing {
        }

        window.Wool = class Wool extends Thing {
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'goal' : return new Goal(word,room,x,y);
            case 'goat' : return new Goat(word,room,x,y);
            case 'goon' : return new Goon(word,room,x,y);
            case 'hut' : return new Hut(word,room,x,y);
            case 'lout' : return new Lout(word,room,x,y);
            case 'oven' : return new Oven(word,room,x,y);
            case 'portcullis' : return new Portcullis(word,room,x,y);
            case 'shifter' : return new Shifter(word,room,x,y);
            case 'tool' : return new Tool(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'vat' : return new Vat(word,room,x,y);
            case 'wool' : return new Wool(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 55; // expressed as % of way across x axis, i.e. value range is 0-100 
    level.initialY = 75;
    level.initialSpells = [ 'reversal', 'change-letter' ];
    level.initialInventory = {};
    level.backgroundMusicFile = undefined;
    level.allWords = [ 'gang','gnat','goal','goat','gong','goon','gown','gut','hat','hut','loon','loot','lout','nut','oat','oven','oxen','portcullis','shifter','snifter','soiree','tang','tool','toon','town','treasure','tug','tun','tux','vat','wool' ];
    level.initialThings = [ ['hut','room1',40,81],['goon','room1',18,68],['portcullis','room1',81,68],['loot','room0',18,81],['oxen','room0',55,81],['tang','room2',40,81],['shifter','room2',81,68],['soiree','room3',47,81],['treasure','room3',91,81] ];
    level.targetThing = 'treasure';
    level.immovableObjects = [ 'gang','gnat','goal','goat','gong','goon','hut','lout','oven','oxen','portcullis','shifter','soiree','town','tug','tun','vat' ];
    level.initialRunes = ['v','w'];
    level.sounds = {
        'unlock': new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/410983__mihirfreesound__unlocking-door.wav'),
    };

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room0', 90, 77, true, 80, 77, 'goon', PASSAGE_STATE_BLOCKED, 26, 63),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room2', 10, 77, true, 50, 77, 'portcullis', PASSAGE_STATE_BLOCKED, 73, 63)],
        },
        'room0': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',37, 77, 'room0', 40, 77, true, -1, -1, 'oxen', PASSAGE_STATE_BLOCKED, 70, 75),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room1', 10, 77, true, 65, 77)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room1', 90, 77, true, 50, 77),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room3', 10, 77, true, 20, 77, 'shifter', PASSAGE_STATE_BLOCKED, 73, 63)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room2', 90, 77, true, 50, 77),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',75, 77, 'room3', 75, 77, true, -1, -1, 'soiree', PASSAGE_STATE_BLOCKED, 35, 75),
            ],
        },
    };
    return level;
}