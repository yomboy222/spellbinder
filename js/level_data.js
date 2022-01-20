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
            initialThingsHere: {'clam': new Clam('clam', 'entry point', 200, 200)},
            initialThingsElsewhere: {},
            initialRunes: ['p'],
            rooms: {
                'entry point': {
                    boundaries: [ ['h', 100, 300, 500, 300], ['v', 520, 0, 520, 300] ],
                    passages: [new Passage('entry point', PassageTypes.BASIC_VERTICAL, 200, 200, 'room2', 100, 100),
                        new Passage('room2', PassageTypes.BASIC_VERTICAL, 200, 200, 'entry point', 100, 100),],
                },
            }
        }; break;

        case '2': return {}; break;
    }
}
