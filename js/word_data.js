/* word_data.js */

let allWords = { 'arts':1,  'asteroid':1,  'ace':1,  'adder':1,  'amp':1,  'bat':1,  'bath':1,  'boar':1,  'board':1,  'brook':1,  'bulls-eyes':1,
    'carts':1,
    'cabinet':1,  'chive':1,
    'cla':1, 'lam':1, 'aclam':1,
    'clam':1,  'clamp':1,  'cow':1,  'cowl':1,  'crow':1,  'crown':1,  'darts':1,  'drawer':1,  'eel':1,  'flock':1,  'ghost':1,
    'heel':1,  'hive':1,  'host':1,
    'keel':1,  'ladder':1,  'lamp':1,  'leek':1,  'lock':1,  'mace':1,  'mantra':1,  'mantrap':1,  'meteor':1,  'owl':1,  'pan':1,  'parts':1,
    'peel':1,  'portcullis':1,
    'rat':1,  'reed':1,  'reward':1,  'spa':1,  'spam':1,  'span':1,  'star':1,  'steroid':1,  'strad':1,  'strap':1,  'straw':1,  'stream':1,
    'tab':1,  'tar':1,  'taro':1,
    'tarot':1,  'toll machine':1,  'tuna':1,  'warts':1,  'wheel':1,  };

let solidObjects = { 'clam':1, 'brook':1, 'bulls-eyes':1,'portcullis':1,'cabinet':1,'stream':1,'cow':1,'lock':1,'spa':1,'bath':1,'ceiling':1,
        'ghost':1,'drawer':1,'pools':1,'mantrap':1,'meteor':1,'asteroid':1 };

let immovableObjects = { 'brook':1,'bulls-eyes':1,'portcullis':1,'cabinet':1,'stream':1,'flock':1,'lock':1,'cow':1,'bath':1,'spa':1,
    'span':1,'ghost':1,'meteor':1,'asteroid':1,'board':1,'boar':1,'pools':1,'mantrap':1,'drawer':1 };

let bridgelikeObjects = { 'span':1, 'ladder':1 };

class Clam extends Thing {
    handleClick() {
        console.log ('clam implementation!');
        super.handleClick();
    }
}

