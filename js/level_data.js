/* level_data.js */
/* this file has two sections, first the word-related data and code,
   then the more general level data (rooms, passages, boundaries etc.)
 */

/* SECTION 1 -- WORD-RELATED DATA AND CODE */


let allWords = [ 'arts',  'asteroid',  'ace',  'adder',  'amp',  'axle', 'bat',  'bath',  'boar',  'board',  'brook',  'bulls-eyes',
    'carts',
    'cabinet',  'chive',
    'clam',  'clamp',  'cow',  'cowl',  'crow',  'crown',  'darts',  'drawer',  'eel',  'flock',  'ghost',
    'heel',  'hive',  'host',
    'keel',  'ladder',  'lamp',  'leek',  'lock',  'mace',  'mantra',  'mantrap', 'maps', 'meteor',  'owl',  'pan',  'parts',
    'peel',  'portcullis',
    'rat',  'reed',  'reward',  'spa',  'spam',  'span',  'star',  'steroid',  'strad',  'strap',  'straw',  'stream',
    'tab',  'tar',  'taro',
    'tarot',  'toll machine',  'tuna',  'warts',  'wheel',  ];

let solidObjects = [ 'brook', 'bulls-eyes','portcullis','cabinet','stream','cow','lock','spa','bath','ceiling',
    'ghost','dresser','pools','mantrap','meteor','asteroid' ];

// TODO: maybe make solid objects immovable by default so you don't have to list them twice?

let immovableObjects = [ 'axle','brook','bulls-eyes','drawer','portcullis','cabinet','stream','flock','lock','cow','bath','spa',
    'span','ghost','host','meteor','asteroid','board','boar','pools','mantrap','dresser' ];

let bridgelikeObjects = [ 'span', 'ladder' ];

let ellipticalObjects = [ 'clam', 'meteor', 'asteroid'];

class Asteroid extends Thing {
    displayCantPickUpMessage() {
        displayMessage('Too heavy!');
    }
}

class Board extends Thing {
    okayToDisplayWord() {
        if (currentRoom === 'darkroom' && 'board' in thingsHere && !('lamp' in inventory || 'lamp' in thingsHere)) {
            return false;
        }
        else
            return true;
    }
    extraTransformFromBehavior() {
        if (currentRoom === 'darkroom') {
            // door is unboarded so make all passages in room activated:
            for (let i=0; i<passages.length; i++) {
                passages[i].activated = true;
            }
        }
    }
}

class Bullseyes extends Thing {
    draw() {
        if (typeof otherData['darts thrown time'] == 'undefined' || Date.now() < otherData['darts thrown time'] + 1000) {
            // draw normally
            return super.draw();
        }
        else if (Date.now() >= otherData['darts thrown time'] + 5000) {
            // fully retracted, so delete:
            delete thingsHere['bulls-eyes'];
            return;
        }
        else {
            // otherwise draw the "retracting" behavior:
            let deltaY = 200 * ((Date.now() - otherData['darts thrown time'] - 1000) / 4000);
            ctx.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight + deltaY);
            for (let i=0; i<3; i++) {
                ctx.drawImage(otherData['dart image'],otherData['bulls-eye coordinates'][i][0],otherData['bulls-eye coordinates'][i][1] + deltaY);
            }
            ctx.fillStyle = 'white';
            ctx.beginPath();
            let pct1 = 30; let pct2 = 92;
            ctx.moveTo((46 + (pct1/2)) * xScaleFactor, pct1 * yScaleFactor + 5);
            ctx.lineTo((46 + (pct2/2)) * xScaleFactor, pct2 * yScaleFactor + 5);
            ctx.lineTo((46 + (pct2/2)) * xScaleFactor, PLAY_AREA_HEIGHT);
            ctx.lineTo((46 + (pct1/2)) * xScaleFactor, PLAY_AREA_HEIGHT);
            ctx.lineTo( (46 + (pct1/2)) * xScaleFactor, pct1 * yScaleFactor + 5);
            ctx.closePath();
            ctx.fill();
            drawInventory(); // because this image might overwrite the inventory area.
        }
    }
}

class Cabinet extends Thing {
    handleClick() {
        if (spellsAvailable.indexOf('add-edge') < 0)
            addSpellToBinder('add-edge');
    }
}

