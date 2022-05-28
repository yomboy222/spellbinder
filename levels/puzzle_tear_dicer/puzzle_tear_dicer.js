/* puzzle_tear_dicer.js */

levelList.push( { name:'tear-dicer', difficulty:5 } );

getLevelFunctions['tear-dicer'] = function() {

    let level = new Level('tear/dicer puzzle');
    level.folderName = 'puzzle_tear_dicer';

    level.defineThingSubclasses = function() {

        window.Car = class Car extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.sound = new Audio(getLevelPathFromFolderName(level.folderName) + '/audio/423990__amishrob__car-horn-beep-beep-two-beeps-honk-honk.wav');
                // this.imageEmpty = undefined;
                // this.imageWithPlayer = new Image();
                // this.imageWithPlayer.src = levelPath + '/things/car-with-player.png';
            }
            extraTransformIntoBehavior() {
                this.sound.play();
                // this.imageEmpty = this.image;
                // this.image = this.imageWithPlayer;
                // change image to player's head in window
                normalPlayerInputSuppressed = true;
                playerImageSuppressed = true;
                if (passages.length > 0) {
                    passages[0].activated = false;
                    passages[0].state = PASSAGE_STATE_INACTIVE;
                }
                this.beginMovementTime = Date.now();
                this.movementDurationMS = 3200;
                this.destX = 79 * xScaleFactor;
                this.destY = 90 * yScaleFactor;
                window.setTimeout(this.exitCar.bind(this), 3300);
            }
            exitCar() {
                normalPlayerInputSuppressed = false;
                playerImageSuppressed = false;
                // this.image = this.imageEmpty;
                player.x = this.x;
                player.y = this.y - 15;
            }
        }

        window.Sleet = class Sleet extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.frameCtr = 0;
                this.cannotPickUpMessage = '';
            }
            update() {
                this.y = this.initialY - 190 + (Math.round(Date.now() / 5 ) % 356);
            }
            passageBlockingBehavior() {
                displayMessage('This magical precipitation stings!', DEFAULT_MESSAGE_DURATION, this.initialX, this.initialY);
            }
            okayToDisplayWord() {
                return false;
            }
        }

        window.Treasure = class Treasure extends Thing {
            tryToPickUp() {
                completeLevel();
                return super.tryToPickUp();
            }
        }
    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'car' : return new Car(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'mysterious-precipitation' : return new Sleet(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.initialRoom = 'room1';
    level.initialX = 23; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 84;
    level.initialSpells = ['anagram', 'remove-edge', 'add-edge', 'change-edge'];
    level.initialInventory = {};
    level.backgroundMusicFile = 'FoamRubber-320bit.mp3';
    level.allWords = [ 'arc', 'rice', 'cart', 'dart', 'tear', 'tare', 'tar', 'rat', 'art', 'tea', 'ear', 'dicer', 'dice', 'ice', 'cider', 'eider', 'car', ];
    level.solidObjects  = ['mysterious-precipitation'];
    level.immovableObjects = [ 'arc', 'rice', 'car', 'cart', 'dart', 'tear', 'tare', 'tar', 'rat', 'art', 'tea', 'ear', 'dicer', 'dice', 'ice', 'cider', 'eider', ];
    level.bonusWords =  [ 'arc', 'art', 'rice', 'cart', 'rat', 'dart', 'tear', 'tea', 'ear', 'dice', 'ice', ];
    level.bridgelikeObjects = [];
    level.otherGameData = {};
    level.initialThings = [
        ['tare','room1', 12, 80],
        ['dicer','room1',33,80],
        ['treasure','room1',92,86],
        ['mysterious-precipitation', 'room1', 56, 50],
    ];
    level.initialRunes = [];
    level.rooms = {
        'room1': {
            boundaries: [ ['i',0,50,100,50] ],
            filledPolygons: [],
            passages: [  new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E',75,83, 'room1',72, 83, true, 72, 83, 'mysterious-precipitation', PASSAGE_STATE_BLOCKED, 50, 84 ) ],
            backgroundImageName: 'road-background.png',
        },
    };

    level.initializationFunction = function() {
        window.setTimeout(
            function() {
                displayMessage("Hint: at one point in this puzzle you'll need to turn something into a kind of duck. It's not super-obscure, but less common than 'mallard', say.");
            },
            2500
        )
    };

    return level;
}