/* asp-lamia.js */

/* code generated by command: python3 create_level.py "name=asp-lamia" "initialSpells=anagram,add-edge,remove-edge" "targetThing=treasure" "room=name:room1,things:asp lamia,exits:W/room0 N/room1/lamia E/room2/asp" "room=name:room0,things:wrapper ode,exits:E/room1" "room=name:room2,things:crook sitar,exits:W/room1" "room=name:room3,things:cub,exits:W/room1 E/room4/cub" "room=name:room4,things:treasure,exits:W/room3" */

levelList.push( { name:'asp-lamia', difficulty:6 } );

getLevelFunctions['asp-lamia'] = function() {

    let level = new Level('asp-lamia');
    level.folderName = 'asp-lamia';

    level.defineThingSubclasses = function() { 

        window.Asp = class Asp extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
            }
        }

        window.Crook = class Crook extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
            }
            extraTransformIntoBehavior() {
                if (currentRoom === 'room2')
                    passages[1].setObstacle(this.getKey());
            }
        }

        window.Crooks = class Crooks extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
            }
            extraTransformIntoBehavior() {
                if (currentRoom === 'room2')
                    passages[1].setObstacle(this.getKey());
            }
        }

        window.Cube = class Cube extends Thing {
        }

        window.Cubes = class Cubes extends Thing {
        }

        window.Dose = class Dose extends Thing {
        }

        window.Lamia = class Lamia extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
            }
            extraTransformIntoBehavior() {
                if (currentRoom === 'room1')
                    passages[1].setObstacle(this.getKey());
            }
        }

        window.Lamias = class Lamias extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
            }
            extraTransformIntoBehavior() {
                if (currentRoom === 'room1')
                    passages[1].setObstacle(this.getKey());
            }
        }

        window.Ode = class Ode extends Thing {
            handleClick() {
                if (currentRoom === 'room0' && 'ode' in thingsHere && !('stair' in thingsHere) && !('stairs' in thingsHere)) {
                    displayMessage('Too far away to transform!', DEFAULT_MESSAGE_DURATION);
                    return true;
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Rooks = class Rooks extends Thing {
        }

        window.Sitar = class Sitar extends Thing {
            handleClick() {
                if (currentRoom === 'room2' && 'sitar' in thingsHere && passages[1].state != PASSAGE_STATE_OCCUPIED) {
                    displayMessage('Too far away to transform!', DEFAULT_MESSAGE_DURATION);
                    return true;
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Stair = class Stair extends Thing {
            appearInRoom0() {
                if (currentRoom === 'room0') {
                    this.x = 58 * xScaleFactor;
                    this.y = 65 * yScaleFactor;
                    passages[1].activated = true;
                    passages[2].activated = true;
                    if (passages[1].state === PASSAGE_STATE_OCCUPIED)
                        passages[2].state = PASSAGE_STATE_ACTIVE;
                    else
                        passages[2].state = PASSAGE_STATE_OCCUPIED;
                }
            }
            disappearFromRoom0() {
                if (currentRoom === 'room0') {
                    passages[1].activated = false;
                    passages[2].activated = false;
                    // retain the states of the passages though.
                }
            }
            extraTransformFromBehavior() {
                if (currentRoom === 'room0')
                    this.disappearFromRoom0();
            }
            extraTransformIntoBehavior() {
                if (currentRoom === 'room0')
                    this.appearInRoom0();
            }
            handleClick() {
                if (currentRoom === 'room0' && passages[1].state === PASSAGE_STATE_OCCUPIED) {
                    displayMessage("Don't strand yourself up here!", DEFAULT_MESSAGE_DURATION);
                    return true;
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Treasure = class Treasure extends Thing {
        }

        window.Treasures = class Treasures extends Thing {
        }

        window.Wasp = class Wasp extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.reblocksPassageUponReturn = true;
                this.startAnimating();
            }
            extraTransformIntoBehavior() {
                if (currentRoom === 'room1')
                    passages[2].setObstacle(this.getKey());
            }
            update() {
                super.update();
                let t1 = Math.round((Date.now() % 1000) * NUMBER_OF_FRAMES_IN_PASSAGE_ARROW_CYCLE / 1000);
                let t2 = Math.round((Date.now() % 380) * NUMBER_OF_FRAMES_IN_PASSAGE_ARROW_CYCLE / 380);
                this.x = this.initialX + (80 * arrowsAlphaLookupTable[t2]) - 40;
                this.y = this.initialY + (200 * arrowsAlphaLookupTable[t1]) - 150;
            }
        }



    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'asp' : return new Asp(word,room,x,y);
            case 'crook' : return new Crook(word,room,x,y);
            case 'crooks' : return new Crooks(word,room,x,y);
            case 'cube' : return new Cube(word,room,x,y);
            case 'cubes' : return new Cubes(word,room,x,y);
            case 'dose' : return new Dose(word,room,x,y);
            case 'lamia' : return new Lamia(word,room,x,y);
            case 'lamias' : return new Lamias(word,room,x,y);
            case 'ode' : return new Ode(word,room,x,y);
            case 'rooks' : return new Rooks(word,room,x,y);
            case 'stair' : return new Stair(word,room,x,y);
            case 'stairs' : return new Stair(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'treasures' : return new Treasures(word,room,x,y);
            case 'wasp' : return new Wasp(word,room,x,y);
            case 'sitar' : return new Sitar(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 33; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 75;
    level.initialSpells = [ 'anagram', 'add-edge', 'remove-edge' ];
    level.initialInventory = {};
    level.backgroundMusicFile = 'Investigations Kevin MacLeod Gaming Background Music HD.mp3';
    level.allWords = [ 'asp','cod','code','codes','crook','crooks','cub','cube','cubes','cubs','doe','does','dose','lamia','lamias','ode','odes','paw','paws','rapper','rappers','rook','rooks','salami','sap','sitar','sitars','spa','stair','stairs','treasure','treasures','wasp','wrapper' ];
    level.initialThings = [  ['asp','room1',80,86],['lamia','room1',56,70],['wrapper','room0',58,81],['ode','room0',32,30],['crook','room2',50,77],['sitar','room2',85,81],['cub','room3',81,80],['treasure','room4',75,81] ];
    level.targetThing = 'treasure';
    level.immovableObjects = [ 'asp','crook','crooks','cub','cube','cubes','cubs','doe','does','lamia','lamias','rapper','rappers','spa','stair','stairs' ];
    level.bonusWords = ['doe','does','dose','sap','spa'];
    level.initialRunes = [];
    level.sounds = {};
    level.additionalImageNamesToPreload = ['wasp_0','wasp_1'];
    level.pluralWords = { 'codes':'code', 'crooks':'crook', 'cubs':'cub', 'does':'doe', 'lamias':'lamia', 'odes':'ode', 'paws':'paw', 'rappers':'rapper', 'rooks':'rook', 'sitars':'sitar', 'treasures':'treasure' }; // note don't list stairs here because don't want to double the image.

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room0', 90, 77, true, 80, 77),
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'N',68, 55, 'room2', 5, 77, true, 30, 77, 'lamia', PASSAGE_STATE_BLOCKED, 50, 68),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 89, 'room3', 10, 77, true, 50, 77, 'asp', PASSAGE_STATE_BLOCKED, 73, 85)
            ],
            hasOwnBackgroundImage: true,
        },
        'room0': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room1', 10, 77, true, 33, 77),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'NW',40, 32, 'room0', 35, 30, true),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'SE',58, 58, 'room0', 58, 58, true),
            ],
            specificNewRoomBehavior: function() {
                let stairsHere = ('stair' in thingsHere) ? thingsHere['stair'] : thingsHere['stairs'];
                if (typeof stairsHere === 'undefined') {
                    passages[1].activated = false;
                    passages[2].activated = false;
                }
                else {
                    stairsHere.appearInRoom0();
                }
            }
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room1', 66, 60, true, 33, 77),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',69, 77, 'room2', 69, 77, true, undefined, undefined, 'crook', PASSAGE_STATE_BLOCKED, 50, 77) ],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 77, 'room1', 90, 77, true, 33, 77),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room4', 10, 77, true, 50, 77, 'cub', PASSAGE_STATE_BLOCKED, 73, 77)],
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