class Chive extends Thing {
    update() {
        if (Date.now() < this.timeOfCreation + 1900) {
            const relTime = Date.now() - this.timeOfCreation;
            this.x = this.initialX + (18 * Math.sin(relTime / 120));
            this.y = this.initialY + (relTime / 14);
        }
    }
    extraTransformIntoBehavior() {
        if (otherData['hive in place'] === true) {
            // remove the invisible boundary caused by the hive:
            for (let i = 0;i < boundaries.length; i++) {
                if (boundaries[i][0] === 'i')
                    boundaries.splice(i);
            }
        }
        otherData['hive in place'] = false;
    }
}

class Darts extends Thing {
    handleClick() {
        if (('darts' in inventory) && (currentRoom === 'game room') && ('bulls-eyes' in thingsHere)) {
            otherData['darts origin'] = [player.x, player.y];
            otherData['darts thrown time'] = Date.now();
            otherData['darts deltas'] = [];
            for (let i=0; i < 3; i++) {
                otherData['darts deltas'].push( [otherData['bulls-eye coordinates'][i][0] - player.x, otherData['bulls-eye coordinates'][i][1] - player.y] );
            }
            sounds['whoosh'].play();
            delete inventory['darts'];
        }
        else {
            return super.handleClick();
        }
    }
}

class Drawer extends Thing {
    handleClick() {
        if (Date.now() < this.beginMovementTime + this.movementDurationMS) {
            return; // don't interrupt movement in progress.
        }
        sounds['whoosh'].play();
        this.movementDurationMS = 1000;
        this.beginMovementTime = Date.now();
        this.initialX = this.x;
        this.initialY = this.y;
        this.destY = this.y;
        if (otherData['drawer open'] === true) {
            this.destX = this.x + 40;
            otherData['drawer open'] = false;
        }
        else {
            this.destX = this.x - 40;
            otherData['drawer open'] = true;
            if (spellsAvailable.indexOf('reversal') < 0) {
                addSpellToBinder('reversal');
            }
        }
    }
}

class Dresser extends Thing {
    handleClick() { // don't do anything; don't interfere with clicking drawer which is superimposed on this.
    }
}

class Ghost extends Thing {
    update() {
        this.y = 12 * Math.sin(((Date.now() - this.timeOfCreation) / 300) ) + this.initialY;
        super.update();
    }
}

class Host extends Thing {
    constructor(word, room, x, y) {
        super(word, room, x, y);
        sounds['host_speech'].play();
    }
    draw() {
        let t = Date.now() - this.timeOfCreation;
        if (t < 5000) {
            return super.draw();
        }
        if (t >= 5000 + 3000) {
            delete thingsHere['host'];
            return;
        }

        let fractionOfTheWayToEnd = (t - 5000) / 3001;
        let fractionSquared = fractionOfTheWayToEnd * fractionOfTheWayToEnd;
        ctx.globalAlpha = 1.0 - fractionSquared;
        let newX = (fractionOfTheWayToEnd * 100) * (Math.sin(fractionSquared * 25)) + (this.x - this.halfWidth);
        let newY = (fractionOfTheWayToEnd * 100) * (Math.cos(fractionSquared * 25)) + (this.y - this.halfHeight);
        ctx.drawImage(this.image, newX, newY, this.width, this.height);
        ctx.globalAlpha = 1.0;

    }
}

