/*  game_functionality.js
    javascript code to run Spell-Binder game
    Doug McLellan 1/2022
*/

/* TODO: deal with issue of doing setTimeouts whose handlers may not exist if you exit level.
TODO: prevent player input while spell is executing or waiting to execute.
 */
/* global-scope variables: */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 700; const CANVAS_HEIGHT = 700; const TOP_BINDER_AREA_HEIGHT = 100;
const PLAY_AREA_WIDTH = 700; const PLAY_AREA_HEIGHT = 500;
const xScaleFactor = PLAY_AREA_WIDTH / 100; const yScaleFactor = PLAY_AREA_HEIGHT / 100;
const INVENTORY_WIDTH = 700; const INVENTORY_HEIGHT = 100; const INVENTORY_LEFT = 0; const INVENTORY_TOP = 500;
const RUNE_X_SPACING = 44; const RUNE_Y_SPACING = 42;
const INVENTORY_TOP_MARGIN = 42; const INVENTORY_LEFT_MARGIN = 65; const INVENTORY_SPACING = 95;
const BINDER_ICON_WIDTH = 132;
const MAX_ITEMS_IN_INVENTORY = 6;
const RUNE_IMAGE_WIDTH = 65; const RUNE_IMAGE_HEIGHT = 92; const RUNE_DISPLAY_WIDTH = 32; const RUNE_DISPLAY_HEIGHT = 46;
const PASSAGE_WIDTH = 55;
const PASSAGE_LENGTH = 150;
const PASSAGE_STATE_INACTIVE = 0; const PASSAGE_STATE_BLOCKED = 1; const PASSAGE_STATE_ACTIVE = 2; const PASSAGE_STATE_OCCUPIED = 3;
let canvasOffsetX = 0; // will be set in initialize()
let canvasOffsetY = 0;
let binderIconLeft = 0;
const PLAYER_HEIGHT = 90;
const PLAYER_WIDTH = 60;
let EXTRA_SPELL_RADIUS = 260; // currently don't want to make distance an issue. in the future might need to reduce this though.
const EXTRA_PICKUP_RADIUS = 40;
const MIN_HALFWIDTH = 20;
const MIN_HALFHEIGHT = 20;
const MOVEMENT_TYPE_LINEAR = 0;
const MOVEMENT_TYPE_PARABOLIC = 1;
const allSpells = { ADD_EDGE:'add-edge', ADD_EDGE_NFS:'add-edge-nfs', REMOVE_EDGE:'remove-edge', REMOVE_EDGE_NFS:'remove-edge-nfs',
    REVERSAL : 'reversal', ANAGRAM : 'anagram', SYNONYM : 'synonym', ADD : 'add-letter', ADD_NFS : 'add-letter-nfs', REMOVE : 'remove-letter',
    REMOVE_NFS : 'remove-letter-nfs', CHANGE_EDGE : 'change-edge', CHANGE_EDGE_NFS : 'change-edge-nfs', CHANGE : 'change-letter',
    CHANGE_NFS : 'change-letter-nfs', BINDER_COVER : 'cover', BINDER_INTRO : 'intro' };
let binderImages = {};
let binderPageHtml = {};
let timeOfLastBinderOpening = 0;
let CollisionProfile = { RECTANGULAR : 'RECTANGULAR', ELLIPTICAL : 'ELLIPTICAL'};
let BoundaryType = { VERTICAL : 'v', HORIZONTAL : 'h', DIAGONAL : 'd'};
let levelList = [];
let getLevelFunctions = {};
let level = undefined;
let levelName = '';
let levelPath = ''; // to remove spaces etc. so can be used in file paths more easily
let score = 0;
let wordsFound = [];
let thingsElsewhere = {};
let inventory = {};
let thingsHere = {};
let spellsAvailable = [];
let runes = [];
let runeImages = []; let arrowImages = {};
let runeAcquisitionTime = 0;
let newRuneIndex = -1;
let runesBeingReleased = [];
let runesBeingAbsorbed = [];
let transformationToExecute = undefined;
let rooms = {};
let passages = [];
let boundaries = [];
let filledPolygons = [];
let otherData = {};
let currentRoom = '';
let player = {};
let destinationPassage = undefined;
let timeMod2200 = 0;
let arrowsAlpha = 0;
let arrowsAlphaLookupTable = [];
let sounds = {};
let backgroundImage = new Image();
let backgroundMusic = undefined;
let musicPlaying = false;
let normalPlayerInputSuppressed = false;
let playerImageSuppressed = false;
let messages = {}; // switching to strategy of having messages in a dictionary, indexed by messageCounter
let messageCounter = 0;
let standardMessagePositions = [];
const NUMBER_OF_FIXED_MESSAGE_DIVS = 3;
const DEFAULT_MESSAGE_DURATION = 2600;
const FADEOUT_DURATION_MS = 1200;
let fadeinTimer = 0;
let fadeinWord = '';
let frameCounter = 0;
let showingIntroPage = true;
let showingSpellInput = false;
let levelComplete = false;
let pageBeingShownInBinder = '';
let allWords = []; // individual level-data files will fill this array.
let solidObjects = [];
let immovableObjects = [];
let bridgelikeObjects = [];
let ellipticalObjects = [];
let lastClickTime = 0;
let initialClickEvent = undefined; // used in a more-or-less-necessary hack to distinguish short click from long click
let MAX_DOUBLE_CLICK_TIME_SEPARATION = 375; // MS

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

/* Definitions of classes: */
class Level {
    constructor(name) {
        this.name = name;
        this.initialRoom = '';
        this.initialX = 0; // expressed as % of way across x axis, i.e. value range is 0-100
        this.initialY = 0;
        this.initialSpells = [];
        this.initialInventory = {};
        this.backgroundMusicFile = undefined;
        this.allWords=  [];
        this.solidObjects = [];
        this.immovableObjects = [];
        this.bridgelikeObjects = [];
        this.ellipticalObjects = [];
        this.otherGameData = {};
        this.initialThings = [];
        this.initialRunes = [];
        this.rooms = {};
        this.sounds = {};
        this.defineThingSubclasses = function() {};
        this.getThing = function(word,room,x,y) {
            return undefined; // undefined indicates no special Thing subclass for this word
        };
        this.displayLevelIntroMessage = function() {};
        this.initializationFunction = function() {
           this.displayLevelIntroMessage();
        };
        this.animateLoopFunction = function() {};
        this.keydownFunction = function(e) {
            return false; // false indicates keydown event not handled here
        };
        this.clickHandlerFunction = function(xWithinCanvas,yWithinCanvas) {
            return false; // false indicates click event not handled here
        };
        this.postTransformBehavior = function(fromWord,toWord) {};
        this.levelCompleteMessage = 'Congratulations, you completed the level! Close this message to return to home screen.';
    }
}

class GameElement {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.halfWidth = 0;
        this.halfHeight = 0;
        this.image = new Image();
        this.collisionProfile = CollisionProfile.RECTANGULAR;
        this.destX = 0; // used if moving
        this.destY = 0;
        this.beginMovementTime = 0;
        this.movementDurationMS = 0;
        this.movementType = MOVEMENT_TYPE_LINEAR;
        this.soundToPlayAfterMovement = undefined;
        this.messageToDisplayAfterMovement = undefined;
        this.deleteAfterMovement = false;
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

    occupiesPoint(xWithinCanvas, yWithinCanvas) { // this is overridden by Thing to handle case where it's in inventory
        let w = Math.max(this.halfWidth, MIN_HALFWIDTH);
        let h = Math.max(this.halfHeight, MIN_HALFHEIGHT);
        return ( xWithinCanvas >= this.x - w &&
            xWithinCanvas <= this.x + w &&
            yWithinCanvas >= this.y - h &&
            yWithinCanvas <= this.y + h );
    }

    update() {
        if (this.beginMovementTime > 0) {
            if (Date.now() > this.beginMovementTime + this.movementDurationMS) {
                this.beginMovementTime = 0;
                this.methodToCallAfterMovement();
            } else {
                let fractionTraversed = (Date.now() - this.beginMovementTime) / this.movementDurationMS;
                this.x = this.initialX + ((this.destX - this.initialX) * fractionTraversed);
                if (this.movementType === MOVEMENT_TYPE_LINEAR) {
                    this.y = this.initialY + ((this.destY - this.initialY) * fractionTraversed);
                } else if (this.movementType === MOVEMENT_TYPE_PARABOLIC) {
                    this.y = this.initialY + ((this.destY - this.initialY) * fractionTraversed) - 100 +
                        (400 * (fractionTraversed - 0.5) * (fractionTraversed - 0.5));
                }
            }
        }
    }
    initiateMovement(relSpeed = 1) {
        let distanceAsFractionOfPlayAreaWidth = Math.sqrt( ( (this.x - this.destX) * (this.x - this.destX)) + ((this.y - this.destY) * (this.y - this.destY)) )  / PLAY_AREA_WIDTH;
        this.movementDurationMS = distanceAsFractionOfPlayAreaWidth * 2000 * relSpeed;
        this.beginMovementTime = Date.now();
    }
    methodToCallAfterMovement() {
        this.beginMovementTime = 0;
        this.x = this.destX;
        this.y = this.destY;
        if (typeof this.soundToPlayAfterMovement !== 'undefined')
            this.soundToPlayAfterMovement.play();
        if (typeof this.messageToDisplayAfterMovement !== 'undefined')
            displayMessage(this.messageToDisplayAfterMovement);
    }
    handleDblclick(e) {
        return false; // meaning that this object didn't actually handle the dblclick.
    }
}

