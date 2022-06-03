/* soap-bowtie-easy.js */

/* code generated by command: python3 create_level.py "name=soap-bowtie-easy" "initialSpells=remove-letter,change-letter" "targetThing=treasure" "room=name:room1,things:bowtie soap hater,exits:E/room2/hater N/room0" "room=name:room0,things:jammer,exits:S/room1" "room=name:room2,things:partition,exits:E/room3/partition W/room1" "room=name:room3,things:lava,exits:E/room4/lava W/room2" "room=name:room4,things:treasure,exits:W/room3" */

/* todo: make hater block the saw if you try to use it on him */

levelList.push( { name:'soap-bowtie', difficulty:3 } );

getLevelFunctions['soap-bowtie'] = function() {

    let level = new Level('soap-bowtie-easy');
    level.folderName = 'soap-bowtie-easy';

    level.defineThingSubclasses = function() {

        window.Hammer = class Hammer extends Thing {
            extraTransformIntoBehavior() {
                displayMessage('Remember that to use an item, you double-click on it when it is in your inventory!');
            }

            handleDblclick(e) {
                if (!(this.getKey() in inventory) || !(('partition' in thingsHere) || ('ravelin' in thingsHere)))
                    return super.handleDblclick(e);
                this.strokeNumber = 0;
                this.removeFromInventoryForUseOnScreen();
                let target = ('partition' in thingsHere) ? thingsHere['partition'] : thingsHere['ravelin'];
                this.x =  target.x - 25;
                this.y = target.y - 25;
                this.startStroke();
            }

            /* TODO: suppress player input during motion */

            startStroke() {
                this.strokeNumber++;
                let destX = this.x ; // - 70;
                let destY = this.y ; // + 4;
                let time = 110;
                if (this.strokeNumber % 2 == 1) {
                    destX = this.x ; // + 70;
                    destY = this.y ; // + 13;
                    time = 600;
                    level.sounds['hit'].play();
                }
                this.setMovement(destX, destY, time);
                if (this.strokeNumber < 8) {
                    this.extraPostMovementBehavior = this.startStroke.bind(this);
                }
                else if ('partition' in thingsHere) {
                    this.extraPostMovementBehavior = this.removePartition.bind(this);
                }
            }

            draw() {
                let rotation = 0;
                if (this.beginMovementTime > 0) {
                    rotation = (((Date.now() - this.beginMovementTime) / this.movementDurationMS) * Math.PI / 2 ) - (Math.PI/2);
                    if (this.strokeNumber % 2 == 1)
                        rotation = - rotation - (Math.PI / 2);
                }
                // console.log(rotation);
                if (this.beginMovementTime > 0) {
                    ctx.setTransform(1, 0, 0, 1, this.x + 10, this.y + 30);
                    ctx.rotate(rotation);
                    ctx.drawImage(this.image, 30-this.halfWidth, -20-this.halfHeight, this.width, this.height);
                    ctx.rotate(0-rotation);
                    ctx.setTransform(1,0,0,1,0,0);
                }
                else
                    ctx.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);
            }

            stopStriking() {
                if (typeof this.captionDiv !== 'undefined') {
                    this.captionDiv.style.display = 'block';
                }
                this.beginMovementTime = 0;
                this.movementDurationMS = 0;
                this.tryToPickUp(true);
            }

            removePartition() {
                this.stopStriking();
                thingsHere['partition'].dispose();
                level.sounds['collapse'].play();
            }
        }

        window.Hater = class Hater extends Thing {
            extraTransformIntoBehavior() {
                this.y = 375;
            }
        }

        window.Java = class Java extends Thing {
        }

        window.Lava = class Lava extends Thing {
        }

        window.Partition = class Partition extends Thing {
        }

        window.Treasure = class Treasure extends Thing {
        }

        window.Water = class Water extends Thing {
            extraTransformIntoBehavior() {
                level.sounds['melting'].play();
                this.y = 430;
            }
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'hammer' : return new Hammer(word,room,x,y);
            case 'hater' : return new Hater(word,room,x,y);
            case 'java' : return new Java(word,room,x,y);
            case 'lava' : return new Lava(word,room,x,y);
            case 'partition' : return new Partition(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'water' : return new Water(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 40; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 75;
    level.initialSpells = [ 'remove-letter', 'change-letter' ];
    level.initialInventory = {};
    level.backgroundMusicFile = 'LurkingSloth-320bit.mp3';
    level.giveRoomsRandomBackgroundsUnlessSpecified = true;
    level.allWords = [ 'bootie','bowtie','hammer','hater','jammer','java','lava','law','partition','paw','sap','saw','soap','treasure','water' ];
    level.bonusWords = ['paw','law'];
    level.initialThings = [ ['bowtie','room1',24,82],['soap','room1',50,82],['hater','room1',72,75],
        ['jammer','room0',40,80],
        ['partition','room2',75,76],
        ['lava','room3',72,85],['treasure','room4',40,81] ];
    level.immovableObjects = [ 'partition','jammer','hater','water','lava' ];

    level.targetThing = 'treasure';
    level.initialRunes = [];
    level.initialMessage = 'Your goal: find and take the treasure!';
    level.sounds = {
        'melting' : new Audio(getLevelPathFromFolderName(level.folderName + '/audio/melting.m4a')),
        'hit' : new Audio(getLevelPathFromFolderName(level.folderName + '/audio/434897__thebuilder15__collapse.wav')),
        'collapse' : new Audio(getLevelPathFromFolderName(level.folderName + '/audio/77074__benboncan__bricks-falling.wav'))
    }

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room2', 10, 75, true, 65, 72, 'hater', PASSAGE_STATE_BLOCKED, 66, 75),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room0', 90, 75, true, 50, 75)],
        },
        'room0': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room1', 10, 75, true, 40, 75)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room3', 10, 75, true, 35, 75, 'partition', PASSAGE_STATE_BLOCKED, 73, 75),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room1', 90, 75, true, 50, 75)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room4', 10, 75, true, 25, 75, 'lava', PASSAGE_STATE_BLOCKED, 63, 75),
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room2', 90, 75, true, 50, 75)],
        },
        'room4': {
            boundaries: [],
            filledPolygons: [],
            passages: [
                new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room3', 90, 75, true, 50, 75)],
        },
    };
    return level;
}