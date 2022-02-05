/*  game_functionality.js
    javascript code to run Spell-Binder game
    Doug McLellan 1/2022
*/

/* global-scope variables: */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 700; const CANVAS_HEIGHT = 600;
const PLAY_AREA_WIDTH = 700; const PLAY_AREA_HEIGHT = 500;
const xScaleFactor = PLAY_AREA_WIDTH / 100; const yScaleFactor = PLAY_AREA_HEIGHT / 100;
const INVENTORY_WIDTH = 700; const INVENTORY_HEIGHT = 100; const INVENTORY_LEFT = 0; const INVENTORY_TOP = 500;
const INVENTORY_TOP_MARGIN = 58; const INVENTORY_LEFT_MARGIN = 55; const INVENTORY_SPACING = 95;
const MAX_ITEMS_IN_INVENTORY = 6;
const RUNE_WIDTH = 65; const RUNE_HEIGHT = 92;
const PASSAGE_WIDTH = 55;
const PASSAGE_LENGTH = 150;
let canvasOffsetX = 0; // will be set in initialize()
let canvasOffsetY = 0;
const PLAYER_HEIGHT = 90;
const PLAYER_WIDTH = 60;
const EXTRA_SPELL_RADIUS = 40;
const EXTRA_PICKUP_RADIUS = 20;
const DISTANCE_TO_MOVE = 4;
const allSpells = { SPELL_ADD_EDGE:'add-edge', SPELL_REMOVE_EDGE:'remove-edge', SPELL_REVERSAL : 'reversal', SPELL_ANAGRAM : 'anagram',
    SPELL_SYNONYM : 'synonym', SPELL_ADD : 'add', SPELL_REMOVE : 'remove', SPELL_CHANGE_EDGE : 'change-edge', SPELL_CHANGE : 'change',
        BINDER_COVER : 'cover', BINDER_INTRO : 'intro' };
let binderImages = {};
let CollisionProfile = { RECTANGULAR : 'RECTANGULAR', ELLIPTICAL : 'ELLIPTICAL'};
let BoundaryType = { VERTICAL : 'v', HORIZONTAL : 'h', DIAGONAL : 'd'};
let levelName = '';
let levelPath = ''; // to remove spaces etc. so can be used in file paths more easily
let thingsElsewhere = {};
let inventory = {};
let thingsHere = {};
let spellsAvailable = [];
let runes = [];
let runeImages = [];
let rooms = {};
let passages = [];
let passageImages = {}; // probably a good idea to load these in "initialize" function, but not doing this now.
let boundaries = [];
let filledPolygons = [];
let otherData = {};
let currentRoom = '';
let player = {};
let sounds = {};
let backgroundImage = new Image();
let backgroundMusic = undefined;
let musicPlaying = false;
let normalPlayerInputSuppressed = false;
// levels may define following to be functions:
let levelSpecificInitialization = undefined;
let levelSpecificNewRoomBehavior = undefined;
let levelSpecificAnimateLoopBehavior = undefined;
let levelSpecificPostTransformBehavior = undefined;
let levelSpecificKeydownBehavior = undefined;
let levelSpecificClickBehavior = undefined;
let messageTimer = 0;
let wordTimers = []; // used to enforce duration of things' captions
let wordDivs = []; // will have references to the divs used for Things' captions
const NUMBER_OF_CAPTION_DIVS = 10;
const MESSAGE_DURATION_MS = 2500;
const WORD_DURATION_MS = 1500;
const FADEOUT_DURATION_MS = 1200;
let fadeoutTimer = 0;
let fadeinTimer = 0;
let fadeoutWord = '';
let fadeinWord = '';
let showingIntroPage = true;
let pageBeingShownInBinder = '';
let pageToShow = '';

let cheating = false; // turn on to allow teleporting etc for debugging purposes

let PassageTypes = { BASIC_VERTICAL : 'basic-vertical',
    BASIC_HORIZONTAL : 'basic-horizontal',
    BASIC_LEFT : 'basic-left',
    BASIC_RIGHT : 'basic-right',
    SECRET_LEFT : 'secret-left',
    SECRET_RIGHT : 'secret-right',
    INVISIBLE_VERTICAL : 'invisible-vertical',
    INVISIBLE_HORIZONTAL : 'invisible-horizontal' };

let Directions = { UP : 0, RIGHT : 1, DOWN : 2, LEFT : 3 };

class Player {
    constructor(props) {
        this.x = 50;
        this.y = 50;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        this.direction = Directions.RIGHT;
        this.goingUp = false;
        this.goingDown = false;
        this.goingLeft = false;
        this.goingRight = false;
        this.images = [ new Image(), new Image(), new Image(), new Image() ];

        // this.images = [ new Image(90,130), new Image(70,134), new Image(92,132), new Image(70, 132) ];
        this.images[Directions.UP].src = 'imgs/player-back.png';
        this.images[Directions.RIGHT].src = 'imgs/player-right.png';
        this.images[Directions.DOWN].src = 'imgs/player-front.png';
        this.images[Directions.LEFT].src = 'imgs/player-left.png';
    }