class Rune extends GameElement {
    constructor(x,y,destX,destY,letter,beingReleasedRatherThanAbsorbed) {
        super(x,y);
        this.image = runeImages[letter.charCodeAt(0) - 97];
        this.destX = destX;
        this.destY = destY;
        this.letter = letter;
        this.movementDurationMS = 1000;
        this.beginMovementTime = Date.now();
        this.deleteAfterMovement = true;
        this.beingReleasedRatherThanAbsorbed = beingReleasedRatherThanAbsorbed;
        this.height = RUNE_DISPLAY_HEIGHT;
        this.width = RUNE_DISPLAY_WIDTH;
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;
    }

    methodToCallAfterMovement() {
        super.methodToCallAfterMovement();
        if (this.beingReleasedRatherThanAbsorbed === true) {
            runesBeingReleased = [];
        }
        else {
            executeTransformation(); // this means the rune has moved across the screen to target, so now commit the actual transformation.
            runesBeingAbsorbed = [];
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

}

class Player extends GameElement {
     constructor() {
         super(50,50);
         this.width = PLAYER_WIDTH;
         this.height = PLAYER_HEIGHT;
         this.halfWidth = this.width / 2;
         this.halfHeight = this.height / 2;
         this.direction = Directions.RIGHT;
         this.blockingThing = undefined;
         this.retreatX = 0;
         this.retreatY = 0;
         this.images = [ new Image(), new Image(), new Image(), new Image() ];

         // this.images = [ new Image(90,130), new Image(70,134), new Image(92,132), new Image(70, 132) ];
         this.images[Directions.UP].src = 'imgs/player-back.png';
         this.images[Directions.RIGHT].src = 'imgs/player-right.png';
         this.images[Directions.DOWN].src = 'imgs/player-front.png';
         this.images[Directions.LEFT].src = 'imgs/player-left.png';
     }

     update() {
         super.update();
     }

     methodToCallAfterMovement() {
         super.methodToCallAfterMovement();
     }

     draw() {
         if (!playerImageSuppressed) {
             ctx.drawImage(this.images[this.direction], this.x - this.halfWidth, this.y - this.halfHeight); // , this.width, this.height);
         }
     }
 }

class Thing extends GameElement {
    constructor(word, room, x, y) {
        super(x, y);
        this.word = word;
        this.room = room;
        this.x = x;
        this.y = y;
        this.image.onload = this.setDimensionsFromImage.bind(this); // "bind(this)" is needed to prevent handler code from treating "this" as the event-triggering element.
        this.image.onerror = this.handleMissingImage.bind(this);
        this.image.src = levelPath + '/things/' + word.replace(' ', '_') + '.png';
        this.timeOfCreation = Date.now();
        this.movable = (immovableObjects.indexOf(word) < 0 && solidObjects.indexOf(word) < 0);
        this.solid = (solidObjects.indexOf(word) >= 0);
        this.collisionProfile = (ellipticalObjects.indexOf(word) >= 0) ? CollisionProfile.ELLIPTICAL : CollisionProfile.RECTANGULAR;
        this.cannotPickUpMessage = 'This object cannot be picked up.';
        this.captionDiv = undefined;
        this.captionLeftEdgeWithinCanvas = undefined;
        this.captionTopEdgeWithinCanvas = undefined;
        this.inventoryImageRatio = 1.7; // factor by which to reduce each dimension when drawing in inventory.
        this.playAudioWhenTransformed = true;
        this.sound = undefined; // used for thing's primary sound. will be stopped if/when player leaves room where it is.
        this.wordDisplayOffsetX = -28; // where to set "left" property of captionDev rel. to this.x. subclasses may redefine.
        this.wordDisplayOffsetY = 32;// where to set "top" property of captionDev rel. to this.y. subclasses may redefine.
    }

    setDimensionsFromImage() { // this gets called as soon as image loads
        this.width = this.image.width; // take dimensions directly from image
        this.height = this.image.height;
        this.halfWidth = this.width / 2; // to avoid having to recalculate at every frame
        this.halfHeight = this.height / 2;
        drawInventory();
    }

    handleMissingImage() { // if image doesn't load
        this.image.src = 'imgs/thing_placeholder.png';
        this.height = 100;
        this.width = 100;
        this.halfHeight = 50;
        this.halfWidth = 50;
    }

    deleteFromThingsHere() {
        this.deleteCaptionIfAny();
        for (let [word, thing] of Object.entries(thingsHere)) {
            if (thing === this) {
                delete thingsHere[word];
            }
        }
    }

    deleteCaptionIfAny() {
        if (typeof this.captionDiv !== 'undefined') {
            this.captionDiv.remove(); // take div out of DOM hierarchy
            this.captionDiv = undefined; // ... and mark for garbage removal
            this.captionTopEdgeWithinCanvas = undefined;
            this.captionLeftEdgeWithinCanvas = undefined;
        }
    }

    dispose() {
        for (let i=0; i<passages.length; i++) {
            if (passages[i].obstacle === this.word) {
                passages[i].unblock();
            }
        }
        this.deleteCaptionIfAny();
        this.deleteFromThingsHere();
        this.removeFromInventory();
    }

    setMovement(destX, destY, duration, initialX = undefined, initialY = undefined) {
        this.destX = destX;
        this.destY = destY;
        this.movementDurationMS = duration;
        this.beginMovementTime = Date.now();
        this.initialX = (typeof initialX === 'undefined') ? this.x : initialX;
        this.initialY = (typeof initialY === 'undefined') ? this.y : initialY;
    }

    methodToCallAfterMovement() {
        super.methodToCallAfterMovement();
        if (this.deleteAfterMovement === true)
            this.deleteFromThingsHere();
        this.setCaptionPositionInThingsHere();
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
        ctx.drawImage(this.image, this.x - (this.halfWidth / this.inventoryImageRatio), this.y - (this.halfHeight / this.inventoryImageRatio),
            this.width / this.inventoryImageRatio,
            this.height / this.inventoryImageRatio);
    }

    // tryToPickUp() returns true if successful else false or an error message:
    tryToPickUp() {
        // only call this on things in thingsHere in range of player.
        if (this.movable) {
            if (Object.keys(inventory).length >= MAX_ITEMS_IN_INVENTORY) {
                return 'Too many things in inventory!';
            } else {
                sounds['pickup'].play();
                inventory[this.word] = this;
                this.setCoordinatesInInventory(Object.keys(inventory).length - 1);
                console.log(this.x);
                console.log(this.y);
                this.moveCaptionDivIfAnyToInventory();
                delete thingsHere[this.word];
                if (typeof level.targetThing === 'string' && level.targetThing === this.word)
                    completeLevel();
                return true;
            }
        } else {
            return false;
        }
    }

    removeFromInventory() {
        // note this is a *subset* of "discard" behavior, in fact discard() calls this method.
        // discard() furthermore moves the thing into thingsHere; but this is not always desired (like when throwing darts e.g.)
        delete inventory[this.word];
        window.setTimeout(function () {
                repositionInventoryItems();
                drawInventory();
            },
            100); // waiting 100 MS to redraw this so click won't affect whatever item slides into this item's place in the inventory
    }

    discard() {
        this.removeFromInventory();
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
        this.setCaptionPositionInThingsHere();
        sounds['pickup'].play();
    }

    moveCaptionDivIfAnyToInventory() {
        if (typeof this.captionDiv !== 'undefined') {
            this.captionLeftEdgeWithinCanvas = canvasOffsetX + this.x - 18;
            this.captionTopEdgeWithinCanvas = canvasOffsetY + PLAY_AREA_HEIGHT + 58;
            this.captionDiv.classList.add('in-inventory');
            this.captionDiv.style.left = this.captionLeftEdgeWithinCanvas.toString() + 'px';
            this.captionDiv.style.top = this.captionTopEdgeWithinCanvas.toString() + 'px';
            // console.log("in moveCaptionDivIfAnyToInventory, canvasOffsetY=" + canvasOffsetY.toString() + ", CANVAS_HEIGHT=" + CANVAS_HEIGHT.toString());
        }
    }

    setCaptionPositionInThingsHere() {
        if (typeof this.captionDiv != 'undefined') {
            this.captionDiv.classList.remove('in-inventory');
            this.captionTopEdgeWithinCanvas = this.y + canvasOffsetY + this.wordDisplayOffsetY;
            this.captionLeftEdgeWithinCanvas = this.x + canvasOffsetX + this.wordDisplayOffsetX;
            this.captionDiv.style.top = this.captionTopEdgeWithinCanvas.toString() + 'px';
            this.captionDiv.style.left = this.captionLeftEdgeWithinCanvas.toString() + 'px';
        }
    }

    occupiesPoint(xWithinCanvas, yWithinCanvas) { // Thing overrides this to handle case where it's in inventory, & to allow click on caption

        // check for click on caption first.
        if (typeof this.captionDiv != 'undefined') {
            if (xWithinCanvas >= (this.captionLeftEdgeWithinCanvas) &&
                xWithinCanvas <= (this.captionLeftEdgeWithinCanvas + 60) &&
                yWithinCanvas >= (this.captionTopEdgeWithinCanvas) &&
                yWithinCanvas <= (this.captionTopEdgeWithinCanvas + 40) )

                return true;
        }


        let adjustedWidth = (typeof this.arrowHalfWidth == 'undefined') ? this.halfWidth : this.arrowHalfWidth;
        let adjustedHeight = (typeof this.arrowHalfHeight == 'undefined') ? this.halfHeight : this.arrowHalfHeight;
        if (this.word in inventory) {
            adjustedHeight = adjustedHeight / this.inventoryImageRatio;
            if (adjustedHeight < 20)
                adjustedHeight = 20;
            adjustedWidth = adjustedWidth / this.inventoryImageRatio;
            if (adjustedWidth < 20)
                adjustedWidth = 20;
        }

        adjustedHeight = Math.max(adjustedHeight,MIN_HALFHEIGHT);
        adjustedWidth = Math.max(adjustedWidth,MIN_HALFWIDTH);

        return (xWithinCanvas >= (this.x - adjustedWidth) &&
            xWithinCanvas <= (this.x + adjustedWidth) &&
            yWithinCanvas >= (this.y - adjustedHeight) &&
            yWithinCanvas <= (this.y + adjustedHeight));
    }

    displayCantPickUpMessage() {
        if (typeof this.cannotPickUpMessage === 'string' && this.cannotPickUpMessage !== '')
            displayMessage(this.cannotPickUpMessage, DEFAULT_MESSAGE_DURATION, this.x, this.y);
    }

    // particular Thing subclasses may override this:
    handleClick() {
        toggleSpellInputWindow(false,this.word);
    }

    handleDblclick(e) {
        if (this.word in inventory) {
            if (currentRoom === 'darkroom') {
                displayMessage("Don't put anything down here, you might lose it!");
            } else {
                this.discard();
            }
            return true; // meaning that this object handled the dblclick.
        }
        if (!this.movable) {
            return this.displayCantPickUpMessage(); // the overall click-handling function will display this msg if no *other* object handles the dblclick successfully.
        }
        if (!this.inRangeOfPlayer(EXTRA_PICKUP_RADIUS)) {
            return ("You must be closer to pick this up.");
        }
        return this.tryToPickUp(); // will be "true" if it works, else error message or false
    }

    passageBlockingBehavior() {
        displayMessage('blocked!', DEFAULT_MESSAGE_DURATION);
    }

    // placeholder methods that subclasses needing specific behavior can override:

    okayToDisplayWord() {
        return true;
    }

    handleCollision() {}

    checkIfOkayToTransform() {
        return true; // specific things could override this.
    }

    extraTransformFromBehavior() { // can be overridden.
        if (typeof this.sound === 'object') {
            this.sound.pause(); // by default, stop playing sound
        }
    }

    extraTransformIntoBehavior() {}

    deactivateObstacle() {
        for (let i=0; i<passages.length; i++) {
            if (passages[i].obstacle === this.word) {
                passages[i].unblock();
            }
        }
    }
}

class Passage extends GameElement {
    constructor(type, direction, xAsPercent, yAsPercent, destinationRoom, destXAsPercent, destYAsPercent, activated = true,
                newRoomDestXAsPercent = -1, newRoomDestYAsPercent = -1, obstacle = undefined,
                state = PASSAGE_STATE_ACTIVE, blockedXAsPercent = -1, blockedYAsPercent = -1) {
        super(xAsPercent * xScaleFactor, yAsPercent * yScaleFactor );
        // this.originRoom = originRoom; note -- currently don't need to specify originRoom because passage data will be packaged into room data.
        this.type = type;
        this.direction = direction;
        this.destinationRoom = destinationRoom;
        this.destXAsPercent = destXAsPercent;
        this.destYAsPercent = destYAsPercent;
        this.newRoomDestXAsPercent = newRoomDestXAsPercent;
        this.newRoomDestYAsPercent = newRoomDestYAsPercent;
        this.activated = activated;
        this.state = state;
        this.blockedX = blockedXAsPercent * xScaleFactor;
        this.blockedY = blockedYAsPercent * yScaleFactor;
        this.obstacle = obstacle; // the thing (if any) whose transformation or disposal unblocks this passage

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

        this.arrowHalfWidth = (this.direction === 'N' || this.direction === 'S') ? 28 : 60;
        this.arrowHalfHeight = (this.direction === 'N' || this.direction === 'S') ? 60 : 28;


        if ( this.type.indexOf('invisible') >= 0) {
            this.image = undefined;
        } else {
            this.image = new Image(this.width,this.height);
            this.image.src = 'imgs/passages/passage-' + this.type + '.png';
        }
    }
    draw() {
        if (typeof this.image != 'undefined')
            ctx.drawImage(this.image,this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);
        if (this.activated && this.state !== PASSAGE_STATE_OCCUPIED) {
            ctx.globalAlpha = arrowsAlpha;
            ctx.drawImage(arrowImages[this.direction],this.x - this.arrowHalfWidth, this.y - this.arrowHalfHeight);
            ctx.globalAlpha = 1.0;
        }
    }
    handleClick() {
        if (this.state === PASSAGE_STATE_ACTIVE || this.state === PASSAGE_STATE_BLOCKED) {
            // move to the passage or to "blocked" point. first, if player currently "occupying" a passage, unoccupy it:
            for (let i=0; i<passages.length;i++) {
                if (passages[i].state == PASSAGE_STATE_OCCUPIED)
                    passages[i].state = PASSAGE_STATE_ACTIVE;
            }
            player.beginMovementTime = Date.now();
            player.initialX = player.x;
            player.initialY = player.y;
            player.destX = (this.state === PASSAGE_STATE_BLOCKED) ? this.blockedX : this.x;
            player.destY = (this.state === PASSAGE_STATE_BLOCKED) ? this.blockedY : this.y;

            if (this.state === PASSAGE_STATE_BLOCKED) {
                player.blockingThing = thingsHere[this.obstacle];
                player.methodToCallAfterMovement = playerBlocked;
                player.retreatX = player.x;
                player.retreatY = player.y;
            }
            else {
                player.blockingThing = undefined;
                player.methodToCallAfterMovement = arriveAtPassage;
            }
            switch (this.direction) {
                case 'N' : player.direction = Directions.UP; break;
                case 'NE' :
                case 'E' :
                case 'SE' : player.direction = Directions.RIGHT; break;
                case 'NW' :
                case 'W' :
                case 'SW' : player.direction = Directions.LEFT; break;
                case 'S' : player.direction = Directions.DOWN; break;
            }
            player.initiateMovement();
            destinationPassage = this;
        }
    }
    unblock() {
        this.activated = true;
        this.state = PASSAGE_STATE_ACTIVE;
    }
}

/* end class definitions; begin global functions */

function arriveAtPassage() {
    // TODO: check whether this passage actually leads to new room.
    if (destinationPassage.destinationRoom == currentRoom) {
        // this is a passage that can be "occupied" / doesn't go to another room.
        destinationPassage.state = PASSAGE_STATE_OCCUPIED;
    }
    else {
        newRoom(destinationPassage.destinationRoom, destinationPassage.destXAsPercent, destinationPassage.destYAsPercent);

        if (destinationPassage.newRoomDestXAsPercent > 0 && destinationPassage.newRoomDestYAsPercent > 0) {
            player.initialX = player.x;
            player.initialY = player.y;
            player.destX = destinationPassage.newRoomDestXAsPercent * xScaleFactor;
            player.destY = destinationPassage.newRoomDestYAsPercent * yScaleFactor;
            player.methodToCallAfterMovement = function () {
            };
            player.initiateMovement();
        }
    }
}

function playerBlocked() {
    player.blockingThing.passageBlockingBehavior();
    player.initialX = player.x;
    player.initialY = player.y;
    player.destX = player.retreatX;
    player.destY = player.retreatY;
    player.methodToCallAfterMovement = function(){}; // TODO: this should be a function that orients player image so not facing "backwards"
    player.initiateMovement();
}

function getThing(word, room, x, y, treatXandYasPercentages = true, otherArgs = undefined) {
    if (treatXandYasPercentages) {
        x = x * xScaleFactor;
        y = y * yScaleFactor;
    }
    // first see if there is a subclass of Thing defined for this word in level-specific code:
    let thing = level.getThing(word,room,x,y);
    if (!(typeof thing === 'object')) {
        thing = new Thing(word,room,x,y); // otherwise get a plain-vanilla Thing
    }
    return thing;
}

function getNewCaptionDiv(word) {
    let captionDiv = document.createElement('div');
    captionDiv.classList.add('word-bubble');
    captionDiv.classList.add('visible-now');
    captionDiv.innerText = word;
    let outerDiv = document.getElementById('game-container-div');
    outerDiv.appendChild(captionDiv);
    captionDiv.style.display = 'block';
    return captionDiv;
}

function deleteCaptions(deleteInventoryCaptionsToo = false) {
    for (let [word, thing] of Object.entries(thingsHere)) {
        thing.deleteCaptionIfAny();
    }
    if (deleteInventoryCaptionsToo) {
        for (let [word, thing] of Object.entries(inventory)) {
            thing.deleteCaptionIfAny();
        }
    }
}

function hideAllCaptions() {
    let captionDivs = document.getElementsByClassName('word-bubble');
    for (let i = 0; i < captionDivs.length; i++) {
        captionDivs[i].style.display='none';
    }
}

function displayAllCaptions() {
    let captionDivs = document.getElementsByClassName('word-bubble');
    for (let i = 0; i < captionDivs.length; i++) {
        captionDivs[i].style.display='block';
    }
}

function stopDisplayingMsg(forceStopAll = false) {

    /* TODO: fade-out messages like this
    fixedMessages[i].divElement.classList.remove('visible-now');
    fixedMessages[i].divElement.classList.add('fade-to-hidden');
    fixedMessages[i].timeAtMessageCreation = 0;
    */

    for (let [id, messageObj] of Object.entries(messages)) {
        if ( (forceStopAll === true) ||
            (messageObj.duration > 0 && Date.now() >= messageObj.timeAtMessageCreation + messageObj.duration) ) {
            closeMessage(id);
        }
    }
}

function displayMessage(msg, durationMS = 0, x = undefined, y = undefined, treatCoordinatesAsPercentages = false) {

    if (showingIntroPage === true)
        return; // sometimes displayMessage will be triggered by a setTimeout; if in the meantime the player has returned to intro page, don't show.

    // see if message already being displayed; if so, return.
    for (let [id, messageObj] of Object.entries(messages)) {
        if (messageObj.msg == msg) {
            return;
        }
    }

    messageCounter++;

    let messageObject = {};
    messageObject.msg = msg;
    messageObject.standardIndex = undefined;
    messageObject.msgID = 'none'; // this can be set to something useful in displaySequenceableMessage()

    if (typeof x === 'undefined') {
        let standardIndex = 0;
        x = standardMessagePositions[0].x; // so will overlap by default if can't find any open place
        y = standardMessagePositions[0].y;
        // find first open "standard" message position:
        for (let i=0; i<standardMessagePositions.length; i++) {
            if (standardMessagePositions[i].occupied !== true) {
                standardIndex = i;
                messageObject.standardIndex = i;
                standardMessagePositions[i].occupied = true;
                x = standardMessagePositions[i].x;
                y = standardMessagePositions[i].y;
                break;
            }
        }
    }

    if (treatCoordinatesAsPercentages === true) {
        x = x * xScaleFactor;
        y = y * yScaleFactor;
    }

    messageObject.divElement = document.createElement('div');
    let msgDiv = messageObject.divElement;
    msgDiv.classList.add('player-message');
    msgDiv.style.left = (canvasOffsetX + x - 90).toString() + 'px';
    msgDiv.style.top = (canvasOffsetY + y).toString() + 'px';
    let outerDiv = document.getElementById('floating-message-holder');
    outerDiv.appendChild(msgDiv);

    messageObject.timeAtMessageCreation = Date.now();
    messageObject.duration = durationMS;
    msgDiv.innerHTML = '<div class="window-closing-div"><a href="#" onclick="closeMessage(' + messageCounter.toString( ) + ')">X</a></div>' +  msg;
    msgDiv.style.display = 'block';
    msgDiv.classList.remove('fade-to-hidden');
    msgDiv.classList.add('visible-now');
    if (durationMS > 0) {
        window.setTimeout(stopDisplayingMsg, durationMS);
    }
    messages[messageCounter] = messageObject;
    return messageObject;
}

function displaySequenceableMessage(msg, msgID, msgIDtoSupersede, durationMS = 0, x = undefined, y = undefined, treatCoordinatesAsPercentages = false) {
    // if this supersedes another message, close that one:
    if (typeof msgIDtoSupersede != 'undefined') {
        for (let [messageNumber, messageObj] of Object.entries(messages)) {
            if (typeof messageObj.msgID != 'undefined' && messageObj.msgID === msgIDtoSupersede) {
                closeMessage(messageNumber);
            }
        }
    }
    let messageObject = displayMessage(msg, durationMS, x, y, treatCoordinatesAsPercentages);
    messageObject.msgID = msgID;
}

function closeMessage(messageNumber, returnToIntro = false) {
    if (typeof messages[messageNumber] !== 'undefined') {
        messages[messageNumber].divElement.remove();
        if (typeof messages[messageNumber]['standardIndex'] != 'undefined') {
            standardMessagePositions[messages[messageNumber]['standardIndex']].occupied = false;
        }
        delete messages[messageNumber];
        if (returnToIntro === true) {
            showIntroScreen();
        }

    }
}

function getCanonicalAnagram(word) {
    return word.split('').sort().join(); // turns VEAL into AELV etc.
}

function spellAvailable(spell, involvesFinalS = false) {
    // returns whether user has the requested spell or a strictly more powerful spell.
    // in the case of single-rune spells, the spell sent to this function will be "regular"
    // like remove-letter in which case you're affecting an interior letter,
    // or edge-specific like remove-edge; but it *won't* be a no-final-s variant.
    // whether the final-s issue needs to be dealt with is determined by the second parameter.

    if (spellsAvailable.indexOf(spell) >= 0)
        return true;

    // at this point we know player doesn't have the explicitly specified spell ...
    switch (spell) {
        case allSpells.ADD: return spellsAvailable.indexOf(allSpells.ADD_NFS) >= 0;
        case allSpells.CHANGE :return spellsAvailable.indexOf(allSpells.CHANGE_NFS) >= 0;
        case allSpells.REMOVE : return spellsAvailable.indexOf(allSpells.REMOVE_NFS) >= 0;
        case allSpells.ADD_EDGE : return (spellsAvailable.indexOf(allSpells.ADD) >= 0 ||
                (!involvesFinalS && (spellsAvailable.indexOf(allSpells.ADD_EDGE_NFS) >= 0 || spellsAvailable.indexOf(allSpells.ADD_NFS) >= 0)));
        case allSpells.CHANGE_EDGE : return (spellsAvailable.indexOf(allSpells.CHANGE) >= 0 ||
                (!involvesFinalS && (spellsAvailable.indexOf(allSpells.CHANGE_EDGE_NFS) >= 0 || spellsAvailable.indexOf(allSpells.CHANGE_NFS) >= 0)))
        case allSpells.REMOVE_EDGE : return (spellsAvailable.indexOf(allSpells.REMOVE) >= 0 ||
                (!involvesFinalS && (spellsAvailable.indexOf(allSpells.REMOVE_EDGE_NFS) >= 0 || spellsAvailable.indexOf(allSpells.REMOVE_NFS) >= 0)))
        default: return (spellsAvailable.indexOf(spell) >= 0);
    }
}

function getSpellListHtml(spellName) {
    return '<a href="#" onclick="showBinder(\'' + spellName + '\')">' + spellName + '</a><br/> ';
}

function addSpellToBinder(spellName) {
    document.getElementById('spell-list').innerHTML += getSpellListHtml(spellName) + '<br/>';
    sounds['add-spell'].play();
    displayMessage('You found a new binder page!');
    if (spellsAvailable.indexOf(spellName) < 0)
        spellsAvailable.push(spellName);
    window.setTimeout( function() { showBinder(spellName); }, 2000);
//    showBinder(spellName);
}

function toggleSpellInputWindow(forceClose = false, fromWord = '') {
    let spellDiv = document.getElementById('spell-input-div');

    if (showingSpellInput || forceClose) {
        showingSpellInput = false;
        document.getElementById('toWord').focus();
        spellDiv.style.display = 'none';
    }
    else {
        showingSpellInput = true;
        spellDiv.style.display = 'block';
        document.getElementById('toWord').focus();
        document.getElementById('toWord').value = '';
        document.getElementById('fromWord').innerText = fromWord;
    }
}

// this function has return value of form { attemptedSpell, runeNeeded, runeReleased, affectsEnd }
function getAttemptedSingleRuneSpell(fromWord,toWord) {
    for (let i = 0; i < fromWord.length+1; i++) {
        if (toWord.slice(0, i) === fromWord.slice(0,i) && toWord.slice(i+1) === fromWord.slice(i)) {
            let spell = (i == 0 || i == fromWord.length) ? allSpells.ADD_EDGE : allSpells.ADD;
            return [spell, toWord.substr(i,1), undefined, (i == fromWord.length)];
        }
        if (i < fromWord.length && toWord.length == fromWord.length && toWord.slice(0, i) === fromWord.slice(0,i) && toWord.slice(i+1) === fromWord.slice(i+1)) {
            let spell = (i == 0 || i == toWord.length - 1) ? allSpells.CHANGE_EDGE : allSpells.CHANGE;
            return [spell, toWord.substr(i,1), fromWord.substr(i,1), (i == fromWord.length - 1)];
        }
        if (toWord.slice(0, i) === fromWord.slice(0,i) && toWord.slice(i) === fromWord.slice(i+1)) {
            let spell = (i == 0 || i == toWord.length) ? allSpells.REMOVE_EDGE : allSpells.REMOVE;
            return [spell, undefined, fromWord.substr(i,1), (i == fromWord.length - 1)];
        }
    }
    return false; // meaning it's not an attempted add/remove/change-single-rune spell.
}

function registerWordForScoringPurposes(word) {
    console.log ('hey');
    if (wordsFound.indexOf(word) >= 0)
        return; // already found.
    score += word.length;
    wordsFound.push(word);
    console.log('here, word length ' + word.length)
    document.getElementById("score-span").innerText = score.toString();
}

function castSpell() {
    toggleSpellInputWindow(true); // close the window
    toWord = document.getElementById('toWord').value.toLowerCase().trim();
    fromWord = document.getElementById('fromWord').innerText.toLowerCase().trim();
    if (typeof toWord != 'string' || typeof fromWord != 'string' || toWord.length < 1 || fromWord.length < 1 || fromWord == toWord )
        return;
    let inInventory = (fromWord in inventory);
    let sourceThing = undefined;

    // check whether fromWord is in inventory or in thingsHere:
    if (inInventory) {
        sourceThing = inventory[fromWord];
    } else if (fromWord in thingsHere) {
        sourceThing = thingsHere[fromWord];
    }
    else {
        displayMessage('Nothing called "' + fromWord + '" is available here.');
        return;
    }

    if (allWords.indexOf(toWord) < 0) { // target word not recognized as a possible object
        displayMessage("Sorry, that didn't work.", DEFAULT_MESSAGE_DURATION);
        return;
    }

    // have now verified the fromWord is available and toWord is a thing; find out what kind of transformation this is
    let spellRequested = '';
    let runeNeeded = undefined;
    let runeReleased = undefined;
    let involvesFinalS = false;

    if (getCanonicalAnagram(toWord) === getCanonicalAnagram(fromWord)) {
        spellRequested = allSpells.ANAGRAM;
    }

    /* TODO: cases where two spells could work ... don't want situtation where you check one first that player doesn't have,
    but they do have the other spell. like tapir > taper could be homophone or change-letter
     */

    let singleRuneSpellData = getAttemptedSingleRuneSpell(fromWord, toWord);

    if (toWord === fromWord.split('').reverse().join('')) {
        spellRequested = allSpells.REVERSAL;
    }
    else if (getCanonicalAnagram(toWord) === getCanonicalAnagram(fromWord)) {
        spellRequested = allSpells.ANAGRAM;
    }
    else if (singleRuneSpellData !== false) {
        spellRequested = singleRuneSpellData[0];
        runeNeeded = singleRuneSpellData[1];
        runeReleased = singleRuneSpellData[2];
        involvesFinalS = singleRuneSpellData[3] && (runeNeeded === 's' || runeReleased === 's');
    }

    console.log(spellRequested);

    // TODO: check for SYNONYM, etc.

    if (!spellAvailable(spellRequested, involvesFinalS)) {
        // TODO: more specific error if it failed because tried to use a final "s" and player only has a nfs version of spell.
        displayMessage("Sorry, that didn't work!", DEFAULT_MESSAGE_DURATION);
        return;
    }

    if (typeof runeNeeded != 'undefined' && runes.indexOf(runeNeeded) < 0) {
        displayMessage('Sorry, you need a rune: <img class="inline-rune" src="imgs/runes/Rune-' + runeNeeded.toUpperCase() + '.png">', 2 * DEFAULT_MESSAGE_DURATION);
        if (levelName.indexOf('utorial') > 0 && fromWord == 'cur') {
            setTimeout(
                function() { displayMessage('To get a "b" rune, change "bear" into "ear".', 0); },
                1200
            );
        }
        return;
    }

    if (!sourceThing.checkIfOkayToTransform())
        return;

    // *** if we got here then the spell worked ***

    registerWordForScoringPurposes(toWord);

    transformationToExecute = {
        'sourceThing' : sourceThing,
        'toWord' : toWord,
        'runeNeeded' : runeNeeded,
        'runeReleased' : runeReleased,
    };

    if (typeof runeNeeded === 'undefined') {
        // if no runes to shuffle around graphically, just execute the transformation now:
        executeTransformation();
    }

    runesBeingReleased = [];
    runesBeingAbsorbed = [];

    if (typeof runeNeeded != 'undefined') {
        const indexToDelete = runes.indexOf(runeNeeded);
        if (indexToDelete >= 0) // this should already have been checked, but just to be sure ...
            runes.splice(indexToDelete,1); // removes the needed rune from player's collection.
        let coords = getRuneCoordinates(indexToDelete);
        let runeToUse = new Rune(coords.x, coords.y, sourceThing.x, sourceThing.y, runeNeeded, false);
        runesBeingAbsorbed.push(runeToUse);
    }

    if (typeof runeReleased != 'undefined') {
        runes.push(runeReleased);
        newRuneIndex = runes.length-1;
        runeAcquisitionTime = Date.now();
        let coords = getRuneCoordinates(newRuneIndex);
        let runeToUse = new Rune( sourceThing.x, sourceThing.y, coords.x, coords.y, runeReleased, true);
        runesBeingReleased.push(runeToUse);
    }
}

function executeTransformation() {
    let sourceThing = transformationToExecute.sourceThing;
    let toWord = transformationToExecute.toWord;
    let runeReleased = transformationToExecute.runeReleased;
    let runeNeeded = transformationToExecute.runeNeeded;

    let inInventory = (sourceThing.word in inventory);

    sourceThing.deactivateObstacle();

    sourceThing.extraTransformFromBehavior();

    // if old thing has caption div (under current thinking, it always will) remove references to it / delete it:
    if (typeof sourceThing.captionDiv !== 'undefined') {
        sourceThing.captionDiv.remove();
        sourceThing.captionDiv = undefined;
    }

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
        inInventory = false;
    }

    repositionInventoryItems();
    drawInventory();

    if (newObject.okayToDisplayWord()) {
        newObject.captionDiv = getNewCaptionDiv(toWord);
        if (inInventory) {
            newObject.moveCaptionDivIfAnyToInventory();
        } else {
            newObject.setCaptionPositionInThingsHere();
        }
    }

    level.postTransformBehavior(fromWord,toWord); // might move this into extraTransformIntoBehavior

    newObject.extraTransformIntoBehavior();

    fadeinTimer = Date.now();
    fadeinWord = toWord;

    transformationToExecute = undefined;
}

function repositionInventoryItems() {
    let index = 0;
    for (let [word, thing] of Object.entries(inventory)) {
        thing.setCoordinatesInInventory(index);
        thing.moveCaptionDivIfAnyToInventory();
        index++;
    }
}

function getRuneCoordinates(index) {
    // so that runes display in inventory in one row:
    return {
        x : INVENTORY_LEFT + INVENTORY_WIDTH - INVENTORY_LEFT_MARGIN - (RUNE_X_SPACING * index),
        y : INVENTORY_TOP + 20
    };
    /*
    here is the old two-row version:
    return {
        x : INVENTORY_LEFT + INVENTORY_WIDTH - INVENTORY_LEFT_MARGIN - (RUNE_X_SPACING * Math.round((index-1)/2)),
        y : INVENTORY_TOP + 5 + (RUNE_Y_SPACING * (index % 2))
    }*/
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
        let isInMotion = false;
        if (runesBeingReleased.length > 0) { // if the rune is being represented as in motion, don't draw it in usual static position.
            for (let j=0; j < runesBeingReleased.length; j++) {
                if (runes[i] === runesBeingReleased[j].letter)
                    isInMotion = true;
            }
        }

        if (!isInMotion) {
            let coords = getRuneCoordinates(i);
            ctx.drawImage(runeImages[runes[i].charCodeAt(0) - 97], coords.x, coords.y, RUNE_DISPLAY_WIDTH, RUNE_DISPLAY_HEIGHT);
        }
    }
}