class Mantra extends Thing {
    constructor(word, room, x, y) {
        super(word, room, x, y);
        //    sounds['om'].play();
    }
    draw() {
        let t = Date.now() - this.timeOfCreation;
        if (t >= 3000) {
            delete thingsHere['mantra'];
            return;
        }
        let fractionOfTheWayToEnd =  t / 3001;
        let fractionSquared = fractionOfTheWayToEnd * fractionOfTheWayToEnd;
        ctx.globalAlpha = 1.0 - fractionOfTheWayToEnd;
        let newX = 30 * (Math.sin(fractionOfTheWayToEnd * 25)) + (this.x - this.halfWidth);
        let newY = (this.y - this.halfHeight) - (fractionOfTheWayToEnd * 180);
        ctx.drawImage(this.image, newX, newY, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }
}

class Mantrap extends Thing {
    handleCollision() {
        displayMessage('yikes!', this.x, this.y);
    }
}

class Maps extends Thing {
    handleClick() {
        if (otherData['showing maps'] === true) {
            otherData['showing maps'] = false;
            normalPlayerInputSuppressed = false;
        }
        else if ('maps' in inventory) {
            otherData['showing maps'] = true;
            normalPlayerInputSuppressed = true;
        }
        else {
            return super.handleClick();
        }
    }
}

class Meteor extends Thing {
    displayCantPickUpMessage() {
        displayMessage('Too heavy!');
    }
}

class Portcullis extends Thing {
    draw() {
        let startTime = (currentRoom === 'secret room') ? otherData['wheel turned time'] : otherData['toll paid time'];
        if (typeof startTime == 'undefined' || Date.now() < startTime + 1000) {
            // draw normally
            return super.draw();
        } else if (Date.now() >= startTime + 5000) {
            // fully retracted, so delete:
            delete thingsHere['portcullis'];
            return;
        } else {
            // otherwise draw the "retracting" behavior:
            let deltaY = -300 * ((Date.now() - startTime - 1000) / 4000);
            ctx.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight + deltaY);
            /*            ctx.fillStyle = 'white';
                        ctx.beginPath();
                        let pct1 = 30;
                        let pct2 = 92;
                        ctx.moveTo((46 + (pct1 / 2)) * xScaleFactor, pct1 * yScaleFactor + 5);
                        ctx.lineTo((46 + (pct2 / 2)) * xScaleFactor, pct2 * yScaleFactor + 5);
                        ctx.lineTo((46 + (pct2 / 2)) * xScaleFactor, PLAY_AREA_HEIGHT);
                        ctx.lineTo((46 + (pct1 / 2)) * xScaleFactor, PLAY_AREA_HEIGHT);
                        ctx.lineTo((46 + (pct1 / 2)) * xScaleFactor, pct1 * yScaleFactor + 5);
                        ctx.closePath();
                        ctx.fill();
                        drawInventory(); // because this image might overwrite the inventory area.  */
        }
    }
}

class Reward extends Thing {
    handleClick() {
        if (currentRoom === 'beyond' && 'reward' in inventory) {
            let tollMachine = thingsHere['toll machine'];
            if (tollMachine.inRangeOfPlayer(EXTRA_SPELL_RADIUS)) {
                thingsHere['reward'] = this;
                delete inventory['reward'];
                this.movable = false; // so player can't pick up again as it moves into toll machine
                this.beginMovementTime = Date.now();
                this.movementDurationMS = 1500;
                this.initialX = player.x;
                this.initialY = player.y;
                this.destX = tollMachine.x;
                this.destY = tollMachine.y;
            }
            else {
                return super.handleClick();
            }
        }
        else {
            return super.handleClick();
        }
    }
    update() {
        if (this.beginMovementTime > 0 && Date.now() > this.beginMovementTime + this.movementDurationMS) {
            // sounds['kaching'].play();
            otherData['toll paid time'] = Date.now();
            delete thingsHere['reward'];
        }
        else {
            return super.update();
        }
    }
}

class Spa extends Thing {
    constructor(word, room, x, y) {
        super(word, room, x, y);
        this.images = [this.image, new Image(196, 172)];
        this.images[1].src = 'imgs/things/spa-2.png';
    }
    draw() {
        let t = Date.now() - this.timeOfCreation;
        let frame = ( Math.round(t / 100) % 2);
        ctx.drawImage(this.images[frame], this.x - this.halfWidth, this.y - this.halfHeight, this.images[frame].width, this.images[frame].height);
    }
}

class Steroid extends Thing {
    handleClick() {
        // TODO: play "glug glug" sound
        displayMessage('I feel so strong now!');
        delete thingsHere['steroid'];
        delete inventory['steroid'];
        if (typeof thingsHere['meteor'] != 'undefined') {
            thingsHere['meteor'].movable = true;
        }
    }
    extraTransformIntoBehavior() {
        if (currentRoom === 'asteroid room' && 'steroid' in thingsHere) {
            this.x -= 30; // move closer so player can reach it.
        }
    }
}

class Wheel extends Thing {
    handleClick() {
        if (!('axle' in thingsHere)) { // the special case to handle here is dropping wheel to affix to axle. if no axle, no special behavior:
            return super.handleClick();
        }
        let axle = thingsHere['axle'];
        if (this.movable === false) { // this will be the case iff it's already been affixed to the axle
            if (typeof otherData['wheel turned time'] === 'undefined' || otherData['wheel turned time'] == 0) {
                // TODO: play wheel sound
                // TODO: maybe make it possible to turn the portcullis back down??
                otherData['wheel turned time'] = Date.now();
            }
            return;
        }
        else if (('wheel' in inventory) && axle.inRangeOfPlayer(EXTRA_SPELL_RADIUS)) {
            this.initialX = player.x;
            this.initialY = player.y;
            this.beginMovementTime = Date.now();
            this.movementDurationMS = 800;
            this.destX = axle.x - 15;
            this.destY = axle.y;
            this.movable = false; // can't pick up anymore once affixed to axle.
        }
        return super.handleClick();
    }
}