    update() {
        let deltaX = 0;
        let deltaY = 0;
        if (this.goingUp) deltaY = -DISTANCE_TO_MOVE;
        if (this.goingDown) deltaY = DISTANCE_TO_MOVE;
        if (this.goingRight) deltaX = DISTANCE_TO_MOVE;
        if (this.goingLeft) deltaX = - DISTANCE_TO_MOVE;

        if (deltaX === 0 && deltaY === 0)
            return; // nothing else needed to update

        this.x += deltaX;
        this.y += deltaY;

        // first check if touching passages to other rooms.
        for (let i=0; i<passages.length; i++) {
            if (passages[i].activated && passages[i].inRangeOfPlayer(-20)) {
                newRoom(passages[i].destinationRoom, passages[i].destXAsPercent, passages[i].destYAsPercent);
                return;
            }
        }

        // check collisions and undo the move if collision detected.
        let collisionDetected = false;
        let touchingBridgeObject = false;

        for (let [word, thing] of Object.entries(thingsHere)) {
            if (thing.solid && thing.inRangeOfPlayer()) {
                collisionDetected = true;
                thing.handleCollision();
            }
            else if (thing.bridgelike && thing.inRangeOfPlayer(-40)) { // TODO: use defined const here
                    touchingBridgeObject = true;
            }
        }

        for (const boundary of boundaries) {
            if (boundary[5] === BoundaryType.HORIZONTAL || boundary[5] === BoundaryType.DIAGONAL) {
                if (this.x > (boundary[1] - DISTANCE_TO_MOVE) && this.x < (boundary[3] + DISTANCE_TO_MOVE)) {
                    const slope = (boundary[4] - boundary[2]) / (boundary[3] - boundary[1]);
                    const relX = this.x - boundary[1];
                    const boundaryYHere = boundary[2] + (relX * slope);
                    if (Math.abs(this.y - boundaryYHere) < this.halfHeight) {
                        collisionDetected = true;
                    }
                }
            }
            else if (boundary[5] === BoundaryType.VERTICAL) {
                if (this.x > (boundary[1] - this.halfWidth) &&
                    this.x < (boundary[1] + this.halfWidth) &&
                    this.y > (boundary[2] - this.halfHeight) &&
                    this.y < (boundary[4] + this.halfHeight)
                )
                    collisionDetected = true;
            }
        }

        // a collision with a solid thing or boundary is cancelled if player touches bridge-like object:
        if (touchingBridgeObject) {
            collisionDetected = false;
        }

        // check edge-of-play-area conditions; these aren't affected by bridge-like objects
        if (this.x < this.halfWidth ||
            this.x > PLAY_AREA_WIDTH - this.halfWidth ||
            this.y < this.halfHeight ||
            this.y > PLAY_AREA_HEIGHT - this.halfHeight) {
            collisionDetected = true;
        }

        if (collisionDetected && !cheating) {
            // undo the movement:
            this.x -= deltaX;
            this.y -= deltaY;
        }
    }

    draw() {
        ctx.drawImage(this.images[this.direction], this.x - this.halfWidth, this.y - this.halfHeight); // , this.width, this.height);
    }
}

class GameElement {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.halfWidth = 0;
        this.halfHeight = 0;
        this.image = undefined;
        this.collisionProfile = CollisionProfile.RECTANGULAR
    }
    inRangeOfPlayer(extraRadius = 0) {
        if (this.collisionProfile === CollisionProfile.RECTANGULAR) {
            return (player.x > (this.x - this.halfWidth - player.halfWidth - extraRadius) &&
                player.x < (this.x + this.halfWidth + player.halfWidth + extraRadius) &&
                player.y > (this.y - this.halfHeight - player.halfHeight - extraRadius) &&
                player.y < (this.y + this.halfHeight + player.halfHeight + extraRadius)
            );
        }
        else if (this.collisionProfile === CollisionProfile.ELLIPTICAL) {
            let relX = player.x - this.x;
            let relY = player.y - this.y;
            let horizAxis = this.halfWidth + player.halfWidth + extraRadius;
            let vertAxis = this.halfHeight + player.halfHeight + extraRadius;
            return ( (relX * relX) / (horizAxis * horizAxis) < 1 - ( (relY * relY) / (vertAxis * vertAxis)));
        }
        return false; // TODO: HANDLE OTHER COLLISION PROFILES
    }

    occupiesPoint(x, y) { // this is overridden by Thing to handle case where it's in inventory
        return ( x >= this.x - this.halfWidth &&
            x <= this.x + this.halfWidth &&
            y >= this.y - this.halfHeight &&
            y <= this.y + this.halfHeight );
    }
}

