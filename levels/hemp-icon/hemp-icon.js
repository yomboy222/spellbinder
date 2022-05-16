/* hemp-icon.js */

/* code generated by command: python3 create_level.py "name=hemp-icon" "initialSpells=anagram,add-edge,remove-edge,change-edge" "targetThing=treasure" "room=name:room1,things:beefeater hemp icon,exits:W/room0/beefeater E/vending-room" "room=name:vending-room,things:muffin kepi,exits:W/room1 E/room3" "room=name:room3,things:boule ruin,exits:W/vending-room E/room4/ruin" "room=name:room4,things:treasure,exits:W/room3" "room=name:room0,things:cascara,exits:E/room1" */

levelList.push( { name:'hemp-icon', difficulty:0 } );

getLevelFunctions['hemp-icon'] = function() {

    let level = new Level('hemp-icon');
    level.folderName = 'hemp-icon';

    level.defineThingSubclasses = function() { 

        window.Bruin = class Bruin extends Thing {
            extraTransformIntoBehavior() {
                passages[1].obstacle = 'bruin';
                passages[1].state = PASSAGE_STATE_BLOCKED;
            }

            passageBlockingBehavior() {
                displayMessage("Grrrr!", DEFAULT_MESSAGE_DURATION);
                level.sounds['growl'].play();
            }
        }

        window.Coin = class Coin extends Thing {
            handleDblclick(e) {
                if (this.movable === false) {
                    return; // if it's not movable it's because it's on its way to the machine, so ignore any further clicks.
                }
                if (currentRoom === 'vending-room' && level.muffinInVendingMachine === true && 'muffin' in thingsHere && 'coin' in inventory) {
                    let muffin = thingsHere['muffin'];
                    this.removeFromInventoryForUseOnScreen();
                    this.movementType = MOVEMENT_TYPE_PARABOLIC;
                    this.setMovement(muffin.x + 80, muffin.y - 80, 1000, player.x, player.y, true);
                }
                else {
                    return super.handleDblclick(e);
                }
            }

            extraPostMovementBehavior() {
                normalPlayerInputSuppressed = false;
                let muffin = thingsHere['muffin'];
                if (typeof muffin === 'undefined' || muffin === null) {
                    this.returnToInventoryAfterUseOnScreen(); // something went wrong; just put coin back in inventory
                }
                else {
                    let sound = new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/kaching.wav');
                    sound.play();
                    let muffin = thingsHere['muffin'];
                    level.muffinInVendingMachine = false;
                    muffin.inVendingMachine = false;
                    muffin.setMovement(muffin.x + 85, muffin.y + 170, 1000);
                    this.dispose();
                }
            }
        }

        window.Coins = class Coins extends Thing {
        }

        window.Icon = class Icon extends Thing {
        }

        window.Icons = class Icons extends Thing {
        }

        window.Muffin = class Muffins extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.inVendingMachine = true;
            }
            handleClick(e) {
                if (this.inVendingMachine) {
                    sounds['failure'].play();
                    displayMessage('Alas, the muffin is inside the vending machine.', 3 * DEFAULT_MESSAGE_DURATION);
                    return true; // meaning we did handle it here.
                }
                else {
                    return super.handleClick(e);
                }
            }
            handleDblclick(e) {
                if (this.inVendingMachine) {
                    sounds['failure'].play();
                    displayMessage('Alas, the muffin is inside the vending machine.', 3 * DEFAULT_MESSAGE_DURATION);
                    return true; // meaning we did handle it here.
                }
                else {
                    return super.handleDblclick(e);
                }
            }
        }

        window.Pike = class Pike extends Thing {
            handleDblclick(e) {
                if ('beefeater' in thingsHere && 'pike' in inventory) {
                    this.removeFromInventoryForUseOnScreen();
                    this.strokeNumber = 0;
                    this.startStroke();
                    startSuppressingPlayerInput(3000);
                }
                else {
                    return super.handleDblclick(e);
                }
            }
            startStroke() {
                this.strokeNumber++;
                let destX = player.x - 80; // - 70;
                let destY = player.y ; // + 4;
                let time = 110;
                if (this.strokeNumber % 2 == 1) {
                    destX = player.x;
                    time = 600;
                }
                this.setMovement(destX, destY, time);
                if (this.strokeNumber < 6)
                    this.extraPostMovementBehavior = this.startStroke;
                else
                    this.extraPostMovementBehavior = this.finishUse;

            }
            finishUse() {
                let beefeater = thingsHere['beefeater'];
                beefeater.dispose();
                this.returnToInventoryAfterUseOnScreen();
            }

        }

        window.Ruin = class Ruin extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.wordDisplayOffsetY = 100;
            }
        }

        window.Ruins = class Ruins extends Thing {
        }

        window.Treasure = class Treasure extends Thing {
        }

        window.Treasures = class Treasures extends Thing {
        }

        window.VendingMachine = class VendingMachine extends Thing {
            okayToDisplayWord() {
                return false;
            }
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'bruin' : return new Bruin(word,room,x,y);
            case 'coin' : return new Coin(word,room,x,y);
            case 'coins' : return new Coins(word,room,x,y);
            case 'icon' : return new Icon(word,room,x,y);
            case 'icons' : return new Icons(word,room,x,y);
            case 'muffin' : return new Muffin(word,room,x,y);
            case 'pike' : return new Pike(word,room,x,y);
            case 'ruin' : return new Ruin(word,room,x,y);
            case 'ruins' : return new Ruins(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'treasures' : return new Treasures(word,room,x,y);
            case 'vendingmachine' : return new VendingMachine(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 53; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 75;
    level.initialSpells = [ 'anagram', 'add-edge', 'remove-edge', 'change-edge' ];
    level.initialInventory = {};
    level.backgroundMusicFile = undefined;
    level.allWords = [ 'beefeater','beefeaters','bike','blouse','boule','boules','bruin','burin',
        'cascara','coin','coins',
        'hem','hemp','hems','icon','icons','kepi','kepis','louse','maraca','maracas','mascara','mesh',
        'muffin','pike','pikes','puffin','puffins','ruin','ruins','spike','treasure','treasures' ];
    level.pluralWords =  {'beefeaters':'beefeater','boules':'boule','coins':'coin', 'hems':'hem','icons':'icon',
        'kepis':'kepi','maracas':'maraca', 'pikes':'pike','puffins':'puffin'} ;
    level.immovableObjects = [ 'vendingmachine', 'beefeater','beefeaters','bike','bruin','ruin','ruins' ];
    level.initialThings = [ ['cascara','room0',40,85],
        ['beefeater','room1',18,75],['hemp','room1',40,67],['icon','room1',63,72],
        ['muffin','vending-room',36,45],['kepi','vending-room',75,76],
        ['boule','room3',21,80],['ruin','room3',71,70],
        ['treasure','room4',66,80] ];
    level.bonusWords = ['bike','mesh','spike'];
    level.targetThing = 'treasure';
    level.initialRunes = [];
    level.sounds = { 'growl' : new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/345733__noahpardo__deep-growl-1.wav') };
    level.muffinInVendingMachine = true;

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room0', 90, 75, true, 50, 75, 'beefeater', PASSAGE_STATE_BLOCKED, 26, 75),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'vending-room', 10, 75, true, 66, 75)],
        },
        'vending-room': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room1', 90, 75, true, 50, 75),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room3', 10, 75, true, 39, 75)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'vending-room', 90, 75, true, 50, 75),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room4', 10, 75, true, 50, 75, 'ruin', PASSAGE_STATE_BLOCKED, 60, 70)],
        },
        'room4': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room3', 90, 75, true, 50, 75)],
        },
        'room0': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room1', 10, 75, true, 50, 75)],
        },
    };
    return level;
}