function showBinder(page = allSpells.BINDER_COVER) {
    timeOfLastBinderOpening = Date.now();
    stopDisplayingMsg(true); // "true" forces all messages to stop displaying
    pageBeingShownInBinder = page;
    document.getElementById('binder-instructions').style.display = 'block';
    document.getElementById('binder-icon-holder').style.display = 'none';
    document.getElementById('horizontal-spell-list').style.display = 'none';
    document.getElementById('score-div').style.display = 'none';
    hideAllCaptions();
    // console.log('should be showing ...');
    // alert('hey');
    return false; // will prevent links from being followed if this is called from a hyperlink
}

function handleBinderIconMouseover(e) {
    if (pageBeingShownInBinder == '') {
        let binderIconDiv = document.getElementById('binder-icon-holder');
        binderIconDiv.classList.remove('binder-roll-up');
        binderIconDiv.classList.add('binder-drop-down');
        let spellListDiv = document.getElementById('spell-list');
        spellListDiv.style.display = 'block';
        spellListDiv.style.maxHeight = '250px';
        spellListDiv.style.transition = 'max-height 1s linear';
    }
}

function handleBinderIconMouseout(e) {
    let binderIconDiv = document.getElementById('binder-icon-holder');
    binderIconDiv.classList.remove('binder-drop-down');
    binderIconDiv.classList.add('binder-roll-up');
    document.getElementById('spell-list').style.display = 'none';
}