function getThing(word, room, x, y, treatXandYasPercentages = true, otherArgs = undefined) {
    if (treatXandYasPercentages) {
        x = x * xScaleFactor;
        y = y * yScaleFactor;
    }
    switch (word) {
        case 'asteroid' : return new Asteroid(word, room, x, y);
        case 'board' : return new Board(word,room,x,y,);
        case 'bulls-eyes' : return new Bullseyes(word,room,x,y);
        case 'cabinet' : return new Cabinet(word, room, x, y);
        case 'chive' : return new Chive(word,room,x,y);
        case 'darts' : return new Darts(word,room,x,y);
        case 'drawer' : return new Drawer(word,room,x,y);
        case 'dresser': return new Dresser(word,room,x,y);
        case 'ghost' : return new Ghost (word, room, x, y);
        case 'host' : return new Host (word, room, x, y);
        case 'mantra' : return new Mantra (word, room, x, y);
        case 'mantrap' : return new Mantrap (word, room, x, y);
        case 'maps' : return new Maps(word,room,x,y);
        case 'meteor' : return new Meteor(word, room, x, y);
        case 'portcullis' : return new Portcullis(word,room,x,y);
        case 'reward': return new Reward(word,room,x,y);
        case 'steroid' : return new Steroid(word, room, x, y);
        case 'spa' : return new Spa (word, room, x, y);
        case 'wheel' : return new Wheel (word,room,x,y);
        default : return new Thing (word, room, x, y);
    }
}

/* SECTION 2 -- GENERAL LEVEL-RELATED DATA AND CODE (ROOMS, PASSAGES, BOUNDARIES, ETC.) */

let levelData = {};

