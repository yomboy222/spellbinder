/* ghost_level.js */

/* todo:
    amp image, consider whether resulting L can be used
    peel, gun, gunk, musketeer (skeleton?)
 */

levelList.push( {name:'ghost level', difficulty:5});

getLevelFunctions['ghost level'] = function() {

    let level = new Level('ghost level');
    level.levelPath = 'ghost_level';

    level.defineThingSubclasses = function () {

        window.Boar = class Boar extends Thing{
            extraTransformIntoBehavior() {
                window.setTimeout(this.leaveRoom.bind(this),1200);
                this.deleteAfterMovement = true; // so if player leaves room before running-away process is done, still deleted.
            }

            leaveRoom() {
                this.movementDurationMS = 1000;
                this.beginMovementTime = Date.now();
                this.destX = 50 * xScaleFactor;
                this.destY = 33 * yScaleFactor;
                this.deleteAfterMovement = true;
            }
        }

        window.Board = class Board extends Thing {
            okayToDisplayWord() {
                if (currentRoom === 'darkroom' && 'board' in thingsHere && !(level.carryingLamp())) {
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

        window.Bullseyes = class Bullseyes extends Thing {
            draw() {
                if (typeof otherData['darts thrown time'] == 'undefined' || Date.now() < otherData['darts thrown time'] + 1000) {
                    // draw normally
                    return super.draw();
                }
                else if ((Date.now() >= otherData['darts thrown time'] + 5000)) {
                    // fully retracted, so delete:
                    delete thingsHere['dartboard'];
                    return;
                }
                else {
                    // otherwise draw the "retracting" behavior:
                    this.deleteCaptionIfAny();
                    let deltaY = 200 * ((Date.now() - otherData['darts thrown time'] - 1000) / 4000);
                    ctx.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight + deltaY);
                    for (let i=0; i<3; i++) {
                        ctx.drawImage(otherData['dart image'],otherData['bulls-eye coordinates'][i][0],otherData['bulls-eye coordinates'][i][1] + deltaY);
                    }
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    let pct1 = 30; let pct2 = 89;
                    ctx.moveTo((46 + (pct1/2)) * xScaleFactor, pct1 * yScaleFactor + 5);
                    ctx.lineTo((46 + (pct2/2)) * xScaleFactor, pct2 * yScaleFactor + 5);
                    ctx.lineTo((46 + (pct2/2)) * xScaleFactor, 90 * yScaleFactor);
                    ctx.lineTo((46 + (pct1/2)) * xScaleFactor, 90 * yScaleFactor);
                    ctx.lineTo( (46 + (pct1/2)) * xScaleFactor, pct1 * yScaleFactor + 5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = 'black';
                    ctx.fillRect(60 * xScaleFactor,90 * yScaleFactor,40 * xScaleFactor,10 * yScaleFactor);
                    drawInventory(); // because this image might overwrite the inventory area.
                }
            }
            inRangeOfPlayer(extraRadius = 0) {
                // weirdly shaped so need custom collision detection.
                let inRectangle =  (player.x > (this.x - this.halfWidth - player.halfWidth - extraRadius) &&
                    player.x < (this.x + this.halfWidth + player.halfWidth + extraRadius) &&
                    player.y > (this.y - this.halfHeight - player.halfHeight - extraRadius) &&
                    player.y < (this.y + this.halfHeight + player.halfHeight + extraRadius) );
                if (inRectangle === false)
                    return false;
                let relX = player.x - this.x;
                let relY = player.y - this.y;
                let inEmptyPart = (relY > .2 * this.halfHeight) && (relX + this.halfHeight < relY + 35);
                return (! inEmptyPart);
            }
        }

        window.Chive = class Chive extends Thing {
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
        window.Dart = class Dart extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.inventoryImageRatio = 1.0; // so doesn't show up too small in inventory
            }
            handleClick() {
                if (('dart' in inventory) && (currentRoom === 'game room') && ('dartboard' in thingsHere)) {
                    this.discard();
                    this.movementDurationMS = 1000;
                    this.beginMovementTime = Date.now();
                    this.initialX = player.x;
                    this.initialY = player.y;
                    this.destX = otherData['bulls-eye coordinates'][0][0] + this.halfWidth;
                    this.destY = otherData['bulls-eye coordinates'][0][1] + this.halfHeight;
                    sounds['whoosh'].play();
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Darts = class Darts extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.inventoryImageRatio = 1.0; // so doesn't show up too small in inventory
            }
            handleClick() {
                if (('darts' in inventory) && (currentRoom === 'game room') && ('dartboard' in thingsHere)) {
                    otherData['darts origin'] = [player.x, player.y];
                    otherData['darts thrown time'] = Date.now();
                    otherData['darts deltas'] = [];
                    for (let i=0; i < 3; i++) {
                        otherData['darts deltas'].push( [otherData['bulls-eye coordinates'][i][0] - player.x, otherData['bulls-eye coordinates'][i][1] - player.y] );
                    }
                    sounds['whoosh'].play();
                    this.deleteCaptionIfAny();
                    this.removeFromInventory();
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Drawer = class Drawer extends Thing {
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
                        console.log('setting timeout to get spell');
                        window.setTimeout(
                            function() { addSpellToBinder('reversal') },
                            1000
                        );
                    }
                }
            }
        }

        window.Dresser = class Dresser extends Thing {
            handleClick() { // don't do anything; don't interfere with clicking drawer which is superimposed on this.
            }
        }

        window.Ghost = class Ghost extends Thing {
            update() {
                this.y = 12 * Math.sin(((Date.now() - this.timeOfCreation) / 300) ) + this.initialY;
                super.update();
            }
        }

        window.Gun = class Gun extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.wordDisplayOffsetX = -25; // so "gun" and "musketeer" labels can both appear without overlapping
                this.wordDisplayOffsetY = -65;
            }
            handleCollision() {
                displayMessage('watch out!', DEFAULT_MESSAGE_DURATION, this.x, this.y);
            }

        }

        window.Host = class Host extends Thing {
            constructor(word, room, x, y) {
                super(word, room, x, y);
                this.sound = new Audio(levelPath + '/audio/host-speech.m4a');
                this.sound.play();
                this.deleteAfterMovement = true; // so if player leaves room before speech is over, this will still get deleted.
                this.movementDurationMS = 5000 + 3000;
                this.beginMovementTime = Date.now();
                this.destX = this.initialX;
                this.destY = this.initialY;
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
                let newX = (fractionOfTheWayToEnd * 100) * (Math.sin(fractionSquared * 25)) + (this.initialX - this.halfWidth);
                let newY = (fractionOfTheWayToEnd * 100) * (Math.cos(fractionSquared * 25)) + (this.initialY - this.halfHeight);
                ctx.drawImage(this.image, newX, newY, this.width, this.height);
                ctx.globalAlpha = 1.0;
            }
        }

        window.Lamp = class Lamp extends Thing {
            extraTransformIntoBehavior() {
                if ('board' in thingsHere && typeof thingsHere['board'].captionDiv == 'undefined') {
                    thingsHere['board'].captionDiv = getNewCaptionDiv('board');
                    thingsHere['board'].setCaptionPositionInThingsHere();
                }
            }
        }

        window.Mantra = class Mantra extends Thing {
            extraTransformIntoBehavior() {
                this.sound = new Audio(levelPath + '/audio/om.m4a');
                this.sound.play();
                this.beginMovementTime = Date.now();
                this.movementDurationMS = 3000;
                this.destX = this.x;
                this.destY = this.y - 180;
                this.deleteAfterMovement = true; // so will delete even if player leaves room while it's floating away
                this.captionDiv.classList.add('fade-to-hidden');
            }
            update() {
                super.update();
            }
            draw() {
                let t = Date.now() - this.timeOfCreation;
                let fractionOfTheWayToEnd =  t / 3001;
                ctx.globalAlpha = 1.0 - fractionOfTheWayToEnd;
                let newX = 30 * (Math.sin(fractionOfTheWayToEnd * 25)) + (this.x - this.halfWidth);
                ctx.drawImage(this.image, newX, this.y, this.width, this.height);
                ctx.globalAlpha = 1.0;
            }
        }

        window.Mantrap = class Mantrap extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.playAudioWhenTransformed = false;
            }
            handleCollision() {
                displayMessage('yikes!', DEFAULT_MESSAGE_DURATION, this.x, this.y);
            }
        }

        window.Musketeer = class Musketeer extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.wordDisplayOffsetX = 15; // so "gun" and "musketeer" labels can both appear without overlapping
                this.wordDisplayOffsetY = 15;
            }
        }

        window.Portcullis = class Portcullis extends Thing {
            inRangeOfPlayer(extraRadius = 0) {
                // weirdly shaped so need custom collision detection.
                let inRectangle =  (player.x > (this.x - this.halfWidth - player.halfWidth - extraRadius) &&
                    player.x < (this.x + this.halfWidth + player.halfWidth + extraRadius) &&
                    player.y > (this.y - this.halfHeight - player.halfHeight - extraRadius) &&
                    player.y < (this.y + this.halfHeight + player.halfHeight + extraRadius) );
                if (inRectangle === false)
                    return false;
                let relX = player.x - this.x;
                let relY = player.y - this.y;
                let inEmptyPart = (relY > .6 * this.halfHeight) && (relX + this.halfHeight < relY);
                return (! inEmptyPart);
            }
        }

        window.Reward = class Reward extends Thing {
            handleClick() {
                if (this.movable === false) {
                    return; // if it's not movable it's because it's on its way to the toll machine, so ignore any further clicks.
                }
                if (currentRoom === 'beyond' && 'reward' in inventory) {
                    let tollMachine = thingsHere['toll machine'];
                    if (tollMachine.inRangeOfPlayer(EXTRA_SPELL_RADIUS + 20)) {
                        thingsHere['reward'] = this;
                        this.deleteCaptionIfAny();
                        this.removeFromInventory();
                        this.movable = false; // so player can't pick up again as it moves into toll machine
                        this.movementType = MOVEMENT_TYPE_PARABOLIC;
                        this.beginMovementTime = Date.now();
                        this.movementDurationMS = 1000;
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
            methodToCallAfterMovement() {
                let sound = new Audio(levelPath + '/audio/kaching.wav');
                sound.play();
                otherData['toll paid time'] = Date.now();
                let portcullis = thingsHere['portcullis'];
                portcullis.beginMovementTime = Date.now();
                portcullis.movementDurationMS = 4000;
                portcullis.destX = portcullis.x;
                portcullis.destY = portcullis.y - 300;
                portcullis.deleteAfterMovement = true;
                this.deleteFromThingsHere();
            }
        }
        window.Stand = class Stand extends Thing {
            okayToDisplayWord() {
                return false; // this just exists to hold Binder
            }
            handleCollision() {
                if (otherData['grabbed binder'] === false) {
                    otherData['grabbed binder'] = true;
                    displayMessage('You got the Spell Binder! Type B to look inside.');
                    document.getElementById('binder-icon-holder').style.display = 'block';
                    this.solid = false;
                    sounds['pickup'].play();
                    this.image.src = levelPath + '/things/stand-no-binder.png';
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Treasure = class Treasure extends Thing {
            tryToPickUp() {
                completeLevel();
                return super.tryToPickUp();
            }
            handleCollision() {
                completeLevel();
                return super.handleCollision();
            }
        }

        level.carryingLamp = function() {
            return ('lamp' in inventory || 'lamp' in thingsHere || 'lamps' in inventory || 'lamps' in thingsHere);
        }

        level.getThing = function (word, room, x, y) {
            switch (word) {
                case 'boar' : return new Boar(word,room,x,y);
                case 'board' : return new Board(word,room,x,y,);
                case 'dart' : return new Dart(word,room,x,y);
                case 'darts' : return new Darts(word,room,x,y);
                case 'dartboard' : return new Bullseyes(word,room,x,y);
                case 'chive' : return new Chive(word,room,x,y);
                case 'drawer' : return new Drawer(word,room,x,y);
                case 'dresser': return new Dresser(word,room,x,y);
                case 'ghost' : return new Ghost (word, room, x, y);
                case 'gun' : return new Gun (word,room,x,y);
                case 'host' : return new Host (word, room, x, y);
                case 'lamp' : return new Lamp(word,room,x,y);
                case 'mantra' : return new Mantra (word, room, x, y);
                case 'mantrap' : return new Mantrap (word, room, x, y);
                case 'musketeer' : return new Musketeer (word, room, x, y);
                case 'portcullis' : return new Portcullis(word,room,x,y);
                case 'reward': return new Reward(word,room,x,y);
                case 'stand' : return new Stand(word,room,x,y);
                case 'treasure' : return new Treasure(word,room,x,y);
                default : return undefined; // the generic getThing function will then create a plain-vanilla Thing object.
            }
        }

        level.initialRoom= 'entry point';
        level.initialX = 20; // expressed as % of way across x axis, i.e. value range is 0-100
        level.initialY = 50;
        level.initialSpells=  ['remove-edge', 'add-edge'];
        level.initialInventory= {}; // { 'darts': new Darts('darts','inventory' , 0, 0)};
        level.backgroundMusicFile = 'Sneaky Snitch.mp3';
        level.allWords= [ 'amp', 'amps', 'art', 'arts', 'boar', 'board', 'cart', 'carts', 'chive', 'chives',
            'clam', 'clams', 'clamp', 'clamps', 'dart', 'darts', 'dartboard', 'drawer', 'eel', 'ghost', 'gun', 'gunk',
            'hive', 'hives', 'host',
            'keel', 'lamp', 'leek', 'mantra', 'mantrap', 'musketeer', 'part', 'parts',
            'peel',  'portcullis',
            'reward', 'strad',  'strap', 'straw',
            'toll machine', 'wart', 'warts', ];
        level.solidObjects = [ 'dartboard', 'portcullis','cabinet','gun',
            'ghost','dresser','mantrap', 'musketeer', 'stand',  ];
        level.immovableObjects= [  'drawer','ghost','gun','gunk','host','board','boar','mantra','dresser','stand', 'toll machine', ];
        level.bridgelikeObjects= [ 'span', 'ladder' ];
        level.ellipticalObjects= [ 'clam', 'meteor', 'asteroid'];
        level.otherGameData= { 'hive in place':true,
            'last hive trigger time':0,
            'bee image':new Image(),
            'bulls-eye coordinates':[ [452,176], [497,236], [542,301]],
            'dart image':new Image(),
            'lamplight image': new Image(),
            'lamplight height':118,
            'lamplight width':225,
            'drawer open': false,
            'steroid drunk': false,
            'meteor moved': false,
            'grabbed binder': false,
        },
            level.initialThings = [
                ['board','darkroom',90,62],
                ['dartboard', 'game room', 78, 51],
                ['clam', 'main', 42, 53],
                ['dresser','beyond',26,80],
                ['drawer','beyond', 26, 73],
                ['ghost', 'entry hall 1', 40, 50] ,
                ['gun', 'treasure room', 82, 23 ],
                ['hive','hive room',43,35],
                ['leek','armory',50,53],
                ['mantrap', 'main', 50, 23] ,
                ['musketeer', 'treasure room', 88, 29],
                ['portcullis', 'beyond', 69, 37],
                ['stand','entry point', 48, 50],
                ['straw', 'hive room', 23, 65],
                ['toll machine', 'beyond', 85,60],
                ['treasure', 'treasure room', 83, 76],
            ];
        level.initialRunes = [];
        level.rooms = {
            'armory': {
                boundaries: [['n',30,30,60,30],['n',60,30,60,75], ['n',60,75,30,75], ['n',30,75,30,30,],],
                filledPolygons: [ ['r',0,0,100,30], ['r',0,30,30,70], ['r',30,75,70,25], ['r',60,30,40,45], ],
                passages:[ new Passage(PassageTypes.SECRET_LEFT, 30,50,'game room',60,56)],
            },
            'beyond':{
                boundaries: [ ['n',4,35,4,0], ['n',4,0,30,0], ['n',30,0,61,46], ['n',61,46,61,5], ['n',61,5,76,28], ['n',76,28,76,69], ['n',76,69,100,100], ['n',100,100,4,100], ['n',4,100,4,65], ['n',4,65,0,65], ['n',4,35,0,35], ],
                filledPolygons: [ ['r',0,0,4,35], ['r',0,65,4,35], ['p',30,0,61,46,61,0], ['p',61,0,61,5,76,28,76,69,100,100,100,0], ],
                passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL,4,50,'entry hall 1',88,50),
                    new Passage(PassageTypes.INVISIBLE_HORIZONTAL,78,50,'main',12,50),],
                specificNewRoomBehavior: function() {
                    if (!spellAvailable(allSpells.SPELL_REVERSAL)) {
                        displayMessage('Click on the drawer to open it!');
                    }
                },
            },
            'darkroom':{
                boundaries:[ ['n',10,20,90,20], ['n',90,20,90,82], ['n',90,82,10,82], ['n',10,82,10,20]],
                filledPolygons: [ ['r',0,0,100,20], ['r',0,20,10,80], ['r',10,82,90,18], ['r',90,20,10,80], ],
                passages:[ new Passage(PassageTypes.BASIC_HORIZONTAL, 50, 20, 'main', 50, 85),
                    new Passage(PassageTypes.BASIC_RIGHT, 90, 60, 'treasure room', 11, 23, false)],
                specificNewRoomBehavior: function() {
                    if (!(level.carryingLamp())) {
                        displayMessage("It's dark here!");
                    }
                },
            },
            'entry point': {
                boundaries: [ ['n',10, 36, 30, 36], ['n',10,64,30,64], ['n',10,36,10,64], ['d',30,36,42,18], ['n',42,18,54,18],
                    ['d',54,18,66,36], ['n',66,36,100,36], ['d',30,64,42,82], ['n',42,82,54,82], ['d',54,82,66,64], ['n',66,64,100,64] ],
                filledPolygons: [ ['r',0,0,10,100],['r',10,0,20,36],['p',30,36,42,18,42,0,30,0],['r',42,0,58,18],
                    ['p',54,18,66,36,100,36,100,18],  ['r',10,64,20,36], ['p',30,64,42,82,42,100,30,100],
                    ['r',42,82,58,18], ['p',54,82,66,64,100,64,100,82], ],
                passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'entry hall 1', 11, 50)],
            },
            'entry hall 1': {
                boundaries: [ ['n',0,36,100,36], ['n',0,64,75,64], ['n',75,64,75,100], ['n',92,100,92,64], ['n',92,64,100,64]] ,
                filledPolygons: [ ['r',0,0,100,36], ['r',0,64,75,36], ['r',92,64,8,36], ],
                passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'entry point', 90, 50),
                    new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'beyond', 11, 50),
                    new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 84, 100, 'hive room', 84, 10),
                ],
            },
            'game room': {
                boundaries: [ ['n',4,10,4,90], ['n',4,10,51,10], ['n',51,10,91,90], ['n',91,90,60,90], ['n',60,90,60,100], ['n',40,90,40,100], ['n',4,90,40,90], ],
                filledPolygons: [ ['r',0,0,4,100], ['p',46,0,96,100,100,100,100,0], ['r',0,0,100,10], ['r',0,90,40,10], ['r',60,90,40,10], ],
                passages: [ new Passage(PassageTypes.INVISIBLE_HORIZONTAL,50,100,'main',50,12),
                    new Passage(PassageTypes.SECRET_RIGHT,75,50,'armory',42,50),],
            },
            'hive room': {
                boundaries: [ ['n',75,0,75,50], ['n',92,0,92,72], ['n',75,50,50,50], ['n',50,50,50,25], ['n',50,25,15,25], ['n',15,25,15,72], ['n',15,72,92,72],
                    ['i',50,50,50,72], ],
                filledPolygons: [ ['r',0,0,75,25], ['r',50,25,25,25,], ['r',0,25,15,75], ['r',15,72,85,28], ['r',92,0,8,100], ],
                passages: [new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 84, 0, 'entry hall 1', 84, 90), ],
                specificNewRoomBehavior: function() {
                    if (otherData['hive in place'] === false) {
                        // remove the invisible boundary caused by the hive:
                        for (let i = 0;i < boundaries.length; i++) {
                            if (boundaries[i][0] === 'i')
                                boundaries.splice(i);
                        }
                    }
                },
            },
            'main': {
                boundaries: [ ['n',0,36,40,36], ['n',40,36,40,0], ['n',60,0,60,100], ['n',40,100,40,64], ['n',40,64,0,64] ],
                filledPolygons: [ ['r',0,0,40,36], ['r',60,0,40,100], ['r',0,64,40,36], ['r',60,64,40,36], ],
                passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'beyond', 52, 53),
                    new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 50, 0, 'game room',45,60),
                    new Passage(PassageTypes.BASIC_HORIZONTAL, 50, 96, 'darkroom',50,32),
                ]
            },
            'treasure room':{
                boundaries: [ ['n',0,10,95,10], ['n',95,10,95,90], ['n',95,90,70,90], ['n',70,90,70,36], ['n',70,36,0,36], ],
                filledPolygons: [ ['r',0,0,100,10], ['r',95,10,5,90], ['r',0,90,100,10], ['r',0,36,70,54], ],
                passages: [ new Passage(PassageTypes.BASIC_LEFT,3,22,'darkroom',76,65),],
            },

        };
        level.initializationFunction = function() {
            otherData['bee image'].src = levelPath + '/things/bees-1.png';
            otherData['bee sound'] = new Audio( 'audio/481647__joncon-library__bee-buzzing.wav');
            otherData['dart image'].src = levelPath + '/things/dart.png';
            otherData['lamplight image'].src = levelPath + '/things/Ellipse.png';
            // since this is an introductory level we make the player pick up the spell binder at the start. see class "Stand" above.
            document.getElementById('binder-icon-holder').style.display = 'none';
        };
        level.animateLoopFunction = function() {
            if (currentRoom === 'darkroom') {
                ctx.fillStyle = 'black';
                if (!(level.carryingLamp())) {
                    ctx.fillRect(0, 0, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
                    player.draw(); // draw the player again ... inefficient but easier than setting up logic to determine layers relative to black rectangle
                    passages[0].draw();
                }
                else {
                    let lamp, lampX, lampY;
                    if ('lamp' in inventory) {
                        lampX = player.x + 32;
                        lampY = player.y - 2;
                        lamp = inventory['lamp'];
                        ctx.drawImage(lamp.image,lampX - 26,lampY - 24,53,48);
                    }
                    else {
                        lampX = thingsHere['lamp'].x;
                        lampY = thingsHere['lamp'].y;
                    }
                    let halfX = otherData['lamplight width']/2 ;
                    let halfY = otherData['lamplight height']/2 ;
                    ctx.fillRect(0,0,PLAY_AREA_WIDTH, 2 + lampY-halfY);
                    ctx.fillRect(0,lampY-halfY - 1,2 + lampX-halfX, 2 + PLAY_AREA_HEIGHT-(lampY-halfY));
                    ctx.fillRect(lampX-halfX - 1,lampY+halfY-1,2 + PLAY_AREA_WIDTH-(lampX-halfX),2 + PLAY_AREA_HEIGHT-(lampY+halfY));
                    ctx.fillRect(lampX+halfX - 1,lampY-halfY-1,2 + PLAY_AREA_WIDTH-(lampX+halfX),2 + halfY + halfY);
                    ctx.drawImage(otherData['lamplight image'],lampX - halfX,lampY - halfY);
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
        }; // end implementation of level.animateLoopFunction
    }; // end definition of getLevelFunctions['intro level']

    return level;
}