/* level_data.js */

let levelData = {};

function getLevelData(levelName) {
    switch(levelName) {
        case '1': return {
            initialRoom: 'entry point',
            initialX: 100,
            initialY: 100,
            initialSpells: ['add-edge', 'remove-edge','reversal'],
            initialInventory: {},
            initialThingsElsewhere: {
                'asteroid' : new Asteroid('asteroid', 'room2', 300, 80),
                'clam': new Clam('clam', 'entry point', 200, 200),
                'mace': new Thing('mace','entry point', 300, 30),
                'meteor' : new Meteor('meteor', 'room2', 520, 120),
                'rat': new Thing('rat','entry point', 150, 10),
                'spa' : new Spa ('spa', 'entry point', 100,400) ,
                'ghost' : new Ghost ('ghost', 'room2', 200, 400) ,
                'mantrap' : new Mantrap('mantrap', 'room2', 400, 400) , },
            initialRunes: ['p','n'],
            rooms: {
                'entry point': {
                    boundaries: [ ['h', 100, 300, 300, 300], ['v', 300, 200, 300, 300] ],
                    passages: [new Passage(PassageTypes.BASIC_RIGHT, 576, 100, 'room2', 100, 200)],
                },
                'room2': {
                    boundaries: [],
                    passages: [new Passage(PassageTypes.BASIC_LEFT, 22, 200, 'entry point', 520, 100),],
                }
            }
        }; break;

        case '2': return {}; break;
    }
}