function startMusic() {
     musicPlaying = true;
     backgroundMusic.loop = true;
     backgroundMusic.play();
 }

function toggleMusic() {
    if (typeof backgroundMusic === 'object') {
        if (musicPlaying === false) {
            musicPlaying = true;
            startMusic();
        } else {
            musicPlaying = false;
            backgroundMusic.pause();
        }
    }
}

function animate() {

    frameCounter++;
    if (frameCounter > 99)
        frameCounter = 0;
    arrowsAlpha = arrowsAlphaLookupTable[frameCounter];

    /*
    timeMod2200 = Date.now() % 2200;
    arrowsAlpha = 0.25 * Math.sin(timeMod2200 * 0.002856) + 0.5
*/

    // clear and draw background for current room:
    ctx.clearRect(0, 0,  PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    if (typeof backgroundImage === 'object') {
        ctx.drawImage(backgroundImage, 0, 0);
    }
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
        let bType = boundaries[i][0];
        if (bType.startsWith('i'))
            continue; // don't draw boundaries marked as invisible
        if (bType.startsWith('t')) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
        }
        else
        {
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 4;
        }

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

    player.update();
    player.draw();

    if (pageBeingShownInBinder != '') {
        if (pageBeingShownInBinder === allSpells.BINDER_COVER)
            ctx.drawImage(binderImages[pageBeingShownInBinder], 0, 0);
        else {
            ctx.drawImage(binderImages['generic_page'], 0, 0);
        }
        let leftPageDiv = document.getElementById('binder-page-left');
        let rightPageDiv = document.getElementById('binder-page-right');
        rightPageDiv.innerHTML = binderPageHtml[pageBeingShownInBinder];
        rightPageDiv.style.display = 'block';
        if (pageBeingShownInBinder === allSpells.BINDER_INTRO) {
            leftPageDiv.innerHTML = binderPageHtml['binder-intro-left-page'];
            leftPageDiv.style.display = 'block';
        }
        else {
            leftPageDiv.style.display = 'none';
        }
    }

    // do any level-specific animation (might move this into room data)
    level.animateLoopFunction();

    drawInventory();

    // draw any runes being moved on screen (do this after inventory because these may move into inventory area
    for (let i = 0; i < runesBeingReleased.length; i++) {
        let runeObject = runesBeingReleased[i];
        runeObject.update(); // note this may clear the runesBeingReleased array.
        runeObject.draw();
    }
    for (let i = 0; i < runesBeingAbsorbed.length; i++) {
        let runeObject = runesBeingAbsorbed[i];
        runeObject.update();
        runeObject.draw();
    }

    if (!showingIntroPage)
        requestAnimationFrame(animate);
}

