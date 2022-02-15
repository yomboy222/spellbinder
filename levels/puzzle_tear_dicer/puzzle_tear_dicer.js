/* puzzle_tear_dicer.js */

levelList.push( { name:'tear/dicer puzzle', difficulty:7 } );

getLevelFunctions['tear/dicer puzzle'] = function() {

    let level = new Level('tear/dicer puzzle');
    level.levelPath = 'puzzle_tear_dicer';

    level.defineThingSubclasses = function() {

        window.Car = class Car extends Thing {
            extraTransformToBehavior() {
                displayMessage('Beep beep!');
            }
        }

        window.Sleet = class Sleet extends Thing {

        }

        window.Treasure = class Treasure extends Thing {
            tryToPickUp() {
                completeLevel();
                return super.tryToPickUp();
            }

            handleClick() {
                completeLevel();
                return super.handleClick();
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
            case 'sleet' : return new Sleet(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.initialRoom = 'room1';
    level.initialX = 20; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 56;
    level.initialSpells = ['anagram', 'remove-edge', 'change-edge'];
    level.initialInventory = {};
    level.backgroundMusicFile = 'Sneaky Snitch.mp3';
    level.allWords = [ 'tear', 'tare', 'tar', 'rat', 'art', 'tea', 'ear', 'dicer', 'dice', 'ice', 'cider', 'eider', 'car', ];
    level.solidObjects  = [];
    level.immovableObjects = [ 'car', ];
    level.bridgelikeObjects = [];
    level.otherGameData = {};
    level.initialThings = [
        ['tare','room1', 10, 72],
        ['dicer','room1',25,70],
        ['treasure','room1',92,60],
    ];
    level.initialRunes = [];
    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [],
        },
    };

    level.initializationFunction = function() {
        displayMessage('The goal of this puzzle is to create something to drive away in!',3000);
        level.displayLevelIntroMessage();
    };

    return level;
}