class Thing extends GameElement {
    constructor(word, room, x, y) {
        super();
        this.word = word;
        this.room = room;
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.image = new Image();
        this.image.onload = this.setDimensionsFromImage.bind(this); // "bind(this)" is needed to prevent handler code from treating "this" as the event-triggering element.
        this.image.src = levelPath + '/things/' + word.replace(' ','_')  + '.png';
        this.timeOfCreation = Date.now();
        this.movable = (immovableObjects.indexOf(word) < 0);
        this.solid = (solidObjects.indexOf(word) >= 0);
        this.bridgelike = (bridgelikeObjects.indexOf(word) >= 0);
        this.collisionProfile = (ellipticalObjects.indexOf(word) >= 0) ? CollisionProfile.ELLIPTICAL : CollisionProfile.RECTANGULAR;
        this.displayingWord = false;
        this.inventoryImageRatio = 2.5; // factor by which to reduce each dimension when drawing in inventory.
        this.destX = 0; // used if moving
        this.destY = 0;
        this.beginMovementTime = 0;
        this.movementDurationMS = 0;
        this.soundToPlayAfterMovement = undefined;
        this.messageToDisplayAfterMovement = undefined;
        this.deleteAfterMovement = false;
        this.playAudioWhenTransformed = true;
    }
    setDimensionsFromImage() { // this gets called as soon as image loads
        this.width = this.image.width; // take dimensions directly from image
        this.height = this.image.height;
        this.halfWidth = this.width / 2; // to avoid having to recalculate at every frame
        this.halfHeight = this.height / 2;
        drawInventory();
    }
    deleteFromThingsHere() {
        for (let [word,thing] of Object.entries(thingsHere)) {
            if (thing === this) {
                delete thingsHere[word];
            }
        }
    }
    update() {
        if (this.beginMovementTime != 0) {
            if (Date.now() > this.beginMovementTime + this.movementDurationMS) {
                this.x = this.destX;
                this.y = this.destY;
                if (typeof this.soundToPlayAfterMovement !== 'undefined')
                    this.soundToPlayAfterMovement.play();
                if (typeof this.messageToDisplayAfterMovement !== 'undefined')
                    displayMessage(this.messageToDisplayAfterMovement);
                if (this.deleteAfterMovement === true)
                    this.deleteFromThingsHere();
                this.beginMovementTime = 0;
            }
            else {
                let fractionTraversed = (Date.now() - this.beginMovementTime) / this.movementDurationMS;
                this.x = this.initialX + ((this.destX - this.initialX) * fractionTraversed);
                this.y = this.initialY + ((this.destY - this.initialY) * fractionTraversed);
            }
        }
    }
    draw() {
        if (this.word === fadeinWord) {
            let newAlpha = (Date.now() - fadeinTimer) / FADEOUT_DURATION_MS;
            if (newAlpha > 1.0) {
                newAlpha = 1.0;
                fadeinWord = '';
            }
            ctx.globalAlpha = newAlpha;
        }
        ctx.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }

    setCoordinatesInInventory(index) {
        this.x = (index * INVENTORY_SPACING) + INVENTORY_LEFT_MARGIN;
        this.y = INVENTORY_TOP + INVENTORY_TOP_MARGIN;
    }

    //TODO: FADEIN / FADEOUT OF INVENTORY ITEMS
    drawInInventory(index) {
        this.setCoordinatesInInventory(index);
        ctx.drawImage(this.image, this.x - this.width / this.inventoryImageRatio, this.y - this.height / this.inventoryImageRatio,
            this.halfWidth,
            this.halfHeight);
    }

    // tryToPickUp() returns 1 if successful else 0 :
    tryToPickUp() {
        // only call this on things in thingsHere in range of player.
        if (this.movable) {
            if (Object.keys(inventory).length >= MAX_ITEMS_IN_INVENTORY) {
                displayMessage('Too many things in inventory!');
            }
            else {
                this.x = -200;
                this.y = -200; // the drawInventory method will reposition the thing.
                inventory[this.word] = this;
                delete thingsHere[this.word];
                return 1;
            }
        }
        else {
            return 0;
        }
    }

    discard() {
        delete inventory[this.word];
        this.room = currentRoom;
        this.x = player.x;
        this.y = player.y;
        let distanceToToss = player.halfWidth + this.halfWidth;
        if (player.direction === Directions.UP)
            this.y -= distanceToToss;
        else if (player.direction === Directions.DOWN)
            this.y += distanceToToss;
        else if (player.direction === Directions.LEFT)
            this.x -= distanceToToss;
        else if (player.direction === Directions.RIGHT)
            this.x += distanceToToss;

        thingsHere[this.word] = this;
        sounds['pickup'].play();
    }

    occupiesPoint(x, y) { // Thing overrides this to handle case where it's in inventory

        let adjustedWidth = this.halfWidth;
        let adjustedHeight = this.halfHeight;
        if (this.word in inventory) {
            adjustedHeight = adjustedHeight / this.inventoryImageRatio;
            adjustedWidth = adjustedWidth / this.inventoryImageRatio;
        }

        return ( x >= (this.x - adjustedWidth) &&
                x <= (this.x + adjustedWidth) &&
                y >= (this.y - adjustedHeight) &&
                y <= (this.y + adjustedHeight) );
    }

    displayCantPickUpMessage() {
        displayMessage("This object cannot be picked up.", this.x, this.y);
    }

