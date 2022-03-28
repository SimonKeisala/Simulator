var nrOfFood = 100;
var nrOfOrganisms = 30;

var speedup = 1;

var zoom = 1;

function randomValue(low, high) {
    'use strict';
    return (Math.random() * (high - low)) + low;
}

function InitLogic() {
    "use strict";
    for (var i = 0; i < nrOfFood; ++i) {
        var x = randomValue(-spawnRange, spawnRange);
        var y = randomValue(-spawnRange, spawnRange);

        new Food([x, y]);
    }
    while (organism.instances.length < nrOfOrganisms) {
        var x = randomValue(-spawnRange, spawnRange);
        var y = randomValue(-spawnRange, spawnRange);

        new Organism([x, y]);
    }
}

var logicTime = new Date().getTime();
var avgUps = 0;
function Run() {
    "use strict";
    var time = new Date().getTime();
    var dtime = time - logicTime;
    dtime = Math.min(dtime, 1000);
    logicTime = time;

    avgUps = 0.95 * avgUps + 0.05 * (1000 / (dtime));

    speedup = Math.max(speedup, 0);
    dtime *= speedup;
    lines = [];
    if (dtime > 0) {
        runSimulation(dtime);
    }
    else return;
    var objects = Object();
    objects.foodPositions = [];
    for (var i = 0; i < circle.instances.length; ++i) {
        var pos = circle.instances[i].GetPosition();
        objects.foodPositions.push(pos[0]);
        objects.foodPositions.push(pos[1]);
        objects.foodPositions.push(circle.instances[i].scale);
    }
    send(objects);
}
var quadTree = new Quad(new Rectangle(-spawnRange * 1.5, -spawnRange * 1.5, spawnRange * 3, spawnRange * 3), 100);
function runSimulation(dtime) {

    quadTree.clear();
    while (organism.instances.length < nrOfOrganisms) {
        var x = randomValue(-spawnRange, spawnRange);
        var y = randomValue(-spawnRange, spawnRange);

        new Organism([x, y]);
    }

    for (var i in AllInstances) {
        quadTree.insert(AllInstances[i].GetPosition(), AllInstances[i]);
    }
    for (var i = 0; i < GraphicalObject.allObjects.length; ++i) {
        var object = GraphicalObject.allObjects[i];
        if (object.instances.length == 0 || object.instances[0].Update === undefined) {
            continue;
        }
        for (var j = object.instances.length - 1; j >= 0; --j) {
            var instance = object.instances[j];
            if (instance.Update !== undefined) {
                instance.Update(dtime);
            }
        }
    }
}

function send(objectList) {
    //postMessage(["objectList", objectList]);
    var e = Object()
    e.data = ["objectList", objectList];
}
