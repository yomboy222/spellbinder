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
    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'car' : return new Car(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }

    level.initialRoom = 'room1';
    level.initialX = 20; // expressed as % of way across x axis, i.e. value range is 0-100
    level.initialY = 50;
    level.initialSpells = ['anagram', 'remove-edge', 'change-edge'];
    level.initialInventory = {};
    level.backgroundMusicFile = 'Sneaky Snitch.mp3';
    level.allWords = [ 'tear', 'tare', 'tar', 'rat', 'art', 'tea', 'ear', 'dicer', 'dice', 'ice', 'cider', 'eider', 'car', ];
    level.solidObjects  = [];
    level.immovableObjects = [ 'car', ];
    level.bridgelikeObjects = [];
    level.otherGameData = {};
    level.initialThings = [
        ['tear','room1', 48, 50],
        ['dicer','room1',85,70],
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
        displayMessage('The goal of this puzzle is to create something to drive away in! Take a look at what spells are in the Binder (press B)');
    };

    return level;
}