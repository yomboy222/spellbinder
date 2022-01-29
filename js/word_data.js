/* word_data.js */

let allWords = [ 'arts',  'asteroid',  'ace',  'adder',  'amp',  'bat',  'bath',  'boar',  'board',  'brook',  'bulls-eyes',
    'carts',
    'cabinet',  'chive',
    'clam',  'clamp',  'cow',  'cowl',  'crow',  'crown',  'darts',  'drawer',  'eel',  'flock',  'ghost',
    'heel',  'hive',  'host',
    'keel',  'ladder',  'lamp',  'leek',  'lock',  'mace',  'mantra',  'mantrap',  'meteor',  'owl',  'pan',  'parts',
    'peel',  'portcullis',
    'rat',  'reed',  'reward',  'spa',  'spam',  'span',  'star',  'steroid',  'strad',  'strap',  'straw',  'stream',
    'tab',  'tar',  'taro',
    'tarot',  'toll machine',  'tuna',  'warts',  'wheel',  ];

let solidObjects = [ 'clam', 'brook', 'bulls-eyes','portcullis','cabinet','stream','cow','lock','spa','bath','ceiling',
        'ghost','drawer','pools','mantrap','meteor','asteroid' ];

let immovableObjects = [ 'brook','bulls-eyes','portcullis','cabinet','stream','flock','lock','cow','bath','spa',
    'span','ghost','host','meteor','asteroid','board','boar','pools','mantrap','drawer' ];

let bridgelikeObjects = [ 'span', 'ladder' ];

let ellipticalObjects = [ 'clam', 'meteor', 'asteroid'];

class Asteroid extends Thing {
    displayCantPickUpMessage() {
        displayMessage('Too heavy!');
    }
}

class Cabinet extends Thing {
    handleClick() {
        if (spellsAvailable.indexOf('add-edge') < 0)
            addSpellToBinder('add-edge');
    }
}

class Ghost extends Thing {
    constructor(word, room, x, y) {
        super(word, room, x, y);
        this.initialY = y;
    }
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

class Meteor extends Thing {
    displayCantPickUpMessage() {
        displayMessage('Too heavy!');
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
}

function getThing(word, room, x, y, treatXandYasPercentages = true, otherArgs = undefined) {
    if (treatXandYasPercentages) {
        x = x * xScaleFactor;
        y = y * yScaleFactor;
    }
    switch (word) {
        case 'asteroid' : return new Asteroid(word, room, x, y);
        case 'cabinet' : return new Cabinet(word, room, x, y);
        case 'ghost' : return new Ghost (word, room, x, y);
        case 'host' : return new Host (word, room, x, y);
        case 'mantra' : return new Mantra (word, room, x, y);
        case 'mantrap' : return new Mantrap (word, room, x, y);
        case 'meteor' : return new Meteor(word, room, x, y);
        case 'steroid' : return new Steroid(word, room, x, y);
        case 'spa' : return new Spa (word, room, x, y);
        default : return new Thing (word, room, x, y);
    }
}
