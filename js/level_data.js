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
            initialThingsElsewhere: {'clam': new Clam('clam', 'entry point', 200, 200),
                'mace': new Thing('mace','entry point', 300, 30),
                'rat': new Thing('rat','entry point', 150, 10),
                'spam' : new Thing ('spam', 'room2', 50,300) },
            initialRunes: ['p'],
            rooms: {
                'entry point': {
                    boundaries: [ ['h', 100, 300, 500, 300], ['v', 500, 200, 500, 300] ],
                    passages: [new Passage(PassageTypes.BASIC_RIGHT, 576, 100, 'room2', 200, 100)],
                },
                'room2': {
                    boundaries: [],
                    passages: [new Passage(PassageTypes.BASIC_LEFT, 22, 200, 'entry point', 100, 100),],
                }
            }
        }; break;

        case '2': return {}; break;
    }
}