function teleport() {
    if (cheating) {
        let newRoomString = window.prompt('enter room name');
        if ((typeof newRoomString == 'string') && (newRoomString != ''))
            newRoom(newRoomString, 50, 50);
    }
}

function completeLevel() {
    levelComplete = true;
    sounds['fanfare'].play();
    if (typeof backgroundMusic === 'object') {
        backgroundMusic.pause();
    }
    let messageObject = {};
    messageObject.standardIndex = undefined; // this will be a "large" message, not one in one of the standard message slots
    messageObject.divElement = document.createElement('div');
    let msgDiv = messageObject.divElement;
    msgDiv.classList.add('big-message');
    msgDiv.style.left = (canvasOffsetX + (CANVAS_WIDTH / 2) - 200).toString() + 'px';
    msgDiv.style.top = (canvasOffsetY + 100).toString() + 'px';
    let outerDiv = document.getElementById('floating-message-holder');
    outerDiv.appendChild(msgDiv);

    messageCounter++;
    messageObject.timeAtMessageCreation = Date.now();
    messageObject.duration = 0;
    msgDiv.innerHTML = '<div class="window-closing-div"><a href="#" onclick="closeMessage(' + messageCounter.toString( ) + ',true)">X</a></div>';
    msgDiv.innerHTML += level.levelCompleteMessage;
    msgDiv.style.display = 'block';
    messages[messageCounter] = messageObject;
}