    // particular Thing subclasses may override this:
    handleClick() {
        if (this.word in inventory) {
            if (currentRoom === 'darkroom') {
                displayMessage("Don't put anything down here, you might lose it!");
            }
            else {
                this.discard();
            }
            return;
        }
        if (!this.movable) {
            this.displayCantPickUpMessage();
            return;
        }
        if (!this.inRangeOfPlayer(EXTRA_PICKUP_RADIUS)) {
            displayMessage("You must be closer to pick up.");
            return;
        }
        this.tryToPickUp();
        sounds['pickup'].play();
    }

    // placeholder methods that subclasses needing specific behavior can override:

    okayToDisplayWord() { return true; }

    handleCollision() {}

    checkIfOkayToTransform() {
        return true; // specific things could override this.
    }

    extraTransformFromBehavior() {}

    extraTransformIntoBehavior() {}
}

class Passage extends GameElement {
    constructor(type, xAsPercent, yAsPercent, destinationRoom, destXAsPercent, destYAsPercent, activated = true) {
        super();
        // this.originRoom = originRoom; note -- currently don't need to specify originRoom because passage data will be packaged into room data.
        this.type = type;
        this.x = xAsPercent * xScaleFactor;
        this.y = yAsPercent * yScaleFactor;
        this.destinationRoom = destinationRoom;
        this.destXAsPercent = destXAsPercent;
        this.destYAsPercent = destYAsPercent;
        this.activated = activated;
        if ( this.type.indexOf('left') >= 0 || this.type.indexOf('right') >= 0 || this.type.indexOf('vertical') >= 0) {
            this.height = PASSAGE_LENGTH;
            this.width = PASSAGE_WIDTH;
        }
        else {
            this.height = PASSAGE_WIDTH;
            this.width = PASSAGE_LENGTH;
        }
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
        if ( this.type.indexOf('invisible') >= 0) {
            this.image = undefined;
        } else {
            this.image = new Image(this.width,this.height);
            this.image.src = 'imgs/passages/passage-' + this.type + '.png'; // IF STICKING WITH THIS STRATEGY, CAN DELETE passageImages VARIABLE.
        }
    }
    draw() {
        if (typeof this.image != 'undefined')
            ctx.drawImage(this.image,this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);
    }
}

function displayWord(word, x, y) {
    // wordDivs is array of "caption" divs available which can display at the same time.
    // see if already showing this word in one of the divs, if so just reset its duration timer.
    let firstUsableIndex = -1;
    for (let i = 0; i < 10; i++) {
        if  (wordDivs[i].innerText === word && Date.now() <= wordTimers[i] + WORD_DURATION_MS) {
            return;
        }
        if (firstUsableIndex === -1 && Date.now() > wordTimers[i] + WORD_DURATION_MS) {
            firstUsableIndex = i;
        }
    }

    if (firstUsableIndex === -1)
        return; // all word caption divs being used already, oh well.

    let divHeight = (word.indexOf(' ') > 0 || word.indexOf('-') > 0) ? '60px' : '30px';

    wordTimers[firstUsableIndex] = Date.now();
    wordDivs[firstUsableIndex].innerText = word;
    wordDivs[firstUsableIndex].style = 'display:block; top:' + (y + canvasOffsetY + 20) + 'px; left:' + (x + canvasOffsetX - 35) + 'px; ' +
        'height:' + divHeight;
    window.setTimeout(stopDisplayingWord, WORD_DURATION_MS);
}

function stopDisplayingWord(forceHideAll = false) {
    for (let i = 0; i < NUMBER_OF_CAPTION_DIVS; i++) {
        if (forceHideAll || Date.now() >= wordTimers[i] + WORD_DURATION_MS - 100) {
            wordDivs[i].style = 'display:none';
        }
    }
}

function pickUpNearbyThings() {
    let numberOfThingsPickedUp = 0;
    for (let [word, thing] of Object.entries(thingsHere)) {
        if (thing.inRangeOfPlayer(EXTRA_PICKUP_RADIUS)) {
            numberOfThingsPickedUp += thing.tryToPickUp();
        }
    }
    if (numberOfThingsPickedUp > 0) {
        sounds['pickup'].play();
        drawInventory();
    }
}

function stopDisplayingMsg() {
    document.getElementById('player-message').style = 'display:none;';
}

function displayMessage(msg, x = undefined, y = undefined) {
    if (typeof x === 'undefined') {
        x = CANVAS_WIDTH / 2;
        y = CANVAS_HEIGHT / 4;
    }
    else {
        y = y - 32;
    }
    x += canvasOffsetX - 90;
    y += canvasOffsetY;
    messageTimer = Date.now();
    let msgDiv = document.getElementById('player-message');
    msgDiv.innerText = msg;
    msgDiv.style = 'display:block;';
    msgDiv.style.top = y.toString() + 'px';
    msgDiv.style.left = x.toString() + 'px';
    window.setTimeout(stopDisplayingMsg, MESSAGE_DURATION_MS);
}

