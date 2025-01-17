var player = new Player();

let last_local_save = -1;

function gameLoop() {
    let current_time = Date.now();

    if (last_local_save < current_time - 1000) {
        if (last_local_save == -1) local_load();
        else local_save();
        last_local_save = current_time;
    }

    let delta = current_time - player.last_time_ts;
    player.last_time_ts = current_time;

    playerUpdate(delta);
    screenUpdate();

    setTimeout(gameLoop, 50);
}

var tree = document.getElementById("tree");
var panzoom = Panzoom(tree, { canvas: true, maxScale: 1e100, step: 1 })
tree.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);

window.addEventListener("resize", () => player.current_layer.selectLayer(true, true));

var settingsContainer = document.getElementById("settings-container");
var zoomOptions = {
    "-3": .15,
    "-2": .2,
    "-1": .3,
    "0": .5,
    "1": 1,
    "2": 2,
    "3": 4
}
document.getElementById("zoomModifier").addEventListener("input", e => {
    player.zoomModifier = zoomOptions[e.currentTarget.value];
    player.current_layer.selectLayer();
});
document.getElementById("settings-toggle").addEventListener("click", () => {
    settingsContainer.style.visibility = settingsContainer.style.visibility === 'hidden' ? '' : 'hidden';
});
document.getElementById("animations-toggle").addEventListener("click", () => {
    player.animations = !player.animations;
    document.getElementById("animations-toggle").innerText = player.animations ? "Enabled" : "Disabled";
});
document.getElementById("singleclick-toggle").addEventListener("click", () => {
    player.singleclick = !player.singleclick;
    document.getElementById("singleclick-toggle").innerText = player.singleclick ? "Single Click" : "Double Click";
});
document.getElementById("hard-reset").addEventListener("click", () => {
    const input = window.prompt("Input a seed, or leave blank for a random one:");
    if (input === "") {
        hard_reset();
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber !== NaN && inputNumber >= 0 && inputNumber < 2 ** 32) {
            hard_reset(Math.floor(inputNumber));
        }
    }
});

document.addEventListener('keydown', e => {
    if ((e.code === 'KeyW' || e.code === 'ArrowUp') && player.current_layer.parent_layer !== undefined) {
        player.current_layer.parent_layer.selectLayer(true);
    }
    if ((e.code === 'KeyA' || e.code === 'ArrowLeft') && player.current_layer.child_left !== undefined) {
        player.current_layer.child_left.selectLayer(true);
    }
    if ((e.code === 'KeyD' || e.code === 'ArrowRight') && player.current_layer.child_right !== undefined) {
        player.current_layer.child_right.selectLayer(true);
    }
    if (e.code === 'KeyP' && player.current_layer.canPrestige()) {
        player.current_layer.prestige();
    }
    if (e.code === 'KeyM') {
        for (let upgrade of Object.values(player.current_layer.upgrades)) {
            if (upgrade.bought) {
                continue;
            } else if (upgrade.canBuy()) {
                upgrade.buy();
            } else {
                break;
            }
        }
    }
    if (e.code === 'Space' || e.code === 'ArrowDown') {
        player.current_layer.selectLayer(true);
    }
});

requestAnimationFrame(() => {
    player.current_layer.selectLayer(true, true);
    gameLoop();
});