function confirmQuit() {
    let confirmed = levelComplete || (window.confirm('OK to leave this level and return to intro screen?'));
    if (confirmed === true) {
        showIntroScreen();
    }
}

function newRoom(newRoomName, newPlayerXAsPercent, newPlayerYAsPercent, initialMessage=undefined) {

    // note that in level data, x and y coordinates have values 0-100, to facilitate rescaling.
    // we convert to actual pixel values here.

    if (typeof currentRoom != 'undefined') {
        sounds['whoosh'].play();
    }

    for (let [word, thing] of Object.entries(thingsHere)) {
        thing.deleteCaptionIfAny();
        if (!thing.deleteAfterMovement) {
            thingsElsewhere[word] = thing;
        }
        if (typeof thing.sound === 'object') {
            thing.sound.pause();
        }
        // todo: if a thing is movement and some method is supposed to called at end of movement,
        // but the movement won't end because room was exited, should call that method now before deleting thingsHere[word].

        delete thingsHere[word];
    }

    // delete any messages that don't have timeout set:
    for (let [id, messageObj] of Object.entries(messages)) {
        if ( messageObj.duration === 0) {
            closeMessage(id);
        }
    }

    currentRoom = newRoomName;
    for (let [word, thing] of Object.entries(thingsElsewhere)) {
        if (thing.room === currentRoom) {
            thingsHere[word] = thing;
            delete thingsElsewhere[word];
            // put up captions for all things in new word.
            if (thing.okayToDisplayWord()) {
                thing.captionDiv = getNewCaptionDiv(thing.word);
                thing.setCaptionPositionInThingsHere();
            }
        }
    }
    player.x = newPlayerXAsPercent * xScaleFactor;
    player.y = newPlayerYAsPercent * yScaleFactor;

    let roomData = rooms[newRoomName];
    passages = [];
    for (let i = 0; i < roomData.passages.length; i++){
        let p = roomData.passages[i];
        passages.push(p);
    }

    if (typeof roomData.backgroundImageName !== 'undefined') {
        backgroundImage = new Image();
        backgroundImage.src = levelPath + '/rooms/' + newRoomName.replace(' ','_') + '/' + roomData.backgroundImageName;
    }
    else {
        backgroundImage = undefined;
    }

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

    if (typeof roomData.specificNewRoomBehavior === 'function')
        roomData.specificNewRoomBehavior();

    if (typeof initialMessage === 'string') {
        displayMessage(initialMessage,DEFAULT_MESSAGE_DURATION * 3);
    }
}

function drawTopBinderImage() {
    // currently not doing binder image -- just drawing list of avail. spells:
    let div = document.getElementById('horizontal-spell-list');
    div.style.left = (canvasOffsetX + 20).toString() + 'px';
    div.style.top = (canvasOffsetY + 20).toString() + 'px';
    div.style.display = 'block';
    document.getElementById('score-div').style.display = 'block';
    // ctx.drawImage(binderImages['side_view_for_top'],0,-50);
}

