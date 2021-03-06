/* puzzle_tear_dicer.js */

levelList.push( { name:'tear/dicer puzzle', difficulty:7 } );

getLevelFunctions['tear/dicer puzzle'] = function() {

    let level = new Level('tear/dicer puzzle');
    level.levelPath = 'puzzle_tear_dicer';

    level.defineThingSubclasses = function() {

        window.Car = class Car extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.sound = new Audio(levelPath + '/audio/423990__amishrob__car-horn-beep-beep-two-beeps-honk-honk.wav');
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
            //    this.frameCtr = ( Math.round(Date.now() / 40 ) % 6 );
            //    if (this.frameCtr > 5)
            //        this.frameCtr = 0;
            //    this.image = this.images[this.frameCtr];
            }
            handleCollision() {
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
            handleCollision() {
                completeLevel();
                super.handleCollision();
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
    level.initialX = 20; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 70;
    level.initialSpells = ['anagram', 'remove-edge', 'add-edge', 'change-edge'];
    level.initialInventory = {};
    level.backgroundMusicFile = 'Sneaky Snitch.mp3';
    level.allWords = [ 'arc', 'rice', 'cart', 'dart', 'tear', 'tare', 'tar', 'rat', 'art', 'tea', 'ear', 'dicer', 'dice', 'ice', 'cider', 'eider', 'car', ];
    level.solidObjects  = ['mysterious-precipitation'];
    level.immovableObjects = [ 'arc', 'rice', 'car', 'cart', 'dart', 'tear', 'tare', 'tar', 'rat', 'art', 'tea', 'ear', 'dicer', 'dice', 'ice', 'cider', 'eider', ];
    level.bridgelikeObjects = [];
    level.otherGameData = {};
    level.initialThings = [
        ['tare','room1', 8, 73],
        ['dicer','room1',28,73],
        ['treasure','room1',90,86],
        ['mysterious-precipitation', 'room1', 50, 50],
    ];
    level.initialRunes = [];
    level.rooms = {
        'room1': {
            boundaries: [ ['i',0,50,100,50] ],
            filledPolygons: [],
            passages: [],
            backgroundImageName: 'road-background.png',
        },
    };

    level.initializationFunction = function() {
        displayMessage("Remember to mouse over the binder icon to see what spells you have available!");
        window.setTimeout(
            function() {
                displayMessage("Hint: at one point in this 'one-room' puzzle, you'll need to turn something into a kind of duck. It's not super-obscure, but less common than 'mallard', say.", 7000 );
            },
            2500
        )
    };

    return level;
}