function spellAvailable(spell) {
    // returns whether user has the requested spell or a strictly more powerful spell.
    return (spellsAvailable.indexOf(spell) >= 0 ||
        (spell === allSpells.SPELL_ADD_EDGE && spellsAvailable.indexOf(allSpells.SPELL_ADD) >= 0) ||
        (spell === allSpells.SPELL_REMOVE_EDGE && spellsAvailable.indexOf(allSpells.SPELL_REMOVE) >= 0) ||
        (spell === allSpells.SPELL_REVERSAL && spellsAvailable.indexOf(allSpells.SPELL_ANAGRAM) >= 0) ||
        (spell === allSpells.SPELL_CHANGE_EDGE && spellsAvailable.indexOf(allSpells.SPELL_CHANGE) >= 0)
    );
}

function parseCommand(command) {
    let error = '';
    let fromWord = '';
    let toWord = '';
    let index = command.indexOf('>');
    if (index < 0)
        return { error: 'Spells must have form "fromWord > toWord".'};
    fromWord = command.substring(0,index-1).trim();
    toWord = command.substring(index+1).trim();
    if (fromWord.length < 1 || toWord.length < 1)
        return { error: 'Spells must have form "fromWord > toWord".'};
    return {fromWord : fromWord, toWord : toWord};
}

function addSpellToBinder(spellName) {
    sounds['add-spell'].play();
    displayMessage('You found a new binder page!');
    if (spellsAvailable.indexOf(spellName) < 0)
        spellsAvailable.push(spellName);
    pageToShow = spellName;
    window.setTimeout(showNewBinderPage,1300);
}

function showNewBinderPage() {
    pageBeingShownInBinder = pageToShow;
}
function castSpell() {
    let command = window.prompt('Cast a spell:');
    if (typeof command !== 'string' || command.length < 1)
        return;
    let response = parseCommand(command);
    if (typeof response.error === 'string') {
        displayMessage(response.error);
        return;
    }
    let fromWord = response.fromWord;
    let toWord = response.toWord;
    let inInventory = (fromWord in inventory);
    let sourceThing = undefined;

    // check whether fromWord is in inventory or in thingsHere:
    if (inInventory) {
        sourceThing = inventory[fromWord];
    } else if (fromWord in thingsHere) {
        sourceThing = thingsHere[fromWord];
        if (!sourceThing.inRangeOfPlayer(EXTRA_SPELL_RADIUS)) {
            displayMessage('Too far away to transform.');
            return;
        }
    }
    else {
        displayMessage('Nothing called "' + fromWord + '" is available here.');
        return;
    }

    if (allWords.indexOf(toWord) < 0) { // target word not recognized as a possible object
        displayMessage("Sorry, that didn't work.");
        return;
    }

    // have now verified the fromWord is available and toWord is a thing; find out what kind of transformation this is
    let spellRequested = '';
    let runeNeeded = undefined;
    let runeReleased = undefined;

    if (toWord === fromWord + toWord.substr(toWord.length - 1)) {
        spellRequested = allSpells.SPELL_ADD_EDGE;
        runeNeeded = toWord.substr(toWord.length - 1);
    }
    else if (toWord === toWord.substr(0,1) + fromWord) {
        spellRequested = allSpells.SPELL_ADD_EDGE;
        runeNeeded = toWord.substr(0,1)
    }
    else if (toWord === fromWord.substr(0, fromWord.length - 1)) {
        spellRequested = allSpells.SPELL_REMOVE_EDGE;
        runeReleased = fromWord.substr(fromWord.length - 1);
    }
    else if (toWord === fromWord.substr(1, fromWord.length - 1)) {
        spellRequested = allSpells.SPELL_REMOVE_EDGE;
        runeReleased = fromWord.substr(0, 1);
    }
    else if (toWord === fromWord.split('').reverse().join('')) {
        spellRequested = allSpells.SPELL_REVERSAL;
    }

    // TODO: check for SPELL_ANAGRAM, SPELL_SYNONYM, etc.

    if (!spellAvailable(spellRequested)) {
        displayMessage("Sorry, that didn't work!");
        return;
    }

    if (typeof runeNeeded != 'undefined' && runes.indexOf(runeNeeded) < 0) {
        displayMessage("Sorry, you need a rune: " + runeNeeded);
        return;
    }

    if (!sourceThing.checkIfOkayToTransform())
        return;

    // *** if we got here then the spell worked ***

    if (typeof runeNeeded != 'undefined')
    {
        const indexToDelete = runes.indexOf(runeNeeded);
        if (indexToDelete >= 0) // this should already have been checked, but just to be sure ...
            runes.splice(indexToDelete,1); // removes the needed rune from player's collection.
    }

    sourceThing.extraTransformFromBehavior();

    if (sourceThing.playAudioWhenTransformed === true)
        sounds['spell'].play();

    // remove the source thing:
    if (inInventory)
        delete inventory[fromWord];
    else
        delete thingsHere[fromWord];

    // note that as of this comment, getThingButPossiblySubclass is in word_data.js,
    // also note "false" here means treat x and y as actual coordinates rather than percentages:
    let newObject = getThing(toWord, currentRoom, sourceThing.x, sourceThing.y, false);

    if (inInventory) {
        inventory[toWord] = newObject;
    }
    else {
        thingsHere[toWord] = newObject;
    }

    if (inInventory && !newObject.movable) {
        newObject.discard();
    }

    if (typeof runeReleased != 'undefined') {
        runes.push(runeReleased);
    }

    if (inInventory)
        drawInventory();

    levelSpecificPostTransformBehavior(fromWord,toWord); // should move this into extraTransformIntoBehavior

    newObject.extraTransformIntoBehavior();

    fadeinTimer = Date.now();
    fadeinWord = toWord;
}

