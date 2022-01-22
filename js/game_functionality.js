/*  game_functionality.js
    javascript code to run Spell-Binder game
    Doug McLellan 1/2022
*/

/* global-scope variables: */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 600; const CANVAS_HEIGHT = 600;
const PLAY_AREA_WIDTH = 600; const PLAY_AREA_HEIGHT = 500;
const INVENTORY_WIDTH = 600; const INVENTORY_HEIGHT = 100; const INVENTORY_LEFT = 0; const INVENTORY_TOP = 500;
const INVENTORY_TOP_MARGIN = 58; const INVENTORY_LEFT_MARGIN = 40; const INVENTORY_SPACING = 95;
const MAX_ITEMS_IN_INVENTORY = 3;
const RUNE_WIDTH = 65; const RUNE_HEIGHT = 92;
const PASSAGE_WIDTH = 55;
const PASSAGE_LENGTH = 150;
let canvasOffsetX = 0; // will be set in initialize()
let canvasOffsetY = 0;
const PLAYER_HEIGHT = 135;
const PLAYER_WIDTH = 90;
const EXTRA_SPELL_RADIUS = 50;
const EXTRA_PICKUP_RADIUS = 20;
const DISTANCE_TO_MOVE = 4;
const SPELL_ADD_EDGE = 'add-edge';
const SPELL_REMOVE_EDGE = 'remove-edge';
const SPELL_REVERSAL = 'reversal';
const SPELL_ANAGRAM = 'anagram';
const SPELL_SYNONYM = 'synonym';
const SPELL_ADD = 'add';
const SPELL_REMOVE = 'remove';
const SPELL_CHANGE_EDGE = 'change-edge';
const SPELL_CHANGE = 'change';
let CollisionProfile = { RECTANGULAR : 'RECTANGULAR', ELLIPTICAL : 'ELLIPTICAL'};
let BoundaryType = { VERTICAL : 'v', HORIZONTAL : 'h', DIAGONAL : 'd'};
let thingsElsewhere = {};
let inventory = {};
let thingsHere = {};
let spellsAvailable = [];
let runes = [];
let runeImages = [];
let rooms = {};
let passages = [];
let passageImages = {};
let boundaries = [];
let currentRoom = '';
let player = {};
let sounds = {};
let backgroundImage = new Image();
let messageTimer = 0; // used to keep multiple messages from triggering onto screen at same time.
const MESSAGE_DURATION_MS = 1500;
const FADEOUT_DURATION_MS = 1200;
let fadeoutTimer = 0;
let fadeinTimer = 0;
let fadeoutWord = '';
let fadeinWord = '';

