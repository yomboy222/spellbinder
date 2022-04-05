/* test_create_level.js */

levelList.push( { name:'test create level', difficulty:0 } );

getLevelFunctions['test create level'] = function() {

    let level = new Level('test create level');
    level.levelPath = 'test_create_level';

    level.defineThingSubclasses = function() { 

        window.Asp = class Asp extends Thing {
        }

        window.Pan = class Pan extends Thing {
        }

        window.Trench = class Trench extends Thing {
        }

        window.Wrench = class Wrench extends Thing {
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'asp' : return new Asp(word,room,x,y);
            case 'pan' : return new Pan(word,room,x,y);
            case 'trench' : return new Trench(word,room,x,y);
            case 'wrench' : return new Wrench(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'entry';
    level.initialX = 20; // expressed as % of way across x axis, i.e. value range is 0-100 
    level.initialY = 50;
    level.initialSpells = [ 'anagram', 'change-letter', 'remove-letter' ];
    level.initialInventory = {};
    level.backgroundMusicFile = undefined;
    level.allWords = [ 'asp','bootie','bowtie','nap','pan','paw','sap','saw','soap','sop','spa','tap','tench','trench','wrench','wretch' ];
    level.initialThings = [ ['trench','entry',40,50],['soap','entry',50,50],['bowtie','entry',60,50] ];
    level.initialRunes = [];

    level.rooms = {
        'entry': {
            boundaries: [],
            filledPolygons: [],
            passages: [  [new Passage(PassageTypes.BASIC_RIGHT, 'E',95, 50, 'room2', 10, 50, true, 50, 50)], [new Passage(PassageTypes.BASIC_RIGHT, 'W',5, 50, 'room2', 90, 50, true, 50, 50)]],
        },
    };
    return level;
}