/* post_level_loading_code.js */
/* intended to generate the html for the menu of levels, once all the level .js files are included */

function generateMenuOfLevels () {
    let menuDiv = document.getElementById('level-list-div');
    for (let i=0; i<levelList.length; i++) {
        let menuItemDiv = document.createElement('div');
        menuItemDiv.classList.add('level-menu-item');
        menuItemDiv.innerHTML = '<a href="#" id="level' + i.toString() + '"><img src="imgs/play-button.png"> ' + levelList[i].name + ' (' + levelList[i].difficulty.toString() + ')</a>';
       /*  let button = document.createElement('button');
        button.classList.add('loadLevelButton');
        button.value = levelList[i].name;
        button.innerText = levelList[i].name;
        button.onclick = function() { loadLevel(levelList[i].name); }
        menuItemDiv.appendChild(button); */
        menuDiv.appendChild(menuItemDiv);
        let link = document.getElementById('level' + i.toString());
        link.onclick = function() { loadLevel(levelList[i].name); };
    }
}

generateMenuOfLevels();