function getLevelData(levelName) {
    switch(levelName) {
        case '1': return {
            initialRoom: 'entry point',
            initialX: 20, // expressed as % of way across x axis, i.e. value range is 0-100
            initialY: 50,
            initialSpells: ['remove-edge','add-edge'],
            initialInventory: {},
            otherGameData: { 'hive in place':true,
                'last hive trigger time':0,
                'bee image':new Image(),
                'bulls-eye coordinates':[ [435,170], [480,230], [525,295]],
                'dart image':new Image(),
                'showing maps':false,
                'maps image':new Image(),
                'drawer open': false,
            },
            initialThings: {
                'maps': getThing('maps','entry point',50,50),

                'asteroid' : getThing('asteroid', 'asteroid room', 70, 43),
                'axle': getThing('axle','secret room',84,62),
                'bath': getThing('bath','bathroom',25,70),
                'board': getThing('board','darkroom',90,62),
                'bulls-eyes': getThing('bulls-eyes', 'game room', 78, 50),
                'cabinet': getThing('cabinet','bathroom',25,25),
                'clam': getThing('clam', 'kitchen', 50, 50),
                'crown': getThing('crown','crown room',50,50),
                'darts': getThing('darts','game room',40,40),
                'dresser':getThing('dresser','beyond',26,80),
                'drawer': getThing('drawer','beyond', 26, 73),
                'ghost' : getThing('ghost', 'entry hall 1', 40, 50) ,
                'hive': getThing('hive','hive room',43,35),
                'leek': getThing('leek','kitchen',70,50),
                'mace': getThing('mace','armory', 50, 50),
                'meteor' : getThing('meteor', 'asteroid room', 70, 60),
                'mantrap' : getThing('mantrap', 'main', 50, 23) ,
                'portcullis': getThing('portcullis', 'beyond', 69, 37),
                'portcullis2' : getThing('portcullis', 'secret room',70,37),
                'spa' : getThing('spa', 'bathroom', 67,36) ,
                'statue1' : getThing('statue','statue room', 21, 23),
                'statue2' : getThing('statue','statue room', 51, 23),
                'statue3' : getThing('statue','statue room', 81, 23),
                'statue4' : getThing('statue','statue room', 21, 77),
                'statue5' : getThing('statue','statue room', 51, 77),
                'statue6' : getThing('statue','statue room', 81, 77),
                'straw': getThing('straw', 'hive room', 23, 65),
                'stream': getThing('stream','stream room', 50, 50),
                'toll machine': getThing('toll machine', 'beyond', 85,60),
                'treasure': getThing('treasure', 'stream room', 90, 80),
                'wheel':getThing('wheel','secret room',40,60),
            },

            initialRunes: ['p','n', 'c'],
            rooms: {
                'armory': {
                    boundaries: [['n',30,30,60,30],['n',60,30,60,75], ['n',60,75,30,75], ['n',30,75,30,30,],],
                    passages:[ new Passage(PassageTypes.SECRET_LEFT, 30,50,'game room',60,52)],
                },
                'asteroid room': {
                    boundaries: [ ['n',0,40,60,40], ['n',60,40,60,10], ['n',60,10,100,40], ['n',0,60,60,60], ['n',60,60,60,90], ['n',60,90,100,60] ],
                    passages: [ new Passage(PassageTypes.INVISIBLE_HORIZONTAL,0,50,'main',89,50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL,100,50,'kitchen',12,50)],
                },
                'bathroom': {
                    boundaries:[ ['n',15,15,85,15], ['n',85,15,85,85], ['n',85,85,15,85], ['n',15,85,15,15], ],
                    passages:[ new Passage(PassageTypes.BASIC_HORIZONTAL,50,80,'main',50,11),
                        new Passage(PassageTypes.BASIC_RIGHT,85,65,'game room',12,50),],
                },
                'beyond':{
                    boundaries: [ ['n',4,40,4,0], ['n',4,0,30,0], ['n',30,0,61,46], ['n',61,46,61,5], ['n',61,5,76,28], ['n',76,28,76,69], ['n',76,69,100,100], ['n',100,100,4,100], ['n',4,100,4,60], ],
                    passages: [ new Passage(PassageTypes.BASIC_LEFT,4,50,'darkroom',70,66),
                           new Passage(PassageTypes.INVISIBLE_HORIZONTAL,78,50,'crown room',42,50),],
                },
                'crown room':{
                    boundaries: [['n',30,30,60,30],['n',60,30,60,75], ['n',60,75,30,75], ['n',30,75,30,30,],],
                    passages:[ new Passage(PassageTypes.BASIC_LEFT, 30,50,'beyond',60,50)],
                },
                'darkroom':{
                    boundaries:[ ['n',10,20,90,20], ['n',90,20,90,82], ['n',90,82,10,82], ['n',10,82,10,20]],
                    passages:[ new Passage(PassageTypes.BASIC_HORIZONTAL, 50, 20, 'main', 50, 89),
                        new Passage(PassageTypes.BASIC_RIGHT, 90, 60, 'beyond', 11, 60, false)]
                },
                'entry point': {
                    boundaries: [ ['n',10, 36, 30, 36], ['n',10,64,30,64], ['n',10,36,10,64], ['d',30,36,42,18], ['n',42,18,54,18],
                        ['d',54,18,66,36], ['n',66,36,100,36], ['d',30,64,42,82], ['n',42,82,54,82], ['d',54,82,66,64], ['n',66,64,100,64] ],
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'entry hall 1', 11, 50)],
                },
                'entry hall 1': {
                    boundaries: [ ['n',0,36,100,36], ['n',0,64,75,64], ['n',75,64,75,100], ['n',92,100,92,64], ['n',92,64,100,64]] ,
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'entry point', 90, 50),
                            new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'statue room', 11, 50),
                            new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 84, 100, 'hive room', 84, 10),
                    ],
                },
                'entry hall 2': {
                    boundaries: [ ['n',0,36,100,36], ['n',0,64,100,64], ] ,
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'entry hall 1', 90, 50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'statue room', 11, 50)
                    ],
                },
                'game room': {
                    boundaries: [ ['n',4,40,4,0], ['n',4,0,46,0], ['n',46,0,96,100], ['n',96,100,4,100], ['n',4,100,4,60], ],
                    passages: [ new Passage(PassageTypes.BASIC_LEFT,4,50,'bathroom',70,66),
                        new Passage(PassageTypes.SECRET_RIGHT,75,49,'armory',42,50),],
                },
                'hive room': {
                    boundaries: [ ['n',75,0,75,50], ['n',92,0,92,72], ['n',75,50,50,50], ['n',50,50,50,25], ['n',50,25,15,25], ['n',15,25,15,72], ['n',15,72,92,72],
                        ['i',50,50,50,72], ],
                    passages: [new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 84, 0, 'entry hall 1', 84, 90), ]
                },
                'kitchen': {
                    boundaries: [ ['n',0,30,10,30], ['n',10,30,10,20], ['n',10,20,90,20], ['n',90,20,90,80], ['n',90,80,10,80], ['n',10,80,10,70], ['n',10,70,0,70], ],
                    passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL,0,50,'asteroid room',88,50),],
                },
                'main': {
                    boundaries: [ ['n',0,36,40,36], ['n',40,36,40,0], ['n',60,0,60,36], ['n',60,36,100,36], ['n',100,64,60,64], ['n',60,64,60,100], ['n',40,100,40,64], ['n',40,64,0,64] ],
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'statue room', 90, 50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL,100,50,'asteroid room',15,50),
                        new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 50, 0, 'bathroom',45,60),
                        new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 50, 100, 'darkroom',50,32),
                    ]
                },
                'secret room': {
                    boundaries: [ ['n',12,100,12,0], ['n',12,0,28,0], ['n',28,15,28,42],  ['n',28,42,60,42], ['n',60,42,100,100], ['n',100,100,12,100], ],
                    passages: [ new Passage(PassageTypes.BASIC_RIGHT, 28, 14, 'statue room', 49, 78),
                        new Passage(PassageTypes.INVISIBLE_HORIZONTAL,78,50,'stream room',12,50), ],
                },
                'statue room': {
                    boundaries: [ ['n',0,36,12,36], ['n',12,36,12,10], ['n',12,10,30,10], ['n',30,10,30,36], ['n',30,36,42,36],
                        ['n',42,36,42,10], ['n',42,10,60,10], ['n',60,10,60,36], ['n',60,36,72,36], ['n',72,36,72,10], ['n',72,10,90,10], ['n',90,10,90,36], ['n',90,36,100,36],
                        ['n',0,64,12,64], ['n',12,64,12,90], ['n',12,90,30,90], ['n',30,90,30,64], ['n',30,64,42,64], ['n',42,64,42,90], ['n',42,90,60,90],
                        ['n',60,90,60,64], ['n',60,64,72,64], ['n',72,64,72,90], ['n',72,90,90,90], ['n',90,90,90,64], ['n',90,64,100,64], ] ,
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'entry hall 1', 90, 50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'main', 11, 50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL, 41, 91, 'secret room', 20, 20),
                    ],
                },
                'stream room': {
                    boundaries: [ ['n',0,35,5,35], ['n',5,35,5,15], ['n',5,15,90,15], ['n',90,15,90,85], ['n',90,85,5,85], ['n',5,85,5,65], ['n',5,65,0,65], ],
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'secret room', 60, 50)],
                },
            },
            levelSpecificInitialization: function() {
                console.log('yo');
                otherData['bee image'].src = 'imgs/things/bees-1.png';
                otherData['bee sound'] = new Audio('audio/481647__joncon-library__bee-buzzing.wav');
                otherData['dart image'].src = 'imgs/things/dart.png';
                otherData['maps image'].src = 'imgs/things/maps-display.png';
            },
            levelSpecificNewRoomBehavior: function(roomName) {
                if (roomName === 'hive room' && otherData['hive in place'] === false) {
                    // remove the invisible boundary caused by the hive:
                    for (let i = 0;i < boundaries.length; i++) {
                        if (boundaries[i][0] === 'i')
                            boundaries.splice(i);
                    }
                }
                else if (roomName === 'darkroom' && !('lamp' in inventory)) {
                    displayMessage("It's dark here!");
                }
            },
            levelSpecificAnimateLoopBehavior : function() {
                if (currentRoom === 'darkroom') {
                    ctx.fillStyle = 'black';
                    if (!('lamp' in inventory || 'lamp' in thingsHere)) {
                        ctx.fillRect(0, 0, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
                        player.draw(); // draw the player again ... inefficient but easier than setting up logic to determine layers relative to black rectangle
                        passages[0].draw();
                    }
                    else {
                        let lampX, lampY;
                        if ('lamp' in inventory) {
                            lampX = player.x;
                            lampY = player.y - 40;
                            ctx.drawImage(inventory['lamp'].image,lampX,lampY,53,48);
                        }
                        else {
                            lampX = thingsHere['lamp'].x;
                            lampY = thingsHere['lamp'].y;
                        }
                        ctx.fillRect(0,0,PLAY_AREA_WIDTH, lampY-100);
                        ctx.fillRect(0,lampY-100,lampX-100,PLAY_AREA_HEIGHT-(lampY-100));
                        ctx.fillRect(lampX-100,lampY+100,PLAY_AREA_WIDTH-(lampX-100),PLAY_AREA_HEIGHT-(lampY+100));
                        ctx.fillRect(lampX+100,lampY-100,PLAY_AREA_WIDTH-(lampX+100),200);
                        if ('lamp' in thingsHere) {
                            player.draw(); // draw the player again ... inefficient but easier than setting up logic to determine layers relative to black rectangle
                        }
                    }
                } // end darkroom behavior

                else if (currentRoom === 'game room' && typeof otherData['darts thrown time'] != 'undefined' && Date.now() < otherData['darts thrown time'] + 3000) {
                    if (Date.now() < otherData['darts thrown time'] + 1000) {
                        const fractionTraversed = (Date.now() - otherData['darts thrown time']) / 1000;
                        for (let i = 0; i < 3; i++) {
                            let x = otherData['darts origin'][0] + (fractionTraversed * (otherData['bulls-eye coordinates'][i][0] - otherData['darts origin'][0]));
                            let y = otherData['darts origin'][1] + (fractionTraversed * (otherData['bulls-eye coordinates'][i][1] - otherData['darts origin'][1]));
                            ctx.drawImage(otherData['dart image'], x, y);
                        }
                    }
                } // end game room behavior

                else if (currentRoom === 'hive room' && otherData['hive in place'] === true) {
                    if (Date.now() <= otherData['last hive trigger time'] + 3000) {
                        // running bee animation
                        const hiveX = thingsHere['hive'].x;
                        const hiveY = thingsHere['hive'].y;
                        for (let i = 0; i < otherData['bee data'].length; i++) {
                            let beeData = otherData['bee data'][i];
                            if (Date.now() > beeData.endTime)
                                continue;
                            let relTime = Date.now() - beeData.startTime;
                            if (relTime < 0)
                                continue;
                            let x = hiveX + (beeData.xRange * (Math.cos(relTime * beeData.xFreqCoefficient)-2) );
                            let y = hiveY + (beeData.yRange * (Math.sin(relTime * beeData.yFreqCoefficient)));
                            ctx.drawImage(otherData['bee image'],x,y);
                        }
                    } else if (player.x < (56 * xScaleFactor)) {
                        // start bee animation
                        displayMessage('yikes!');
                        otherData['bee sound'].play();
                        otherData['last hive trigger time'] = Date.now();
                        otherData['bee data'] = [];
                        for (let i = 0; i < 6; i++) {
                            let startTime = 600 * Math.random() + Date.now();
                            let endTime = Date.now() + 2400 - (500 * Math.random());
                            let numCycles = Math.round(4 * Math.random() + 3);
                            let xFreqCoefficient = (2 * Math.PI * numCycles / (endTime - startTime));
                            let yFreqCoefficient = (Math.PI / (endTime - startTime));
                            let xRange = 40 * Math.random() + 20;
                            let yRange = 60 * Math.random() + 75;
                            let beeData = { startTime:startTime, endTime:endTime,
                                xFreqCoefficient:xFreqCoefficient, yFreqCoefficient:yFreqCoefficient, xRange:xRange, yRange:yRange};
                            otherData['bee data'].push(beeData);
                        }
                    }
                } // end hive room behavior

                if (otherData['showing maps'] === true) {
                    ctx.drawImage(otherData['maps image'],0,0);
                }

            },
            levelSpecificKeydownBehavior : function(e) {
                return false; // returning "true" will tell the main keydown handler that the event was handled here, so ignore it.
            },
            levelSpecificClickBehavior : function(xWithinCanvas,yWithinCanvas) {
                if (otherData['showing maps'] === true) {
                    otherData['showing maps'] = false;
                    normalPlayerInputSuppressed = false;
                    return true;
                }

                return false;// returning "true" will tell the main keydown handler that the event was handled here, so ignore it.
            },
            levelSpecificPostTransformBehavior : function(fromWord, toWord) {

            },
        }; break;

        case '2': return {}; break;
    }
}
