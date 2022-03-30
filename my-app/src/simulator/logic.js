import { random, multiply } from "mathjs";

import { Organism, Food, Objects, DataGroups, lines, ResetStates } from "./GameInstance";
import { mainCamera, Render } from "../rendering/render"

var nrOfFood = 100;
var spawnRange = 200;
var state = null;
var keys = null;

var boardCallback = null
function UpdateState(_state) {
    state = _state;
}

function UpdateKeys(_keys) {
    keys = _keys;
}

var initialized = false;
function Run(_boardCallback) {
    if (initialized) return;
    initialized = true;
    boardCallback = _boardCallback;
    InitLogic();
    setInterval(() => {
        mainLoop();
    }, 20);
    mainLoop();
    setInterval(() => {
        updateBoard();
    }, 1000);
}

function spawn(object) {
    var x = random(-spawnRange, spawnRange);
    var y = random(-spawnRange, spawnRange);
    new object([x, y]);
}

function InitLogic() {
    while (Objects.food === undefined || Objects.food.length < nrOfFood) {
        spawn(Food);
    }
    while (!Objects.organism || Objects.organism.length < state.minOrganisms) {
        spawn(Organism);
    }
}

let moveTime = 1;
function moveCamera(dtime) {
    if (keys === null) return;
    let cameraMove = [0, 0, 0];
    let hasMove = false;
    if (keys.has("a")) {
        cameraMove[0] += 1;
        hasMove = true;
    }
    if (keys.has("d")) {
        cameraMove[0] -= 1;
        hasMove = true;
    }
    if (keys.has("w")) {
        cameraMove[2] += 1;
        hasMove = true;
    }
    if (keys.has("s")) {
        cameraMove[2] -= 1;
        hasMove = true;
    }
    if (keys.has("q")) {
        cameraMove[1] += 1;
        hasMove = true;
    }
    if (keys.has("e")) {
        cameraMove[1] -= 1;
        hasMove = true;
    }
    if (hasMove) {
        moveTime += dtime;
        mainCamera.move(multiply(cameraMove, 10 * dtime * moveTime * moveTime));
    }
    else {
        moveTime = 1;
    }
}

var last_time = new Date().getTime();
function mainLoop() {
    var time = null
    var dtime = null
    time = new Date().getTime();
    dtime = Math.min(time - last_time, 1000) / 1000;
    last_time = time;
    moveCamera(dtime);

    dtime *= state.simulationSpeed;
    ResetStates();
    if (dtime > 0) {
        runSimulation(dtime, state.rendering.rays && state.rendering.scene);
        if (state.rendering.scene)
            Render(DataGroups, lines, 0, [0, 0])
    }
}

function runSimulation(dtime, renderLines) {
    while (Objects["organism"].length < state.minOrganisms) {
        spawn(Organism);
    }
    for (var type in Objects) {
        let group = Objects[type]
        for (var obj of group) {
            obj.Update(dtime, renderLines);
        }
    }
}
function updateBoard() {
    if (boardCallback) {
        boardCallback(Objects.organism);
    }
}

export default Run;
export { UpdateState, UpdateKeys }