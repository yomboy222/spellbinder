/* intro_level.js */
/* this file has two sections, first the word-related data and code,
   then the more general level data (rooms, passages, boundaries etc.)
 */

levelList.push( {name:'intro level', difficulty:5});

getLevelFunctions['intro level'] = function() {

    let level = new Level('intro level');
    levelPath = 'levels/intro_level';

    level.defineThingSubclasses = function () {

        window.Asteroid = class Asteroid extends Thing {
            constructor(word,thing,x,y) {
                super(word,thing,x,y);
                this.cannotPickUpMessage = 'Too heavy to move!';
            }
            handleCollision() {
                if (otherData['steroid drunk'] !== true) {
                    displayMessage('Too heavy to move!', DEFAULT_MESSAGE_DURATION, this.x, this.y);
                }
                return super.handleCollision();
            }
        }

        window.Axle = class Axle extends Thing{
            displayCantPickUpMessage() {
                if ('wheel' in thingsHere && thingsHere['wheel'].movable === false) { // this obtains only if wheel is affixed to axle
                    // don't display anything.
                }
                else {
                    displayMessage("To turn the axle, you'd need to affix something to it first.", DEFAULT_MESSAGE_DURATION + 1000, this.x, this.y);
                }
            }
        }

        window.Boar = class Boar extends Thing{
            extraTransformIntoBehavior() {
                window.setTimeout(this.leaveRoom.bind(this),1200);
                this.markedForDeletion = true; // so if player leaves room before running-away process is done, still deleted.
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

        window.Bullseyes = class Bullseyes extends Thing {
            draw() {
                if (typeof otherData['darts thrown time'] == 'undefined' || Date.now() < otherData['darts thrown time'] + 1000) {
                    // draw normally
                    return super.draw();
                }
                else if (Date.now() >= otherData['darts thrown time'] + 5000) {
                    // fully retracted, so delete:
                    delete thingsHere['dartboard'];
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

        window.Cabinet = class Cabinet extends Thing {
            handleClick() {
                if (spellsAvailable.indexOf('add-edge') < 0)
                    addSpellToBinder('add-edge');
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

        window.Darts = class Darts extends Thing {
            handleClick() {
                if (('darts' in inventory) && (currentRoom === 'game room') && ('dartboard' in thingsHere)) {
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
                        addSpellToBinder('reversal');
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

        window.Host = class Host extends Thing {
            constructor(word, room, x, y) {
                super(word, room, x, y);
                this.sound = new Audio(levelPath + '/audio/host-speech.m4a');
                this.sound.play();
                this.markedForDeletion = true; // so if player leaves room before speech is over, this will still get deleted.
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

        window.Mantra = class Mantra extends Thing {
            extraTransformIntoBehavior() {
                this.sound = new Audio(levelPath + '/audio/om.m4a');
                this.sound.play();
                this.markedForDeletion = true; // so will delete even if player leaves room while it's floating away
            }
            draw() {
                let t = Date.now() - this.timeOfCreation;
                if (t >= 3000) {
                    delete thingsHere['mantra'];
                    return;
                }
                let fractionOfTheWayToEnd =  t / 3001;
                ctx.globalAlpha = 1.0 - fractionOfTheWayToEnd;
                let newX = 30 * (Math.sin(fractionOfTheWayToEnd * 25)) + (this.x - this.halfWidth);
                let newY = (this.y - this.halfHeight) - (fractionOfTheWayToEnd * 180);
                ctx.drawImage(this.image, newX, newY, this.width, this.height);
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

        window.Meteor = class Meteor extends Thing {
            constructor(word,thing,x,y) {
                super(word,thing,x,y);
                this.cannotPickUpMessage = 'Too heavy to move!';
            }
            handleCollision() {
                if ((otherData['steroid drunk'] === true) && (typeof otherData['meteor moved'] === 'undefined' || otherData['meteor moved'] === false)) {
                    otherData['meteor moved'] = true;
                    this.destX = this.x + 94;
                    this.destY = this.y + 84;
                    this.beginMovementTime = Date.now();
                    this.movementDurationMS = 1200;
                }
                else {
                    return super.handleCollision();
                }
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
                if (currentRoom === 'beyond' && 'reward' in inventory) {
                    let tollMachine = thingsHere['toll machine'];
                    if (tollMachine.inRangeOfPlayer(EXTRA_SPELL_RADIUS + 20)) {
                        thingsHere['reward'] = this;
                        delete inventory['reward'];
                        this.movable = false; // so player can't pick up again as it moves into toll machine
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
            update() {
                if (this.beginMovementTime > 0 && Date.now() > this.beginMovementTime + this.movementDurationMS) {
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
                else {
                    return super.update();
                }
            }
        }

        window.Spa = class Spa extends Thing {
            constructor(word, room, x, y) {
                super(word, room, x, y);
                this.images = [this.image, new Image(196, 172)];
                this.images[1].src = levelPath + '/things/spa-2.png';
            }
            draw() {
                let t = Date.now() - this.timeOfCreation;
                let frame = ( Math.round(t / 100) % 2);
                ctx.drawImage(this.images[frame], this.x - this.halfWidth, this.y - this.halfHeight, this.images[frame].width, this.images[frame].height);
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
                    this.solid = false;
                    sounds['pickup'].play();
                    this.image.src = levelPath + '/things/stand-no-binder.png';
                }
                else {
                    return super.handleClick();
                }
            }
        }

        window.Steroid = class Steroid extends Thing {
            constructor(word,room,x,y) {
                super(word,room,x,y);
                this.sound = new Audio(levelPath + '/audio/575527__dr19__cork-pop.wav');
            }
            handleClick() {
                this.sound.play();
                window.setTimeout(displayMessage('I feel so strong now!'), 1000);
                delete thingsHere['steroid'];
                delete inventory['steroid'];
                otherData['steroid drunk'] = true;
            }
            extraTransformIntoBehavior() {
                if (currentRoom === 'asteroid room' && 'steroid' in thingsHere) {
                    this.x -= 30; // move closer so player can reach it.
                }
            }
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
                return super.handleCollision();
            }
        }

        window.Wheel = class Wheel extends Thing {
            handleClick() {
                if (!('axle' in thingsHere)) { // the special case to handle here is dropping wheel to affix to axle. if no axle, no special behavior:
                    return super.handleClick();
                }
                let axle = thingsHere['axle'];
                if (this.movable === false) { // this will be the case iff it's already been affixed to the axle
                    if (typeof otherData['wheel turned time'] === 'undefined' || otherData['wheel turned time'] === 0) {
                        // TODO: play wheel sound
                        // TODO: maybe make it possible to turn the portcullis back down??
                        otherData['wheel turned time'] = Date.now();
                        let portcullis = thingsHere['portcullis1'];
                        portcullis.beginMovementTime = Date.now();
                        portcullis.movementDurationMS = 4000;
                        portcullis.destX = portcullis.x;
                        portcullis.destY = portcullis.y - 300;
                        portcullis.deleteAfterMovement = true;
                    }
                    return;
                }
                else if (('wheel' in inventory) && axle.inRangeOfPlayer(EXTRA_SPELL_RADIUS + 20)) {
                    this.initialX = player.x;
                    this.initialY = player.y;
                    this.beginMovementTime = Date.now();
                    this.movementDurationMS = 800;
                    this.destX = axle.x - 15;
                    this.destY = axle.y;
                    this.movable = false; // can't pick up anymore once affixed to axle.
                    displayMessage('You affix the wheel to the axle.');
                }
                return super.handleClick();
            }
        }

    level.getThing = function (word, room, x, y) {
        switch (word) {
            case 'asteroid' : return new Asteroid(word, room, x, y);
            case 'axle' : return new Axle(word, room, x, y);
            case 'boar' : return new Boar(word,room,x,y);
            case 'board' : return new Board(word,room,x,y,);
            case 'dartboard' : return new Bullseyes(word,room,x,y);
            case 'cabinet' : return new Cabinet(word, room, x, y);
            case 'chive' : return new Chive(word,room,x,y);
            case 'darts' : return new Darts(word,room,x,y);
            case 'drawer' : return new Drawer(word,room,x,y);
            case 'dresser': return new Dresser(word,room,x,y);
            case 'ghost' : return new Ghost (word, room, x, y);
            case 'host' : return new Host (word, room, x, y);
            case 'mantra' : return new Mantra (word, room, x, y);
            case 'mantrap' : return new Mantrap (word, room, x, y);
            case 'meteor' : return new Meteor(word, room, x, y);
            case 'portcullis' : return new Portcullis(word,room,x,y);
            case 'reward': return new Reward(word,room,x,y);
            case 'steroid' : return new Steroid(word, room, x, y);
            case 'spa' : return new Spa (word, room, x, y);
            case 'stand' : return new Stand(word,room,x,y);
            case 'treasure' : return new Treasure(word,room,x,y);
            case 'wheel' : return new Wheel (word,room,x,y);
            default : return undefined; // the generic getThing function will then create a plain-vanilla Thing object.
        }
    }

        level.initialRoom= 'entry point';
        level.initialX = 20; // expressed as % of way across x axis, i.e. value range is 0-100
        level.initialY = 50;
        level.initialSpells=  ['remove-edge'];
        level.initialInventory= {};
        level.backgroundMusicFile = 'Sneaky Snitch.mp3';
        level.allWords= [ 'arts',  'asteroid',  'ace',  'adder',  'amp',  'axle', 'bat',  'bath',  'boar',  'board',  'brook',  'bulls-eyes',
            'carts',
            'cabinet',  'chive',
            'clam',  'clamp',  'cow',  'cowl',  'crow',  'crown',  'darts', 'dartboard',  'drawer',  'eel',  'flock',  'ghost',
            'heel',  'hive',  'host',
            'keel',  'ladder',  'lamp',  'leek',  'lock',  'mace',  'mantra',  'mantrap', 'maps', 'meteor',  'owl',  'pan',  'parts',
            'peel',  'portcullis',
            'rat',  'reed',  'reward',  'spa',  'spam',  'span',  'star',  'steroid',  'strad',  'strap',  'straw',  'stream',
            'tab',  'tar',  'taro',
            'tarot',  'toll machine',  'tuna',  'warts',  'wheel',  ];
         level.solidObjects = [ 'brook', 'bulls-eyes', 'dartboard', 'portcullis','cabinet','cow','lock','spa','bath','ceiling',
            'ghost','dresser','pools','mantrap','meteor','asteroid', 'stand',  ];
            level.immovableObjects= [ 'axle','brook','bulls-eyes','drawer','portcullis','cabinet','stream','flock','lock','cow','bath','spa',
            'span','ghost','host','meteor','asteroid','board','boar','pools','mantrap','dresser','stand','statue', 'toll machine', ];
            level.bridgelikeObjects= [ 'span', 'ladder' ];
            level.ellipticalObjects= [ 'clam', 'meteor', 'asteroid'];
            level.otherGameData= { 'hive in place':true,
                'last hive trigger time':0,
                'bee image':new Image(),
                'bulls-eye coordinates':[ [435,170], [480,230], [525,295]],
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
            ['asteroid', 'asteroid room', 70, 43],
            ['axle','secret room',84,62],
            ['bath','bathroom',25,70],
            ['board','darkroom',90,62],
            ['dartboard', 'game room', 78, 51],
            ['cabinet','bathroom',25,25],
            ['clam', 'kitchen', 42, 40],
            ['crown','crown room',50,50],
            ['dresser','beyond',26,80],
            ['drawer','beyond', 26, 73],
            ['ghost', 'entry hall 1', 40, 50] ,
            ['hive','hive room',43,35],
            ['leek','kitchen',70,50],
            ['mace','armory', 50, 50],
            ['meteor', 'asteroid room', 70, 60],
            ['mantrap', 'main', 50, 23] ,
            ['portcullis', 'beyond', 69, 37],
            ['portcullis', 'secret room',70,37],
            ['spa', 'bathroom', 67,34] ,
            ['statue','statue room', 21, 23],
            ['stand','entry point', 48, 50],
            ['statue','statue room', 51, 23],
            ['statue','statue room', 81, 23],
            ['statue','statue room', 21, 77],
            ['statue','statue room', 51, 77],
            ['statue','statue room', 81, 77],
            ['straw', 'hive room', 23, 65],
            ['stream','stream room', 50, 50],
            ['toll machine', 'beyond', 85,60],
            ['treasure', 'stream room', 90, 80],
        ];
        level.initialRunes = [];
        level.rooms = {
            'armory': {
                boundaries: [['n',30,30,60,30],['n',60,30,60,75], ['n',60,75,30,75], ['n',30,75,30,30,],],
                filledPolygons: [ ['r',0,0,100,30], ['r',0,30,30,70], ['r',30,75,70,25], ['r',60,30,40,45], ],
                passages:[ new Passage(PassageTypes.SECRET_LEFT, 30,50,'game room',60,56)],
            },
            'asteroid room': {
                boundaries: [ ['n',0,40,60,40], ['n',60,40,60,10], ['n',60,10,95,10], ['n',95,10,95,35], ['n',95,35,100,35], ['n',0,60,60,60],
                    ['n',60,60,60,90], ['n',60,90,95,90], ['n',95,90,95,65], ['n',95,65,100,65], ],
                filledPolygons: [ ['r',0,0,60,40], ['r',60,0,40,10], ['r',95,10,5,25],
                    ['r',0,60,60,40], ['r',60,90,40,10], ['r',95,65,5,25], ],
                passages: [ new Passage(PassageTypes.INVISIBLE_HORIZONTAL,0,50,'main',89,50),
                    new Passage(PassageTypes.INVISIBLE_VERTICAL,100,50,'kitchen',12,50)],
            },
            'bathroom': {
                boundaries:[ ['n',15,15,85,15], ['n',85,15,85,85], ['n',85,85,15,85], ['n',15,85,15,15], ],
                filledPolygons: [ ['r',0,0,100,15], ['r',0,15,15,85], ['r',15,85,85,15], ['r',85,15,15,85], ],
                passages:[ new Passage(PassageTypes.BASIC_HORIZONTAL,50,82,'main',50,11),
                    new Passage(PassageTypes.BASIC_RIGHT,85,65,'game room',12,56),],
            },
            'beyond':{
                boundaries: [ ['n',4,40,4,0], ['n',4,0,30,0], ['n',30,0,61,46], ['n',61,46,61,5], ['n',61,5,76,28], ['n',76,28,76,69], ['n',76,69,100,100], ['n',100,100,4,100], ['n',4,100,4,60], ],
                filledPolygons: [ ['r',0,0,4,100], ['p',30,0,61,46,61,0], ['p',61,0,61,5,76,28,76,69,100,100,100,0], ],
                passages: [ new Passage(PassageTypes.BASIC_LEFT,4,50,'darkroom',70,66),
                       new Passage(PassageTypes.INVISIBLE_HORIZONTAL,78,50,'crown room',42,50),],
            },
            'crown room':{
                boundaries: [['n',30,30,60,30],['n',60,30,60,75], ['n',60,75,30,75], ['n',30,75,30,30,],],
                filledPolygons: [ ['r',0,0,100,30], ['r',0,30,30,70], ['r',30,75,70,25], ['r',60,30,40,45], ],
                passages:[ new Passage(PassageTypes.BASIC_LEFT, 30,50,'beyond',58,60)],
            },
            'darkroom':{
                boundaries:[ ['n',10,20,90,20], ['n',90,20,90,82], ['n',90,82,10,82], ['n',10,82,10,20]],
                filledPolygons: [ ['r',0,0,100,20], ['r',0,20,10,80], ['r',10,82,90,18], ['r',90,20,10,80], ],
                passages:[ new Passage(PassageTypes.BASIC_HORIZONTAL, 50, 20, 'main', 50, 89),
                    new Passage(PassageTypes.BASIC_RIGHT, 90, 60, 'beyond', 11, 60, false)],
                specificNewRoomBehavior: function() {
                    if (!('lamp' in inventory)) {
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
                        new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'statue room', 11, 50),
                        new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 84, 100, 'hive room', 84, 10),
                ],
            },
            'game room': {
                boundaries: [ ['n',4,40,4,0], ['n',4,0,46,0], ['n',46,0,96,100], ['n',96,100,4,100], ['n',4,100,4,60], ],
                filledPolygons: [ ['r',0,0,4,100], ['p',46,0,96,100,100,100,100,0], ],
                passages: [ new Passage(PassageTypes.BASIC_LEFT,4,50,'bathroom',70,66),
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
            'kitchen': {
                boundaries: [ ['n',0,30,10,30], ['n',10,30,10,20], ['n',10,20,90,20], ['n',90,20,90,80], ['n',90,80,10,80], ['n',10,80,10,70], ['n',10,70,0,70], ],
                filledPolygons: [ ['r',0,0,10,30], ['r',0,70,10,30], ['r',10,0,100,20], ['r',10,80,90,20], ['r',90,0,10,100], ],
                passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL,0,50,'asteroid room',88,50),],
            },
            'main': {
                boundaries: [ ['n',0,36,40,36], ['n',40,36,40,0], ['n',60,0,60,36], ['n',60,36,100,36], ['n',100,64,60,64], ['n',60,64,60,100], ['n',40,100,40,64], ['n',40,64,0,64] ],
                filledPolygons: [ ['r',0,0,40,36], ['r',60,0,40,36], ['r',0,64,40,36], ['r',60,64,40,36], ],
                passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'statue room', 90, 50),
                    new Passage(PassageTypes.INVISIBLE_VERTICAL,100,50,'asteroid room',15,50),
                    new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 50, 0, 'bathroom',45,60),
                    new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 50, 100, 'darkroom',50,32),
                ]
            },
            'secret room': {
                boundaries: [ ['n',12,100,12,0], ['n',12,0,28,0], ['n',28,15,28,42],  ['n',28,42,62,42], ['n',62,42,62,5], ['n',62,5,78,28],
                    ['n',78,28,78,70], ['n',78,70,100,100], ['n',100,100,12,100],
                    ['t',86,62,86,37], ['t',86,37,72,17], ],
                filledPolygons: [ ['r',0,0,12,100], ['r',28,0,34,42], ['p',62,0,62,5,78,28,78,70,100,100,100,0], ],
                passages: [ new Passage(PassageTypes.BASIC_RIGHT, 28, 14, 'statue room', 49, 78),
                    new Passage(PassageTypes.INVISIBLE_HORIZONTAL,78,50,'stream room',12,50), ],
            },
            'statue room': {
                boundaries: [ ['n',0,36,12,36], ['n',12,36,12,10], ['n',12,10,30,10], ['n',30,10,30,36], ['n',30,36,42,36],
                    ['n',42,36,42,10], ['n',42,10,60,10], ['n',60,10,60,36], ['n',60,36,72,36], ['n',72,36,72,10], ['n',72,10,90,10], ['n',90,10,90,36], ['n',90,36,100,36],
                    ['n',0,64,12,64], ['n',12,64,12,90], ['n',12,90,30,90], ['n',30,90,30,64], ['n',30,64,42,64], ['n',42,64,42,90], ['n',42,90,60,90],
                    ['n',60,90,60,64], ['n',60,64,72,64], ['n',72,64,72,90], ['n',72,90,90,90], ['n',90,90,90,64], ['n',90,64,100,64], ] ,
                filledPolygons: [ ['r',0,0,100,10], ['r',0,90,100,10], ['r',0,10,12,26], ['r',30,10,12,26], ['r',60,10,12,26], ['r',90,10,10,26],
                    ['r',0,64,12,26], ['r',30,64,12,26], ['r',60,64,12,26], ['r',90,64,10,26], ],
                passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'entry hall 1', 90, 50),
                    new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'main', 11, 50),
                    new Passage(PassageTypes.INVISIBLE_VERTICAL, 41, 91, 'secret room', 20, 20),
                ],
            },
            'stream room': {
                boundaries: [ ['n',0,35,5,35], ['n',5,35,5,15], ['n',5,15,90,15], ['n',90,15,90,85], ['n',90,85,5,85], ['n',5,85,5,65], ['n',5,65,0,65],
                    ['i',48,15,43,40], ['i',43,40,46,72], ['i',46,72,35,85],
                    ['i',66,15,59,40], ['i',59,40,55,74], ['i',55,74,60,85],],
                filledPolygons: [ ['r',0,0,5,35], ['r',0,65,5,35], ['r',5,0,95,15], ['r',5,85,95,15], ['r',90,15,10,70], ],
                passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'secret room', 60, 60)],
            },
        };
        level.initializationFunction = function() {
            console.log('yo');
            otherData['bee image'].src = levelPath + '/things/bees-1.png';
            otherData['bee sound'] = new Audio( 'audio/481647__joncon-library__bee-buzzing.wav');
            otherData['dart image'].src = levelPath + '/things/dart.png';
            otherData['lamplight image'].src = levelPath + '/things/Ellipse.png';
        };
        level.animateLoopFunction = function() {
            if (currentRoom === 'darkroom') {
                ctx.fillStyle = 'black';
                if (!('lamp' in inventory || 'lamp' in thingsHere)) {
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