function loadLevel(lName = 'intro level') {
    console.log('loading level ' + lName);
    canvas.style.display = 'block';
    // document.getElementById('game-area').style.display = 'block';
    levelName = lName;
    levelComplete = false;
    score = 0;


    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'none';
    showingIntroPage = false;
    //document.getElementById('binder-icon-holder').style.display = 'block';
    // document.getElementById('top-binder-div').style.display = 'block';

    level = getLevelFunctions[lName]();

    console.log(level);

    levelPath = (typeof level.levelPath === 'string') ? 'levels/' + level.levelPath : 'levels/' + lName.replace(' ','_');

    level.defineThingSubclasses();

    currentRoom = undefined; // "undefined" will tell newRoom function that new level is starting.
    inventory = level.initialInventory;
    thingsHere = {}; // in newRoom(), things will be moved from thingsElsewhere to thingsHere.
    spellsAvailable = level.initialSpells;
    runes = level.initialRunes;
    rooms = level.rooms;
    allWords = level.allWords;
    solidObjects = level.solidObjects;
    immovableObjects = level.immovableObjects;
    bridgelikeObjects = level.bridgelikeObjects;
    ellipticalObjects = level.ellipticalObjects;
    otherData = level.otherGameData;

    thingsElsewhere = {};
    wordsFound = [];
    let objectData = level.initialThings;
    for (let i=0; i < objectData.length; i++) {
        let key = objectData[i][0];
        wordsFound.push(key); // so player doesn't get score credit for transforming something into one of these "given" words
        if (key in thingsElsewhere) {
            // might have to append digit to word to get unique key for it:
            for (let j=1; j<10; j++) {
                key = objectData[i][0] + j.toString();
                if (!(key in thingsElsewhere))
                    break;
            }
        }
        thingsElsewhere[key] = getThing(objectData[i][0], objectData[i][1], objectData[i][2], objectData[i][3]);
    }

    let spellListHtml = 'Spells in Binder:<br/>';
    for (i=0; i< spellsAvailable.length; i++) {
        spellListHtml += getSpellListHtml(spellsAvailable[i]);
    }
    // document.getElementById('spell-list').innerHTML = spellListHtml;
    document.getElementById('horizontal-spell-list').innerHTML = spellListHtml;
    document.getElementById('score-div').innerHTML = 'score: <span id="score-span">0</span>';
    level.initializationFunction();

    if (typeof level.backgroundMusicFile !== 'undefined') {
        let path = (level.backgroundMusicFile === 'Sneaky Snitch.mp3') ? 'audio/Sneaky Snitch.mp3' : levelPath + '/audio/' + level.backgroundMusicFile;
        backgroundMusic = new Audio(path);
        document.getElementById('music-toggle-div').style.display = 'block';
        startMusic();
    }

    drawTopBinderImage();

   /* let initialMessage = undefined;
    if (typeof level.initialMessage === 'string') {
        initialMessage = level.initialMessage;
    }*/

    newRoom(level.initialRoom, level.initialX, level.initialY, level.initialMessage);

    animate();
}

function closeBinder() {
    console.log('closing binder');
    pageBeingShownInBinder = '';
    // document.getElementById('binder-icon-holder').style.display = 'block';
    document.getElementById('horizontal-spell-list').style.display = 'block';
    document.getElementById('score-div').style.display = 'block';
    let leftPage = document.getElementById('binder-page-left');
    let rightPage = document.getElementById('binder-page-right');
    let instructionDiv = document.getElementById('binder-instructions');
    leftPage.style.display = 'none';
    rightPage.style.display = 'none';
    instructionDiv.style.display = 'none';
    displayAllCaptions();
    drawInventory(); // shouldn't be necessary when page images are scaled properly but for now they stray into inventory area.
}


function handleKeydown(e) {
    if (e.code === 'Escape') {
        toggleSpellInputWindow(true);
    }
    /*
    if (showingIntroPage || showingSpellInput)
        return;
    if (pageBeingShownInBinder !== '') {
        handleKeyInBinderViewMode(e);
        return;
    }
    else if (e.code === 'KeyR' && levelComplete === true) {
        confirmQuit();
    }
    else if (normalPlayerInputSuppressed === false && levelComplete === false) {
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
            case 'KeyC' : toggleSpellInputWindow(); break;
            case 'KeyI' : drawInventory(); break;
            case 'KeyT' : teleport(); break;
            case 'KeyX' : cheating = !cheating; break; // use to toggle cheating on and off.
            case 'KeyQ' : confirmQuit(); break;

        }
    }

     */
}


function showOrHideBinderPageDiv() {
    let rightPageDiv = document.getElementById('binder-page-right');
    if (pageBeingShownInBinder === allSpells.BINDER_INTRO || pageBeingShownInBinder === allSpells.BINDER_COVER || pageBeingShownInBinder === '') {
        rightPageDiv.style.display = 'none';
    }
    else {
        rightPageDiv.style.display = 'block';
    }
}

function handleKeyInBinderViewMode(e) {
// in "show binder" mode so normal input suppressed.
    switch (e.code) {
        case 'ArrowRight' :
            sounds['page turn'].play();
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
            sounds['page turn'].play();
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
            closeBinder();
            break;
    }
    showOrHideBinderPageDiv();
}

function checkIfClickWasMadeDouble() {
    // if Single click was made a double click, the initial click event Will have been made undefined
    if (typeof initialClickEvent !== 'undefined')
        processSingleOrDoubleClick(initialClickEvent, false);
}

function handleClick(e) {
    if (Date.now() < lastClickTime + MAX_DOUBLE_CLICK_TIME_SEPARATION) {
        initialClickEvent = undefined;
        return processSingleOrDoubleClick(e, true);
    }
    if (!showingIntroPage) {
        initialClickEvent = e;
        lastClickTime = Date.now();
        window.setTimeout(checkIfClickWasMadeDouble, MAX_DOUBLE_CLICK_TIME_SEPARATION);
    }
}

function processSingleOrDoubleClick(e, doubleRatherThanSingle = false) {

    if (showingIntroPage) {
    // TODO: maybe handle clicks on intro page programatically here??
        return;
    }
    else if (pageBeingShownInBinder != '' && Date.now() > timeOfLastBinderOpening + 600 ) {
        // the reason for checking  Date.now() > timeOfLastBinderOpening + 200 is that clicking on the name of a spell in the
        // new binder-icon-holder div will open the binder, but this handler will also fire, and immediately close binder without this check.
        closeBinder();
        return;
    }

    if (document.getElementById('spell-input-div').style.display == 'block')
        return;

    // while player is moving, disable further clicks
    if (player.beginMovementTime > 0 && Date.now() <= player.beginMovementTime + player.movementDurationMS)
        return;

    let xWithinCanvas = e.x - canvasOffsetX;
    let yWithinCanvas = e.y - canvasOffsetY;

    // first see if level-specific code says it will handle the click:
    if (level.clickHandlerFunction(xWithinCanvas,yWithinCanvas) === true) {
        return;
    }

    for ([word, thing] of Object.entries(inventory)) {
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas))
            if (doubleRatherThanSingle)
                thing.handleDblclick();
            else
                thing.handleClick();
    }

    for ([word, thing] of Object.entries(thingsHere)) {
        messageToDisplayIfNothingHandlesSuccessfully = '';
        console.log('hereeeee');
        if (thing.occupiesPoint(xWithinCanvas, yWithinCanvas))
            if (doubleRatherThanSingle) {
                let result = thing.handleDblclick();
                if (typeof result === 'boolean' && result === true)
                    break; // at most one thing should successfully handle dbl click
                else if (typeof result === 'string')
                    messageToDisplayIfNothingHandlesSuccessfully = result;
            }
            else {
                if (thing.okayToDisplayWord()) // i.e. only open spell-input window if the word is being shown
                    thing.handleClick();
                    break; // at most one thing should successfully handle click
            }
            if (messageToDisplayIfNothingHandlesSuccessfully != '') {
                displayMessage(messageToDisplayIfNothingHandlesSuccessfully);
            }
    }

    for (i = 0; i < passages.length; i++) {
        if (passages[i].occupiesPoint(xWithinCanvas, yWithinCanvas))
            passages[i].handleClick();
    }

    drawInventory(); // important not to call this in individual Things' implementations of handleClick()!
}

function resizePage() {
    let bounds = canvas.getBoundingClientRect();
    canvasOffsetX = bounds.left; // + window.scrollX;
    canvasOffsetY = bounds.top; // + window.scrollY;

    scoreDiv = document.getElementById('score-div');
    scoreDiv.style.left = (canvasOffsetX + CANVAS_WIDTH - 130).toString() + 'px';
    scoreDiv.style.top = (canvasOffsetY + 10).toString() + 'px';

    standardMessagePositions = [];
    const messageYoffset = 20; // canvasOffsetY + Math.round(CANVAS_HEIGHT / 8);
    const messageXoffset = Math.round(CANVAS_WIDTH / 2);
    const messageXspacing = 0; // Math.round(CANVAS_WIDTH / 3.1);
    const messageYspacing = Math.round(PLAY_AREA_HEIGHT/7);
    for (let i = 0; i < NUMBER_OF_FIXED_MESSAGE_DIVS; i++) {
        standardMessagePositions.push(
            {
                x : messageXoffset + (i * messageXspacing),
                y : messageYoffset + (i * messageYspacing),
                occupied : false
            }
        );
    }

    let spellDiv = document.getElementById('spell-input-div');
    spellDiv.style.top = (canvasOffsetY + (0.7 * CANVAS_HEIGHT)).toString() + 'px';
    spellDiv.style.left = (canvasOffsetX + (CANVAS_WIDTH / 2) - 110).toString() + 'px';
}

