/* soap-bowtie.js */

/* code generated by command: python3 create_level.py "name=soap-bowtie" "initialSpells=remove-letter,change-letter" "targetThing=treasure" "room=name:room1,things:bowtie soap fence,exits:E/room2/fence" "room=name:room2,things:hater,exits:E/room3/hater W/room1" "room=name:room3,things:beacon hummock,exits:E/room4/hummock W/room2" "room=name:room4,things:treasure,exits:W/room3" */

levelList.push( { name:'soap-bowtie', difficulty:0 } );

getLevelFunctions['soap-bowtie'] = function() {

    let level = new Level('soap-bowtie');
    level.folderName = 'soap-bowtie';

    level.defineThingSubclasses = function() { 

        window.Beacon = class Beacon extends Thing {
        }

        window.Fence = class Fence extends Thing {
        }

        window.Hater = class Hater extends Thing {
        }

        window.Hummock = class Hummock extends Thing {
          passageBlockingBehavior() {
            displayMessage('This hummock is surprisingly hard to climb over!', 3 * DEFAULT_MESSAGE_DURATION);
          }

        }

        window.Saw = class Saw extends Thing {
            handleDblclick(e) {

              if ((this.word in inventory) && ('hater' in thingsHere)) {
                  displayMessageWithSound('The hater blocks your saw!' , sounds['failure'], DEFAULT_MESSAGE_DURATION);
                  return false;
              }
              if (!(this.word in inventory) || !('fence' in thingsHere)) {
                  return super.handleDblclick(e);
              }
              this.strokeNumber = 0;
              this.removeFromInventoryForUseOnScreen();
              let fence = thingsHere['fence'];
              this.x = fence.x - 25;
              this.y = fence.y - 25;
              this.startStroke();
            }

            extraTransformIntoBehavior() {
              if (!(this.word in inventory)) {
                  displayMessage('Remember, to pick something up, double-click it; and double-click it again to use it.');
              }
            }

              startStroke() {
                  startSuppressingPlayerInput();
                  this.strokeNumber++;
                  let destX = this.x - 70;
                  let destY = this.y + 4;
                  let time = 180;
                  if (this.strokeNumber % 2 == 1) {
                    destX = this.x + 70;
                    destY = this.y + 13;
                    time = 280;
                  }
                  this.setMovement(destX, destY, time);
                  if (this.strokeNumber < 8)
                    this.extraPostMovementBehavior = this.startStroke.bind(this);
                  else
                    this.extraPostMovementBehavior = this.removeFence.bind(this);
              }

              removeFence() {
                    stopSuppressingPlayerInput();
                  this.returnToInventoryAfterUseOnScreen();
                  thingsHere['fence'].dispose();
              }
        }

        window.Treasure = class Treasure extends Thing {
        }

        window.Water = class Water extends Thing {
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'beacon' : return new Beacon(word,room,x,y);
            case 'fence' : return new Fence(word,room,x,y);
            case 'hater' : return new Hater(word,room,x,y);
            case 'hummock' : return new Hummock(word,room,x,y);
            case 'saw': return new Saw(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'water' : return new Water(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 45; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 75;
    level.initialSpells = [ 'remove-letter', 'change-letter' ];
    level.initialInventory = {};
    level.backgroundMusicFile = undefined;
    level.giveRoomsRandomBackgroundsUnlessSpecified = true;
    level.allWords = [ 'aster','bacon','beacon','bootie','bowtie','eater','ester','fence','hammock','hater','hoe','hummock','paw','pea','pew','sap','saw','sea','soap','spa','treasure','water' ];
    level.initialThings = [ ['bowtie','room1',19,67],['soap','room1',30,82],['fence','room1',72,75],
        ['hater','room2',50,80],
        ['beacon','room3',45,55],['hummock','room3',71,82],
        ['treasure','room4',40,69] ];
    level.immovableObjects = [ 'beacon','fence','hammock','hater','hummock','pew','spa','sea','water'  ];
    level.bonusWords = [ 'aster','eater','ester','hoe','pea','sea','spa', ];
    level.targetThing = 'treasure';
    level.initialRunes = [];

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room2', 10, 75, true, 30, 75, 'fence', PASSAGE_STATE_BLOCKED, 64, 75)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room3', 10, 75, true, 35, 75, 'hater', PASSAGE_STATE_BLOCKED, 40, 75),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room1', 90, 75, true, 50, 75)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 75, 'room4', 10, 75, true, 50, 75, 'hummock', PASSAGE_STATE_BLOCKED, 64, 75),
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'W',3, 75, 'room2', 90, 75, true, 70, 75)],
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
