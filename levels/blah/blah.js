/* blah.js */

levelList.push( { name:'blah', difficulty:0 } );

getLevelFunctions['blah'] = function() {

    let level = new Level('blah');
    level.levelPath = 'blah';

    level.defineThingSubclasses = function() { 

        window.Ape = class Ape extends Thing {
        }

        window.Asp = class Asp extends Thing {
        }

        window.Foe = class Foe extends Thing {
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
            case 'ape' : return new Ape(word,room,x,y);
            case 'asp' : return new Asp(word,room,x,y);
            case 'foe' : return new Foe(word,room,x,y);
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
    level.allWords = [ 'ape','asp','bootee','bootie','bowtie','foe','fop','nap','ore','pan','paw','pea','roe','row','sap','saw','sea','soap','sop','sow','spa','tap','tench','toe','trench','wrench','wretch' ];
    level.initialThings = [ ['soap','entry',40,50],['bowtie','entry',50,50],['trench','room2',40,50],['foe','room3',40,50] ];
    level.initialRunes = [];

    level.rooms = {
        'entry': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E',95, 50, 'room2', 10, 50, true, 50, 50),
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'W',5, 50, 'room3', 90, 50, true, 50, 50)],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'W',5, 50, 'entry', 90, 50, true, 50, 50),
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'N',50, 5, 'room4', 50, 90, true, 50, 50, 'trench', 50, 50)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'E',95, 50, 'entry', 10, 50, true, 50, 50),
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'W',5, 50, 'room5', 90, 50, true, 50, 50, 'foe', 50, 50)],
        },
        'room4': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_VERTICAL, 'S',50, 90, 'room2', 50, 10, true, 50, 50)],
        },
    };
    return level;
}