let PassageTypes = { BASIC_VERTICAL : 'basic-vertical',
    BASIC_HORIZONTAL : 'basic-horizontal',
    BASIC_LEFT : 'basic-left',
    BASIC_RIGHT : 'basic-right',
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

        if (deltaX == 0 && deltaY == 0)
            return; // nothing else needed to update

        this.x += deltaX;
        this.y += deltaY;

        // first check if touching passages to other rooms.
        for (let i=0; i<passages.length; i++) {
            if (passages[i].inRangeOfPlayer(-20)) {
                newRoom(passages[i].destinationRoom, passages[i].destX, passages[i].destY);
                return;
            }
        }

        // check collisions and undo the move if collision detected.
        let collisionDetected = false;

        // first just check edge-of-play-area conditions:
        if (this.x < this.halfWidth ||
            this.x > PLAY_AREA_WIDTH - this.halfWidth ||
            this.y < this.halfHeight ||
            this.y > PLAY_AREA_HEIGHT - this.halfHeight) {
            collisionDetected = true;
        }

        for (let [word, thing] of Object.entries(thingsHere)) {
            if (thing.solid && thing.inRangeOfPlayer()) {
                collisionDetected = true;
            }
        }

        // TODO: don't really need to do the following if collision already detected.
        for (const boundary of boundaries) {
            if (boundary[0] == BoundaryType.HORIZONTAL) {
                if (this.x > (boundary[1] - this.halfWidth) &&
                    this.x < (boundary[3] + this.halfWidth) &&
                    this.y > (boundary[2] - this.halfHeight) &&
                    this.y < (boundary[2] + this.halfHeight)
                )
                    collisionDetected = true;
            }
            else if (boundary[0] == BoundaryType.VERTICAL) {
                if (this.x > (boundary[1] - this.halfWidth) &&
                    this.x < (boundary[1] + this.halfWidth) &&
                    this.y > (boundary[2] - this.halfHeight) &&
                    this.y < (boundary[4] + this.halfHeight)
                )
                    collisionDetected = true;
            }
        }

        if (collisionDetected) {
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
        this.image = new Image();
        this.image.onload = this.setDimensionsFromImage.bind(this); // "bind(this)" is needed to prevent handler code from treating "this" as the event-triggering element.
        this.image.src = 'imgs/things/' + word + '.png';
        this.movable = !(word in immovableObjects);
        this.solid = (word in solidObjects);
        this.bridgelike = (word in bridgelikeObjects);
        this.collisionProfile = CollisionProfile.RECTANGULAR; // should set up elliptical option here too.
        this.displayingWord = false;
        this.inventoryImageRatio = 2.5; // factor by which to reduce each dimension when drawing in inventory.
    }
    setDimensionsFromImage() { // this gets called as soon as image loads
        this.width = this.image.width; // take dimensions directly from image
        this.height = this.image.height;
        this.halfWidth = this.width / 2; // to avoid having to recalculate at every frame
        this.halfHeight = this.height / 2;
        drawInventory();
    }
    update() {

    }
    draw() {
        if (this.word == fadeinWord) {
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
        this.x = player.x;
        this.y = player.y;
        let distanceToToss = player.halfWidth + this.halfWidth;
        if (player.direction == Directions.UP)
            this.y -= distanceToToss;
        else if (player.direction == Directions.DOWN)
            this.y += distanceToToss;
        else if (player.direction == Directions.LEFT)
            this.x -= distanceToToss;
        else if (player.direction == Directions.RIGHT)
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


    // particular Thing subclasses may override this:
    handleClick() {
        if (this.word in inventory) {
            this.discard();
            return;
        }

        if (!this.movable) {
            displayMessage("This object cannot be picked up.");
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

    checkIfOkayToTransform() {
        return true; // specific things could override this.
    }

    extraTransformFromBehavior() {}

    extraTransformIntoBehavior() {}
}

class Passage extends GameElement {
    constructor(type, x, y, destinationRoom, destX, destY) {
        super();
        // this.originRoom = originRoom; note -- currently don't need to specify originRoom because passage data will be packaged into room data.
        this.type = type;
        this.x = x;
        this.y = y;
        this.destinationRoom = destinationRoom;
        this.destX = destX;
        this.destY = destY;
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
            ctx.drawImage(this.image,this.x - this.halfWidth, this.y - this.halfHeight);
    }
}

function displayWord(word, x, y) {
    if (Date.now() > messageTimer + MESSAGE_DURATION_MS) {
        messageTimer = Date.now();
        let wordDiv = document.getElementById('word-bubble');
        wordDiv.innerText = word;
        wordDiv.style = 'display:block; top:' + (y + canvasOffsetY) + 'px; left:' + (x + canvasOffsetX) + 'px;';
        window.setTimeout(stopDisplayingWord, MESSAGE_DURATION_MS);
    }
}

function stopDisplayingWord() {
    document.getElementById('word-bubble').style = 'display:none';
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

function displayMessage(msg) {
    alert(msg); // simplest for now.
}

function spellAvailable(spell) {
    // returns whether user has the requested spell or a strictly more powerful spell.
    return (spellsAvailable.indexOf(spell) >= 0 ||
        (spell === SPELL_ADD_EDGE && spellsAvailable.indexOf(SPELL_ADD) >= 0) ||
        (spell === SPELL_REMOVE_EDGE && spellsAvailable.indexOf(SPELL_REMOVE) >= 0) ||
        (spell === SPELL_REVERSAL && spellsAvailable.indexOf(SPELL_ANAGRAM) >= 0) ||
        (spell === SPELL_CHANGE_EDGE && spellsAvailable.indexOf(SPELL_CHANGE) >= 0)
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

function castSpell() {
    let response = parseCommand(window.prompt('Cast a spell:'));
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

    if (! toWord in allWords) { // target word not recognized as a possible object
        displayMessage("Sorry, that didn't work.");
        return;
    }

    // have now verified the fromWord is available and toWord is a thing; find out what kind of transformation this is
    let spellRequested = '';
    let runeNeeded = undefined;
    let runeReleased = undefined;

    if (toWord == fromWord + toWord.substr(toWord.length - 1)) {
        spellRequested = SPELL_ADD_EDGE;
        runeNeeded = toWord.substr(toWord.length - 1);
    }
    else if (toWord == toWord.substr(0,1) + fromWord) {
        spellRequested = SPELL_ADD_EDGE;
        runeNeeded = toWord.substr(0,1)
    }
    else if (toWord == fromWord.substr(0, fromWord.length - 1)) {
        spellRequested = SPELL_REMOVE_EDGE;
        runeReleased = fromWord.substr(fromWord.length - 1);
    }
    else if (toWord == fromWord.substr(1, fromWord.length - 1)) {
        spellRequested = SPELL_REMOVE_EDGE;
        runeReleased = fromWord.substr(0, 1);
    }
    else if (toWord == fromWord.split('').reverse().join('')) {
        spellRequested = SPELL_REVERSAL;
    }

    // TODO: check for SPELL_ANAGRAM, SPELL_SYNONYM, etc.
// alert(spellRequested);

/*    alert (spellRequested);  alert (runeNeeded); alert (runeReleased); */
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

    // if we got here then the spell worked.
    if (typeof runeNeeded != 'undefined')
    {
        const indexToDelete = runes.indexOf(runeNeeded);
        if (indexToDelete >= 0) // this should already have been checked, but just to be sure ...
            runes.splice(indexToDelete,1); // removes the needed rune from player's collection.
    }

    sourceThing.extraTransformFromBehavior();

    sounds['pickup'].play(); // obviously need correctly named sound here

    // remove the source thing:
    if (inInventory)
        delete inventory[fromWord];
    else
        delete thingsHere[fromWord];

    // create the new thing:
    let newWordCapitalized = toWord.charAt(0).toUpperCase() + toWord.slice(1);
    let newClass = window[newWordCapitalized];
    // if toWord has its own subclass, the typeof newClass will be "function", otherwise "undefined"
    let newObject;
    if (typeof newClass === 'function') {
        newObject = new newClass(toWord, currentRoom, sourceThing.x, sourceThing.y);
    } else {
        newObject = new Thing(toWord, currentRoom, sourceThing.x, sourceThing.y);
    }

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

function animate() {

    // clear and draw background for current room:
    ctx.clearRect(0, 0,  PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    // ctx.drawImage(backgroundImage, 0, 0, 2474, 2000, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // draw all things sitting in current room
    for (let [word, thing] of Object.entries(thingsHere)) {
        thing.update();
        thing.draw();
    }

    // draw all boundaries in current room
    for (let i = 0; i < boundaries.length; i++) {
        ctx.strokeStyle = 'green';
        ctx.strokeRect( boundaries[i][1]-5,
            boundaries[i][2]-5,
            (boundaries[i][3] + 5 - boundaries[i][1]),
            (boundaries[i][4] + 5 - boundaries[i][2]));
    }

    // draw the non-invisible passages in current room
    for (let i = 0; i < passages.length; i++) {
        passages[i].draw();
    }

    // COLLISION DETECTION NOW DONE IN PLAYER.UPDATE
    player.update();
    player.draw();

    requestAnimationFrame(animate);
}

function newRoom(newRoomName, newPlayerX, newPlayerY) {
    if (typeof currentRoom != 'undefined')
        sounds['whoosh'].play();

    for (let [word, thing] of Object.entries(thingsHere)) {
        thingsElsewhere[word] = thing;
        delete thingsHere[word];
    }
    currentRoom = newRoomName;
    for (let [word, thing] of Object.entries(thingsElsewhere)) {
        if (thing.room == currentRoom) {
            thingsHere[word] = thing;
            delete thingsElsewhere[word];
        }
    }
    player.x = newPlayerX;
    player.y = newPlayerY;

    let roomData = rooms[newRoomName];
    passages = roomData.passages;
    boundaries = roomData.boundaries;
    backgroundImage = new Image(CANVAS_WIDTH, CANVAS_HEIGHT);
    backgroundImage.src = '/imgs/rooms/' + newRoomName.replace(' ','_') + '.png';

}

function loadLevel(levelName = '1') {
    console.log('loading level ' + levelName);
    canvas.style.display = 'block';

    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'none';

    let levelData = getLevelData(levelName);

    currentRoom = undefined;
    inventory = levelData.initialInventory; // note copying by reference OK here b/c getLevelData initializes with literals
    thingsHere = {}; // in newRoom(), things will be moved from thingsElsewhere to thingsHere.
    thingsElsewhere = levelData.initialThingsElsewhere;
    spellsAvailable = levelData.initialSpells;
    runes = levelData.initialRunes;
    rooms = levelData.rooms;

    newRoom(levelData.initialRoom, levelData.initialX, levelData.initialY);

    animate();
}

function handleMouseMove(e) {
    if (Date.now() <= messageTimer + MESSAGE_DURATION_MS)
        return; // already displaying a message so don't display another one

    let xWithinCanvas = e.x - canvasOffsetX;
    let yWithinCanvas = e.y - canvasOffsetY;

    // check all objects on screen; if hovering over, display object name.
    for (let [word, thing] of Object.entries(thingsHere)) {
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas)) {
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
    switch (e.code) {
        case 'ArrowRight' :
            player.goingRight = true;
            player.direction = Directions.RIGHT;
            break;
        case 'ArrowLeft' :
            player.goingLeft = true;
            player.direction = Directions.LEFT;
            break;
        case 'ArrowUp' :
            player.goingUp = true;
            player.direction = Directions.UP;
            break;
        case 'ArrowDown' :
            player.goingDown = true;
            player.direction = Directions.DOWN;
            break;

        case 'Space' : pickUpNearbyThings(); break;
        case 'KeyC' : castSpell(); break;
        case 'KeyI' : drawInventory();
    }
}

function handleKeyup(e) {
    switch (e.code) {
        case 'ArrowRight' : player.goingRight = false; break;
        case 'ArrowLeft' : player.goingLeft = false; break;
        case 'ArrowUp' : player.goingUp = false; break;
        case 'ArrowDown' : player.goingDown = false; break;
    }
}

function handleClick(e) {
    let xWithinCanvas = e.x - canvasOffsetX;
    let yWithinCanvas = e.y - canvasOffsetY;

    for ([word, thing] of Object.entries(thingsHere)) {
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas))
            thing.handleClick();
    }
    for ([word, thing] of Object.entries(inventory)) {
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
    const soundlist = ['glug','host_speech','kaching','om','pickup',
        'pop','rattle','tada','whoosh','yumyum','zoop'];

    for (let i = 0; i < soundlist.length; i++) {
        sounds[soundlist[i]] = new Audio('audio/' + soundlist[i] + '.wav');
    }

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

    let bounds = canvas.getBoundingClientRect();
    canvasOffsetX = bounds.left; // + window.scrollX;
    canvasOffsetY = bounds.top; // + window.scrollY;

}

function showIntroScreen() {
    canvas.style.display = 'none';
    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'block';
   // document.getElementById('loadLevelButton').addEventListener('click',loadLevel);
}

initialize();

showIntroScreen();