function drawInventory() {
    ctx.clearRect(INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT);
    ctx.beginPath();
    ctx.lineWidth = "6";
    ctx.strokeStyle = "black";
    ctx.rect(INVENTORY_LEFT, INVENTORY_TOP, INVENTORY_WIDTH, INVENTORY_HEIGHT);
    ctx.stroke();
    let index = 0;
    for (let [word, thing] of Object.entries(inventory)) {
        thing.drawInInventory(index);
        index++;
    }
    for (let i = 0; i < runes.length; i++)
    {
        let x = INVENTORY_LEFT + INVENTORY_WIDTH - INVENTORY_LEFT_MARGIN - (38 * Math.round((i-1)/2));
        let y = INVENTORY_TOP + 5 + (48 * (i % 2));
        ctx.drawImage(runeImages[runes[i].charCodeAt(0) - 97], x, y, RUNE_WIDTH / 2.3, RUNE_HEIGHT / 2.3);
    }
}

function showBinder() {
    pageBeingShownInBinder = allSpells.BINDER_COVER;
}

function toggleMusic() {
    if (typeof backgroundMusic === 'object') {
        if (musicPlaying === false) {
            musicPlaying = true;
            backgroundMusic.loop = true;
            backgroundMusic.play();
        } else {
            musicPlaying = false;
            backgroundMusic.pause();
        }
    }
}

