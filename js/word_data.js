/* word_data.js */

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
        sounds['whoosh'].play();
        if (this.x === this.initialX) {
            this.x -= 40;
            if (spellsAvailable.indexOf('reversal') < 0) {
                addSpellToBinder('reversal');
            }
        }
        else {
            this.x += 40;
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
        if (typeof otherData['toll paid time'] == 'undefined' || Date.now() < otherData['toll paid time'] + 1000) {
            // draw normally
            return super.draw();
        } else if (Date.now() >= otherData['toll paid time'] + 5000) {
            // fully retracted, so delete:
            delete thingsHere['portcullis'];
            return;
        } else {
            // otherwise draw the "retracting" behavior:
            let deltaY = -300 * ((Date.now() - otherData['toll paid time'] - 1000) / 4000);
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
