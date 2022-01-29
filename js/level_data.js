/* level_data.js */

let levelData = {};

function getLevelData(levelName) {
    switch(levelName) {
        case '1': return {
            initialRoom: 'entry point',
            initialX: 20, // expressed as % of way across x axis, i.e. value range is 0-100
            initialY: 50,
            initialSpells: ['remove-edge','add-edge','reversal'],
            initialInventory: {},
            otherGameData: { 'hive in place':true,
                'last hive trigger time':0,
                'bee image':new Image()},
            initialThings: {
                'asteroid' : getThing('asteroid', 'asteroid room', 70, 30),
                'bath': getThing('bath','bathroom',25,70),
                'bulls-eyes': getThing('bulls-eyes', 'game room', 50, 50),
                'cabinet': getThing('cabinet','bathroom',25,25),
                'clam': getThing('clam', 'kitchen', 50, 50),
                'crown': getThing('crown','crown room',50,50),
                'drawer': getThing('drawer','beyond', 50, 50),
                'ghost' : getThing('ghost', 'entry hall 1', 40, 50) ,
                'hive': getThing('hive','hive room',43,35),
                'leek': getThing('leek','kitchen',70,50),
                'mace': getThing('mace','armory', 50, 50),
                'meteor' : getThing('meteor', 'asteroid room', 70, 60),
                'mantrap' : getThing('mantrap', 'main', 50, 23) ,
                'portcullis': getThing('portcullis', 'beyond', 65, 40),
                'spa' : getThing('spa', 'bathroom', 67,36) ,
                'statue1' : getThing('statue','statue room', 21, 23),
                'statue2' : getThing('statue','statue room', 51, 23),
                'statue3' : getThing('statue','statue room', 81, 23),
                'statue4' : getThing('statue','statue room', 21, 77),
                'statue5' : getThing('statue','statue room', 51, 77),
                'statue6' : getThing('statue','statue room', 81, 77),
                'straw': getThing('straw', 'hive room', 23, 65),
                'stream': getThing('stream','stream room', 50, 50),
                'toll machine': getThing('toll_machine', 'beyond', 70,70),
                'treasure': getThing('treasure', 'stream room', 90, 80),},

            initialRunes: ['p','n', 'c'],
            rooms: {
                'asteroid room': {
                    boundaries: [],
                    passages: [ new Passage(PassageTypes.INVISIBLE_HORIZONTAL,0,50,'main',89,50),],
                },
                'bathroom': {
                    boundaries:[ ['n',15,15,85,15], ['n',85,15,85,85], ['n',85,85,15,85], ['n',15,85,15,15], ],
                    passages:[ new Passage(PassageTypes.INVISIBLE_HORIZONTAL,50,85,'main',50,11),
                        new Passage(PassageTypes.BASIC_RIGHT,85,65,'game room',12,50),],
                },
                'darkroom':{
                    boundaries:[ ['n',10,20,90,20], ['n',90,20,90,82], ['n',90,70,10,82], ['n',10,70,10,20]],
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
                    boundaries: [],
                    passages: [ new Passage(PassageTypes.INVISIBLE_VERTICAL,0,50,'bathroom',70,66),],
                },

                'main': {
                    boundaries: [ ['n',0,36,40,36], ['n',40,36,40,0], ['n',60,0,60,36], ['n',60,36,100,36], ['n',100,64,60,64], ['n',60,64,60,100], ['n',40,100,40,64], ['n',40,64,0,64] ],
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'statue room', 90, 50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL,100,50,'asteroid room',15,50),
                        new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 50, 0, 'bathroom',50,65),
                        new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 50, 100, 'darkroom',50,32),
                    ]
                },
                'hive room': {
                    boundaries: [ ['n',75,0,75,50], ['n',92,0,92,72], ['n',75,50,50,50], ['n',50,50,50,25], ['n',50,25,15,25], ['n',15,25,15,72], ['n',15,72,92,72],
                        ['i',50,50,50,72], ],
                    passages: [new Passage(PassageTypes.INVISIBLE_HORIZONTAL, 84, 0, 'entry hall 1', 84, 90), ]
                },
                'secret room': {
                    boundaries: [ ['n',22,42,22,0], ['n',22,0,38,0], ['n',38,15,38,42]  ],
                    passages: [ new Passage(PassageTypes.BASIC_RIGHT, 38, 14, 'statue room', 49, 78), ],
                },
                'statue room': {
                    boundaries: [ ['n',0,36,12,36], ['n',12,36,12,10], ['n',12,10,30,10], ['n',30,10,30,36], ['n',30,36,42,36],
                        ['n',42,36,42,10], ['n',42,10,60,10], ['n',60,10,60,36], ['n',60,36,72,36], ['n',72,36,72,10], ['n',72,10,90,10], ['n',90,10,90,36], ['n',90,36,100,36],
                        ['n',0,64,12,64], ['n',12,64,12,90], ['n',12,90,30,90], ['n',30,90,30,64], ['n',30,64,42,64], ['n',42,64,42,90], ['n',42,90,60,90],
                        ['n',60,90,60,64], ['n',60,64,72,64], ['n',72,64,72,90], ['n',72,90,90,90], ['n',90,90,90,64], ['n',90,64,100,64], ] ,
                    passages: [new Passage(PassageTypes.INVISIBLE_VERTICAL, 0, 50, 'entry hall 1', 90, 50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL, 100, 50, 'main', 11, 50),
                        new Passage(PassageTypes.INVISIBLE_VERTICAL, 41, 91, 'secret room', 30, 20),
                    ],
                },
            },
            levelSpecificInitialization: function() {
                console.log('yo');
                otherData['bee image'].src = 'imgs/things/bees-1.png';
                otherData['bee sound'] = new Audio('audio/481647__joncon-library__bee-buzzing.wav');
            },
            levelSpecificNewRoomBehavior: function(roomName) {
                if (roomName === 'hive room' && otherData['hive in place'] === false) {
                    // remove the invisible boundary caused by the hive:
                    for (let i = 0;i < boundaries.length; i++) {
                        if (boundaries[i][0] === 'i')
                            boundaries.splice(i);
                    }
                }
            },
            levelSpecificAnimateLoopBehavior : function() {
                if (currentRoom === 'hive room' && otherData['hive in place'] === true) {
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
                }
            },
            levelSpecificPostTransformBehavior : function(fromWord, toWord) {
                if (fromWord === 'hive') {
                    otherData['hive in place'] = false;
                    // remove the invisible boundary caused by the hive:
                    for (let i = 0;i < boundaries.length; i++) {
                        if (boundaries[i][0] === 'i')
                            boundaries.splice(i);
                    }
                }
            },
        }; break;

        case '2': return {}; break;
    }
}
