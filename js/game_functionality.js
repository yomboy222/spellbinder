/*  game_functionality.js
    javascript code to run Spell-Binder game
    Doug McLellan 1/2022
*/

/* global-scope variables: */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
let allWords = {};
let thingsElsewhere = {};
let inventory = {};
let thingsHere = {};
let spellsAvailable = {};
let rooms = {};
let passages = [];
let boundaries = [];
let currentRoom = '';
let player = {};
let sounds = {};
let backgroundImage = new Image();

let PassageTypes = { BASIC_VERTICAL : 'basic_vertical',
    BASIC_HORIZONTAL : 'basic_horizontal',
    INVISIBLE_VERTICAL : 'invisible_vertical',
    INVISIBLE_HORIZONTAL : 'invisible_horizontal' };

console.log('hi');

function NOOP() {}

class Player {
    constructor(props) {
        this.x = 50;
        this.y = 50;
        this.goingUp = false;
        this.goingDown = false;
        this.goingLeft = false;
        this.goingRight = false;
    }

    update() {
        if (this.goingUp) this.y -= 1;
        if (this.goingDown)this.y += 1;
        if (this.goingRight) this.x += 1;
        if (this.goingLeft) this.x -= 1;
    }

    draw() {
        ctx.fillRect(this.x,  this.y,  15,  15);
    }
}

class Thing {
    constructor(word, room, x, y) {
        this.word = word;
        this.room = room;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.image = new Image();
        this.image.src = 'imgs/things/' + word + '.png';
    }
    update() {

    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Passage {
    constructor(originRoom, type, x, y, destinationRoom, destX, destY) {
        this.originRoom = originRoom;
        this.type = type;
        this.x = x;
        this.y = y;
        this.destinationRoom = destinationRoom;
        this.destX = destX;
        this.destY = destY;
    }
}

function pickUpNearbyThings() {

}

function castSpell() {
    let command = window.prompt('Cast a spell:');

}


function animate() {
    ctx.clearRect(0, 0,  CANVAS_WIDTH,  CANVAS_HEIGHT);

    for (let [word, thing] of Object.entries(thingsHere)) {
        thing.update();
        thing.draw();
    }

    player.update();
    player.draw();

    requestAnimationFrame(animate);
}

function newRoom(roomName) {
    let roomData = rooms[roomName];
    passages = roomData.passages;
    boundaries = roomData.boundaries;
    backgroundImage = new Image(CANVAS_WIDTH, CANVAS_HEIGHT);
    backgroundImage.src = '/imgs/rooms/' + roomName.replace(' ','_') + '.png';
}

function loadLevel(levelName = '1') {
    console.log('loading level ' + levelName);
    canvas.style.display = 'block';

    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'none';

    let levelData = getLevelData(levelName);

    currentRoom = levelData.initialRoom;
    player.x = levelData.initialX;
    player.y = levelData.initialY;
    inventory = levelData.initialInventory; // note copying by reference OK here b/c getLevelData initializes with literals
    thingsHere = levelData.initialThingsHere;
    thingsElsewhere = levelData.initialThingsElsewhere;
    spellsAvailable = levelData.initialSpells;
    rooms = levelData.rooms;

    newRoom(currentRoom);

    animate();
}

function handleKeydown(e) {
    switch (e.code) {
        case 'ArrowRight' : player.goingRight = true; break;
        case 'ArrowLeft' : player.goingLeft = true; break;
        case 'ArrowUp' : player.goingUp = true; break;
        case 'ArrowDown' : player.goingDown = true; break;

        case 'Space' :  sounds['pickup'].play(); pickUpNearbyThings(); break;
        case 'KeyC' : castSpell(); break;
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

// this is for the very first, non-level-specific setup tasks:
function initialize() {
    player = new Player();

    sounds = { 'pickup' : new Audio('audio/magical_1.ogg') };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);

    allWords = { 'arts':1,  'asteroid':1,  'ace':1,  'adder':1,  'amp':1,  'bat':1,  'bath':1,  'boar':1,  'board':1,  'brook':1,  'bulls-eyes':1, 
        'carts':1, 
        'cabinet':1,  'chive':1, 
        'clam':1,  'clamp':1,  'cow':1,  'cowl':1,  'crow':1,  'crown':1,  'darts':1,  'drawer':1,  'eel':1,  'flock':1,  'ghost':1, 
        'heel':1,  'hive':1,  'host':1, 
        'keel':1,  'ladder':1,  'lamp':1,  'leek':1,  'lock':1,  'mace':1,  'mantra':1,  'mantrap':1,  'meteor':1,  'owl':1,  'pan':1,  'parts':1, 
        'peel':1,  'portcullis':1, 
        'rat':1,  'reed':1,  'reward':1,  'spa':1,  'spam':1,  'span':1,  'star':1,  'steroid':1,  'strad':1,  'strap':1,  'straw':1,  'stream':1, 
        'tab':1,  'tar':1,  'taro':1, 
        'tarot':1,  'toll machine':1,  'tuna':1,  'warts':1,  'wheel':1,  };
}

function showIntroScreen() {
    canvas.style.display = 'none';
    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'block';
   // document.getElementById('loadLevelButton').addEventListener('click',loadLevel);
}

initialize();

showIntroScreen();

