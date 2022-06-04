/* pews-tag.js */

/* code generated by command: python3 create_level.py "name=pews-tag" "initialSpells=reversal,change-letter" "initialRunes=b,c,t" "targetThing=gem" "room=name:room1,things:pews balcony,exits:" "room=name:room2,things:tag pugilist,exits:E/room2/pugilist" "room=name:room3,things:hoecake mud,exits:" */

levelList.push( { name:'pews-tag', difficulty:0 } );

getLevelFunctions['pews-tag'] = function() {

    let level = new Level('pews-tag');
    level.folderName = 'pews-tag';

    level.defineThingSubclasses = function() { 

        window.Bag = class Bag extends Thing {
        }

        window.Balcony = class Balcony extends Thing {
        }

        window.Bat = class Bat extends Thing {
        }

        window.Bed = class Bed extends Thing {
        }

        window.Bee = class Bee extends Thing {
        }

        window.Bug = class Bug extends Thing {
        }

        window.Bugs = class Bugs extends Thing {
        }

        window.Bum = class Bum extends Thing {
        }

        window.Cad = class Cad extends Thing {
        }

        window.Cads = class Cads extends Thing {
        }

        window.Cue = class Cue extends Thing {
        }

        window.Cut = class Cut extends Thing {
        }

        window.Dam = class Dam extends Thing {
        }

        window.Dams = class Dams extends Thing {
        }

        window.Map = class Map extends Thing {
        }

        window.Maps = class Maps extends Thing {
        }

        window.Mud = class Mud extends Thing {
        }

        window.Muds = class Muds extends Thing {
        }

        window.Mug = class Mug extends Thing {
        }

        window.Mugs = class Mugs extends Thing {
        }

        window.Peat = class Peat extends Thing {
        }

        window.Pugilist = class Pugilist extends Thing {
        }

        window.Seam = class Seam extends Thing {
        }

        window.Step = class Step extends Thing {
        }

        window.Tap = class Tap extends Thing {
        }

        window.Taps = class Taps extends Thing {
        }

    }

    level.getThing = function(word,room,x,y) {
        switch (word) {
            case 'bag' : return new Bag(word,room,x,y);
            case 'balcony' : return new Balcony(word,room,x,y);
            case 'bat' : return new Bat(word,room,x,y);
            case 'bed' : return new Bed(word,room,x,y);
            case 'bee' : return new Bee(word,room,x,y);
            case 'bug' : return new Bug(word,room,x,y);
            case 'bugs' : return new Bugs(word,room,x,y);
            case 'bum' : return new Bum(word,room,x,y);
            case 'cad' : return new Cad(word,room,x,y);
            case 'cads' : return new Cads(word,room,x,y);
            case 'cue' : return new Cue(word,room,x,y);
            case 'cut' : return new Cut(word,room,x,y);
            case 'dam' : return new Dam(word,room,x,y);
            case 'dams' : return new Dams(word,room,x,y);
            case 'map' : return new Map(word,room,x,y);
            case 'maps' : return new Maps(word,room,x,y);
            case 'mud' : return new Mud(word,room,x,y);
            case 'muds' : return new Muds(word,room,x,y);
            case 'mug' : return new Mug(word,room,x,y);
            case 'mugs' : return new Mugs(word,room,x,y);
            case 'peat' : return new Peat(word,room,x,y);
            case 'pugilist' : return new Pugilist(word,room,x,y);
            case 'seam' : return new Seam(word,room,x,y);
            case 'step' : return new Step(word,room,x,y);
            case 'tap' : return new Tap(word,room,x,y);
            case 'taps' : return new Taps(word,room,x,y);
            default : return undefined; // this will cause instantiation of plain-vanilla Thing.
        }
    }
    level.initialRoom = 'room1';
    level.initialX = 55; // expressed as % of way across x axis, i.e. value range is 0-100 
    level.initialY = 75;
    level.initialSpells = [ 'reversal', 'change-letter' ];
    level.initialInventory = {};
    level.backgroundMusicFile = undefined;
    level.allWords = [ 'bag','balcony','bat','bed','bee','bud','buds','bug','bugs','bum','bus','cab','cabs','cad','cads','cam','camp','cams','cap','cape','caps','cat','cats','cub','cubs','cud','cue','cup','cut','cwm','cwms','dace','dam','dame','dams','daw','daws','dec','decs','dew','dews','gap','gaps','gem','gum','gut','hoecake','hotcake','mac','macs','map','maps','mat','mats','meat','mew','mews','mud','muds','mug','mugs','mus','pad','pads','paw','paws','pea','peas','peat','peg','pegs','pest','pet','pets','pew','pews','pub','pubs','pug','pugilist','pugs','scam','seam','seat','smew','spam','spat','stem','step','stew','sub','sum','tab','tag','tags','tam','tams','tap','tape','taps','tau','taus','tea','team','teas','tee','tees','test','tub','tug','tugs','wad','wads' ];
    level.initialThings = [ ['pews','room1',40,81],['balcony','room1',60,81],['tag','room2',40,81],['pugilist','room2',81,68],['hoecake','room3',40,81],['mud','room3',60,81] ];
    level.targetThing = 'gem';
    level.immovableObjects = [];
    level.bonusWords = [];
    level.initialRunes = ['b','c','t'];
    level.sounds = {};
    level.additionalImageNamesToPreload = [];

    level.rooms = {
        'room1': {
            boundaries: [],
            filledPolygons: [],
            passages: [ ],
        },
        'room2': {
            boundaries: [],
            filledPolygons: [],
            passages: [ 
               new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 'E',97, 77, 'room2', 10, 77, true, 50, 77, 'pugilist', PASSAGE_STATE_BLOCKED, 73, 77)],
        },
        'room3': {
            boundaries: [],
            filledPolygons: [],
            passages: [ ],
        },
    };
    return level;
}