function animate() {

    // clear and draw background for current room:
    ctx.clearRect(0, 0,  PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    // ctx.drawImage(backgroundImage, 0, 0, 2474, 2000, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // fill all filledPolygons if any:
    if (typeof filledPolygons !== 'undefined') {
        ctx.fillStyle = 'black';
        for (let i = 0; i < filledPolygons.length; i++) {
            const polygon = filledPolygons[i];
            const pType = polygon[0];
            if (pType === 'r') {
                ctx.fillRect(polygon[1],polygon[2],polygon[3],polygon[4]);
            }
            else if (pType === 'p') {
                ctx.beginPath()
                ctx.moveTo(polygon[1],polygon[2]);
                for (let j = 3; j < polygon.length; j += 2) {
                    ctx.lineTo(polygon[j], polygon[j+1]);
                }
                ctx.lineTo(polygon[1], polygon[2]);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    // draw all boundaries in current room
    for (let i = 0; i < boundaries.length; i++) {
        if (boundaries[i][0].startsWith('i'))
            continue; // don't draw boundaries marked as invisible
        ctx.strokeStyle = 'green';
        ctx.beginPath();
        ctx.moveTo(boundaries[i][1], boundaries[i][2]);
        ctx.lineTo(boundaries[i][3], boundaries[i][4]);
        ctx.stroke();
    }

    // draw the non-invisible passages in current room
    for (let i = 0; i < passages.length; i++) {
        passages[i].draw();
    }

    // draw all things sitting in current room
    for (let [word, thing] of Object.entries(thingsHere)) {
        thing.update();
        thing.draw();
    }

    // COLLISION DETECTION NOW DONE IN PLAYER.UPDATE
    player.update();
    player.draw();

    if (pageBeingShownInBinder != '') {
        ctx.drawImage(binderImages[pageBeingShownInBinder], 0, 0);
    }

    levelSpecificAnimateLoopBehavior();

    requestAnimationFrame(animate);
}

function teleport() {
    if (cheating) {
        let newRoomString = window.prompt('enter room name');
        if ((typeof newRoomString == 'string') && (newRoomString != ''))
            newRoom(newRoomString, 50, 50);
    }
}

function newRoom(newRoomName, newPlayerX, newPlayerY) {

    // note that in level data, x and y coordinates have values 0-100, to facilitate rescaling.
    // we convert to actual pixel values here.

    if (typeof currentRoom != 'undefined') {
        // coming from old room (rather than starting new level, so do the following:
        // stop displaying captions for things in the old room:
        stopDisplayingWord(true); // true forces all captions to hide
        sounds['whoosh'].play();
    }

    for (let [word, thing] of Object.entries(thingsHere)) {
        thingsElsewhere[word] = thing;
        delete thingsHere[word];
    }
    currentRoom = newRoomName;
    for (let [word, thing] of Object.entries(thingsElsewhere)) {
        if (thing.room === currentRoom) {
            thingsHere[word] = thing;
            delete thingsElsewhere[word];
            // put up captions for all things in new word.
            if (currentRoom !== 'darkroom')
                displayWord(thing.word, thing.x, thing.y);
        }
    }
    player.x = newPlayerX * xScaleFactor;
    player.y = newPlayerY * yScaleFactor;

    let roomData = rooms[newRoomName];
    passages = [];
    for (let i = 0; i < roomData.passages.length; i++){
        let p = roomData.passages[i];
        passages.push(p);
    }

    backgroundImage = new Image(CANVAS_WIDTH, CANVAS_HEIGHT);
    backgroundImage.src = '/imgs/rooms/' + newRoomName.replace(' ','_') + '.png';

    filledPolygons = [];
    if (typeof roomData.filledPolygons !== 'undefined') {
        for (let i = 0; i < roomData.filledPolygons.length; i++) {
            const p = roomData.filledPolygons[i];
            let scaledPolygon = [p[0]];
            for (let j = 1; j < p.length; j += 2) {
                scaledPolygon.push(p[j] * xScaleFactor);
                scaledPolygon.push(p[j + 1] * yScaleFactor);
            }
            filledPolygons.push(scaledPolygon);
        }
    }

    boundaries = [];
    if (typeof roomData.boundaries !== 'undefined') {
        for (let i = 0; i < roomData.boundaries.length; i++) {
            let b = roomData.boundaries[i];
            let orientation = (b[1] === b[3]) ? 'v' : 'd'; // v for vertical, d for diagonal (or horiz.)
            // going to use b[0] for "type" of boundary. if starts with 'i', consider it invisible.
            // to simplify collision detection, ensure that top point comes first (for vertical), and left pt for diag./horiz.
            if ((orientation === 'v' && b[2] > b[4]) || (orientation != 'v' && b[1] > b[3])) {
                let temp1 = b[1];
                let temp2 = b[2];
                b[1] = b[3];
                b[2] = b[4];
                b[3] = temp1;
                b[4] = temp2;
            }
            boundaries.push([b[0], b[1] * xScaleFactor, b[2] * yScaleFactor,
                b[3] * xScaleFactor, b[4] * yScaleFactor, orientation]);
        }
    }

    if (typeof levelSpecificNewRoomBehavior === 'function')
        levelSpecificNewRoomBehavior(newRoomName);
}

function loadLevel(lName = 'intro level') {
    console.log('loading level ' + lName);
    canvas.style.display = 'block';
    levelName = lName;
    levelPath = 'levels/' + lName.replace(' ','_');

    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'none';
    showingIntroPage = false;

    let levelData = getLevelData(lName);

    currentRoom = undefined;
    inventory = levelData.initialInventory; // note copying by reference OK here b/c getLevelData initializes with literals
    thingsHere = {}; // in newRoom(), things will be moved from thingsElsewhere to thingsHere.
    thingsElsewhere = levelData.initialThings;
    spellsAvailable = levelData.initialSpells;
    runes = levelData.initialRunes;
    rooms = levelData.rooms;
    otherData = levelData.otherGameData;
    levelSpecificNewRoomBehavior = levelData.levelSpecificNewRoomBehavior;
    levelSpecificAnimateLoopBehavior = levelData.levelSpecificAnimateLoopBehavior;
    levelSpecificPostTransformBehavior = levelData.levelSpecificPostTransformBehavior;
    levelSpecificInitialization = levelData.levelSpecificInitialization;
    levelSpecificKeydownBehavior = levelData.levelSpecificKeydownBehavior;
    levelSpecificClickBehavior = levelData.levelSpecificClickBehavior;

    if (typeof levelSpecificInitialization === 'function') {
        levelSpecificInitialization();
    }

    if (typeof levelData.backgroundMusicFile !== 'undefined') {
        backgroundMusic = new Audio(levelPath + '/audio/' + levelData.backgroundMusicFile);
    }

    newRoom(levelData.initialRoom, levelData.initialX, levelData.initialY);

    animate();
}

function handleMouseMove(e) {
    if (showingIntroPage || pageBeingShownInBinder != '')
        return;

    let xWithinCanvas = e.x - canvasOffsetX;
    let yWithinCanvas = e.y - canvasOffsetY;

    // check all objects on screen; if hovering over, display object name.
    for (let [word, thing] of Object.entries(thingsHere)) {
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas) && thing.okayToDisplayWord()) {
            displayWord(thing.word, thing.x, thing.y);
        }
    }
    for (let [word, thing] of Object.entries(inventory)) {
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas)) {
            displayWord(thing.word, thing.x, thing.y);
        }
    }
}

function handleKeydown(e) {
    if (showingIntroPage)
        return;
    if (pageBeingShownInBinder !== '') {
        handleKeyInBinderViewMode(e);
        return;
    }
    else if (normalPlayerInputSuppressed === false) {
        switch (e.code) {
            case 'ArrowRight' :
            case 'KeyD' :
                player.goingRight = true;
                player.direction = Directions.RIGHT;
                break;
            case 'ArrowLeft' :
            case 'KeyA' :
                player.goingLeft = true;
                player.direction = Directions.LEFT;
                break;
            case 'ArrowUp' :
            case 'KeyW' :
                player.goingUp = true;
                player.direction = Directions.UP;
                break;
            case 'ArrowDown' :
            case 'KeyS' :
                player.goingDown = true;
                player.direction = Directions.DOWN;
                break;

            case 'Space' : pickUpNearbyThings(); break;
            case 'KeyB' : showBinder(); break;
            case 'KeyC' : castSpell(); break;
            case 'KeyI' : drawInventory(); break;
            case 'KeyT' : teleport(); break;
            case 'KeyQ' : cheating = !cheating; // use to toggle cheating on and off.
        }
    }
}