// this is for the very first, non-level-specific setup tasks:
function initialize() {
    // the variables initialized here were actually declared above
    // so as to have global scope.

    player = new Player();
    sounds = {};
    const soundlist = ['pickup', 'whoosh'];

    for (let i = 0; i < soundlist.length; i++) {
        sounds[soundlist[i]] = new Audio('audio/' + soundlist[i] + '.wav');
    }
    sounds['add-spell'] = new Audio('audio/magical_1.ogg');
    sounds['spell'] = new Audio('audio/magical_1.ogg');
    sounds['page turn'] = new Audio('audio/63318__flag2__page-turn-please-turn-over-pto-paper-turn-over.wav');
    sounds['fanfare'] = new Audio('audio/524849__mc5__short-brass-fanfare-1.wav');

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);

    // load rune images
    for (i = 0; i < 26; i++) {
        let lower = String.fromCharCode(i + 97);
        let upper = String.fromCharCode(i + 65);
        let runeImage = new Image(RUNE_IMAGE_WIDTH, RUNE_IMAGE_HEIGHT);
        runeImage.src = 'imgs/runes/Rune-' + upper + '.png';
        runeImages.push(runeImage);
    }

    // load arrow images
    arrowImages = {};
    let directions = ['N','NE','E','SE','S','SW','W','NW'];
    for (let i=0; i<8; i++) {
        arrowImages[directions[i]] = new Image();
        arrowImages[directions[i]].src = 'imgs/arrow-' + directions[i] + '.png';
    }

    // calculate alpha values for pulsing arrows & put in lookup table so don't have to keep recalculating:
    const numberOfFrames = 100;
    arrowsAlphaLookupTable = [];
    for (let i=0; i< numberOfFrames; i++) {
        arrowsAlphaLookupTable.push(0.3 * Math.sin(i * 2.0 * Math.PI / numberOfFrames) + 0.4);
    }

    // load binder page images
    binderImages = {
        side_view_for_top: new Image(),
        intro: new Image(),
        cover: new Image(),
        generic_page: new Image(),
    };
    binderImages['side_view_for_top'].src = 'imgs/binder/binder-large.png';
    binderImages[allSpells.BINDER_INTRO].src = 'imgs/binder/binder-intro.png';
    binderImages[allSpells.BINDER_COVER].src = 'imgs/binder/binder-cover.png';
    binderImages['generic_page'].src = 'imgs/binder/binder-page-blank.png'

    resizePage(); // sets the canvas offsets and other screen positions that depend on them

    document.getElementById('spell-form').onsubmit = function() { castSpell(); return false; };
    document.getElementById('spell-cancel-link').onclick = function () { toggleSpellInputWindow(true); }

    binderPageHtml = {};
    binderPageHtml[allSpells.BINDER_COVER] = '<div class="binder-cover-title"><span style="font-size:24px;">The</span><br/>Spell-<br/>Binder</div>';
    binderPageHtml['binder-intro-left-page'] = '<div class="spell-description">To cast a spell, press C; then type what you wish to transform and the word to transform it into. For example, you might change <span class="monospace">ox</span> into <span class="monospace">fox</span>. For this to work, you need three things: a nearby ox, a spell for putting a letter in front of a word, and a rune of the letter F: <img class="inline-rune" src="imgs/runes/Rune-F.png"> </div>';
    binderPageHtml[allSpells.BINDER_INTRO] = '<div class="spell-description">Each spell is written on a page in this binder; you may find more pages with new spells!</div>';
    binderPageHtml[allSpells.ADD_EDGE] = '<div class="spell-title">Add Edge</div> <div class="spell-description">This spell lets you add a letter at the beginning or end of a word:</div>  <div class="spell-example">change <span class="monospace">fan</span> into <span class="monospace">fang</span></div> <div class="spell-example">change <span class="monospace">ink</span> into <span class="monospace">sink</span></div> <div class="spell-description">Keep in mind you must have a rune of the letter you are adding.</div>';
    binderPageHtml[allSpells.REMOVE_EDGE] = '<div class="spell-title">Remove Edge</div> <div class="spell-description">This spell removes the letter at the beginning or end of a word, and releases it into your care as a rune:</div>  <div class="spell-example">change <span class="monospace">fang</span> into <span class="monospace">fan</span> </div><div class="spell-example"> change <span class="monospace">sink</span> into <span class="monospace">ink</span></div> <div class="spell-description">This is a good way to get more runes!</div>';
    binderPageHtml[allSpells.CHANGE_EDGE] = '<div class="spell-title">Change Edge</div> <div class="spell-description">This spell lets you change the first or last letter in a word:</div>  <div class="spell-example">change <span class="monospace">cable</span> into <span class="monospace">table</span> </div> <div class="spell-description">Keep in mind you need a rune of the new letter (in this example, <img class="inline-rune" src="imgs/runes/Rune-T.png">); the old rune is released to you (here, <img class="inline-rune" src="imgs/runes/Rune-C.png">).</div>';
    binderPageHtml[allSpells.ADD] = '<div class="spell-title">Add Letter</div> <div class="spell-description">This spell lets you add a letter to a word (at the beginning, end, or anywhere in the middle):</div>  <div class="spell-example">change <span class="monospace">fan</span> into <span class="monospace">fang</span></div> <div class="spell-example">change <span class="monospace">cat</span> into <span class="monospace">cart</span></div> <div class="spell-description">Keep in mind you must have a rune of the letter you are adding.</div>';
    binderPageHtml[allSpells.REMOVE] = '<div class="spell-title">Remove Letter</div> <div class="spell-description">This spell removes a letter from a word, and releases it into your care as a rune:</div>  <div class="spell-example">change <span class="monospace">cart</span> into <span class="monospace">cat</span> </div><div class="spell-example"> change <span class="monospace">sink</span> into <span class="monospace">ink</span></div> <div class="spell-description">This is a good way to get more runes!</div>';
    binderPageHtml[allSpells.CHANGE] = '<div class="spell-title">Change Letter</div> <div class="spell-description">This spell lets you change a letter in a word:</div>  <div class="spell-example">change <span class="monospace">seat</span> into <span class="monospace">slat</span> </div> <div class="spell-description">Keep in mind you need a rune of the new letter (in this example, <img class="inline-rune" src="imgs/runes/Rune-L.png">); the old rune is released to you.</div>';
    binderPageHtml[allSpells.REVERSAL] = '<div class="spell-title">Reversal</div> <div class="spell-description">Simply reverses a word:</div>  <div class="spell-example">change <span class="monospace">auks</span> into <span class="monospace">skua</span></div>';
    binderPageHtml[allSpells.ANAGRAM] = '<div class="spell-title">Anagram</div> <div class="spell-description">This spell lets you rearrange the letters in a word:</div>  <div class="spell-example">change <span class="monospace">flea</span> into <span class="monospace">leaf</span></div>';

    /*
    let binderIconHolder = document.getElementById('binder-icon-holder');
    binderIconLeft = canvasOffsetX + CANVAS_WIDTH - BINDER_ICON_WIDTH;
    binderIconHolder.style.top = canvasOffsetY.toString() + 'px';
    binderIconHolder.style.left = binderIconLeft.toString() + 'px';
    binderIconHolder.addEventListener( 'mouseover', handleBinderIconMouseover );
    binderIconHolder.addEventListener('mouseout', handleBinderIconMouseout);
    */

    let leftPage = document.getElementById('binder-page-left');
    let rightPage = document.getElementById('binder-page-right');
    let instructionDiv = document.getElementById('binder-instructions');
    leftPage.style.display = 'none';
    rightPage.style.display = 'none';
    instructionDiv.style.display = 'none';
    leftPage.style.top = (canvasOffsetY + 50).toString() + 'px';
    leftPage.style.left = (canvasOffsetX + 25).toString() + 'px';
    rightPage.style.top = (canvasOffsetY + 50).toString() + 'px';
    rightPage.style.left = (canvasOffsetX + (CANVAS_WIDTH / 2) + 50).toString() + 'px';
    instructionDiv.style.top = (canvasOffsetY + PLAY_AREA_HEIGHT + 15).toString() + 'px';
    instructionDiv.style.left = (canvasOffsetX + 15).toString() + 'px';
    instructionDiv.style.height = (CANVAS_HEIGHT - PLAY_AREA_HEIGHT - 45).toString() + 'px';
    instructionDiv.style.width = (CANVAS_WIDTH.toString() - 45).toString() + 'px';
    instructionDiv.innerText = "Click to close the Binder.";
}

function showIntroScreen() {
    stopDisplayingMsg(true);
    deleteCaptions(true); // "true" here forces deletion of captions in inventory too
    document.getElementById('binder-icon-holder').style.display = 'none';
    document.getElementById('music-toggle-div').style.display = 'none';
    document.getElementById('horizontal-spell-list').style.display = 'none';
    document.getElementById('score-div').style.display = 'none';

    canvas.style.display = 'none';

    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'block';
    showingIntroPage = true;
    if (typeof backgroundMusic === 'object' && musicPlaying === true) {
        musicPlaying = false;
        backgroundMusic.pause();
    }

    // document.getElementById('loadLevelButton').addEventListener('click',loadLevel);
}

initialize();

showIntroScreen();

