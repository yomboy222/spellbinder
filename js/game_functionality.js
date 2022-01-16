/*  game_functionality.js
    javascript code to run Spell-Binder game
    Doug McLellan 1/2022
*/

/* global-scope variables: */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 500;
let allWords = {};
let thingsElsewhere = {};
let inventory = {};
let thingsHere = {};
let passages = [];
let currentRoom = '';
let player = {};

console.log('hi');

function NOOP() {}

class Player {
    constructor(props) {
        this.x = 50;
        this.y = 50;
    }

    update() {}
    draw() {
        ctx.fillRect(this.x,  this.y,  15,  15);
    }
}

class Thing {
    constructor(word) {
        this.word = word;
        this.x = 10;
        this.y = 50;
        this.width = 50;
        this.height = 50;
    }
    update() {
        this.x++;
        this.y++;
    }
    draw() {
        ctx.fillRect(this.x,  this.y,  this.width,  this.height);
    }
}

function animate() {
    ctx.clearRect(0, 0,  CANVAS_WIDTH,  CANVAS_HEIGHT);

    for (let [word, thing] of Object.entries(thingsHere)) {
        thing.update();
        thing.draw();
    }

    requestAnimationFrame(animate);
}

function loadLevel(levelNumber = 1) {
    console.log('loading level ' + levelNumber.toString());
    canvas.style.display = 'block';

    let introDiv = document.getElementById('intro_screen_div');
    introDiv.style.display = 'none';

    thingsHere = {
        'clam' : new Thing('clam')
    }

    thingsElsewhere = {
        'mace' : new Thing('mace'),
        'crown' : new Thing('crown')
    }

    animate();
}

// this is for the very first, non-level-specific setup tasks:
function initialize() {
    player = new Player();

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

