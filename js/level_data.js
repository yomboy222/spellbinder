/* level_data.js */

let levelData = {};

function getLevelData(levelName) {
    switch(levelName) {
        case '1': return {
            initialRoom: 'entry point',
            initialX: 100,
            initialY: 50,
            initialSpells: {'add-edge': 1, 'reversal': 1},
            initialInventory: {},
            initialThingsHere: {'clam': new Thing('clam', 'entry point', 50, 50)},
            initialThingsElsewhere: {},
            rooms: {
                'entry point': {
                    boundaries: [],
                    passages: [new Passage('entry point', PassageTypes.BASIC_VERTICAL, 200, 200, 'room2', 100, 100),
                        new Passage('room2', PassageTypes.BASIC_VERTICAL, 200, 200, 'entry point', 100, 100),],
                },
            }
        }; break;

        case '2': return {}; break;
    }
}