function handleKeyInBinderViewMode(e) {
    // in "show binder" mode so normal input suppressed.
    switch (e.code) {
        case 'ArrowRight' :
            if (pageBeingShownInBinder === allSpells.BINDER_COVER)
                pageBeingShownInBinder = allSpells.BINDER_INTRO;
            else if (pageBeingShownInBinder === allSpells.BINDER_INTRO)
                pageBeingShownInBinder = spellsAvailable[0];
            else {
                const curIndex = spellsAvailable.indexOf(pageBeingShownInBinder);
                pageBeingShownInBinder = (curIndex >= spellsAvailable.length - 1) ? allSpells.BINDER_COVER : spellsAvailable[curIndex + 1];
            }
            break;
        case 'ArrowLeft' :
            if (pageBeingShownInBinder === allSpells.BINDER_INTRO)
                pageBeingShownInBinder = allSpells.BINDER_COVER;
            else if (pageBeingShownInBinder === allSpells.BINDER_COVER)
                pageBeingShownInBinder = spellsAvailable[spellsAvailable.length - 1];
            else {
                const curIndex = spellsAvailable.indexOf(pageBeingShownInBinder);
                pageBeingShownInBinder = (curIndex === 0) ? allSpells.BINDER_INTRO : spellsAvailable[curIndex - 1];
            }
            break;
        case 'Space' :
        case 'KeyB' :
            pageBeingShownInBinder = '';
            drawInventory(); // shouldn't be necessary when page images are scaled properly but for now they stray into inventory area.
            break;
    }
}

function handleKeyup(e) {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD' : player.goingRight = false; break;
        case 'ArrowLeft':
        case 'KeyA' : player.goingLeft = false; break;
        case 'ArrowUp':
        case 'KeyW' : player.goingUp = false; break;
        case 'ArrowDown' :
        case 'KeyS' : player.goingDown = false; break;
    }
}

function handleClick(e) {
    if (showingIntroPage) {
        // TODO: maybe handle clicks on intro page programatically here??
        return;
    }
    else if (pageBeingShownInBinder != '') {
        pageBeingShownInBinder = '';
        return;
    }
    let xWithinCanvas = e.x - canvasOffsetX;
    let yWithinCanvas = e.y - canvasOffsetY;

    // first see if level-specific code says it will handle the click:
    if (levelSpecificClickBehavior(xWithinCanvas,yWithinCanvas) === true) {
        return;
    }

    for ([word, thing] of Object.entries(inventory)) {
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas))
            thing.handleClick();
    }

    for ([word, thing] of Object.entries(thingsHere)) {
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas))
            thing.handleClick();
    }
    drawInventory(); // important not to call this in individual Things' implementations of handleClick()!

}

// this is for the very first, non-level-specific setup tasks:
function initialize() {
    // the variables initialized here were actually declared above
    // so as to have global scope.

    player = new Player();
    sounds = {};
    const soundlist = ['host_speech', 'pickup', 'add-spell',
        'pop','rattle','tada','whoosh','zoop'];

    for (let i = 0; i < soundlist.length; i++) {
        sounds[soundlist[i]] = new Audio('audio/' + soundlist[i] + '.wav');
    }
    sounds['spell'] = new Audio('audio/magical_1.ogg')

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    // load rune images
    for (i=0; i<26; i++) {
        let lower = String.fromCharCode(i + 97);
        let upper = String.fromCharCode(i + 65);
        let runeImage = new Image(RUNE_WIDTH,RUNE_HEIGHT);
        runeImage.src = 'imgs/runes/Rune-' + upper + '.png';
        runeImages.push(runeImage);
    }

    // load binder page images
    binderImages = {};
    for (let [key, name] of Object.entries(allSpells)) {
        let img = new Image();
        img.src = 'imgs/binder/binder-' + name + '.png';
        binderImages[name] = img;
    }

    let bounds = canvas.getBoundingClientRect();
    canvasOffsetX = bounds.left; // + window.scrollX;
    canvasOffsetY = bounds.top; // + window.scrollY;

    wordDivs = [];
    wordTimers = [];
    for (let i=0; i<NUMBER_OF_CAPTION_DIVS; i++) {
        wordDivs.push(document.getElementById('word-bubble-' + i.toString()));
        wordTimers.push(0);
    }
}

function showIntroScreen() {
    canvas.style.display = 'none';
    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'block';
   // document.getElementById('loadLevelButton').addEventListener('click',loadLevel);
}

initialize();

showIntroScreen();

