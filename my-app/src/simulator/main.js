var minOrganisms = 0;
var speedMult = 1;
var foodQuadTree = null;
var organismQuadTree = null;
var selectedObject = null;
var UpdatesPerSecond = 200;
var foodQuadTreeDirty = false;
var sharedObjectData = null;

var spawnRange = 100;

var lines = [];
function randomValue(low, high) {
    return (Math.random() * (high - low)) + low;
}

var logicTime = new Date().getTime();
var avgUps = 0;
var hasUpdated = false;
function Run() {
    var time = new Date().getTime();
    var dtime = time - logicTime;
    dtime = Math.max(1, Math.min(dtime, 1000));
    logicTime = time;

    avgUps = 0.95 * avgUps + 0.05 * (1000 / (dtime));

    dtime *= speedMult;
    if (dtime > 0) {
        lines = [];
        runSimulation(dtime);
        hasUpdated = true;
    }
    else return;
}

function SendLeaderboard() {
    postMessage(["boardData", DataGroupInstances["organism"]])
}

function SendAvgUps() {
    postMessage(["avgUps", avgUps]);
}


function runSimulation(dtime) {

    if (foodQuadTreeDirty) {
        foodQuadTree.clear();
        foodQuadTreeDirty = false;
        for (var i in DataGroupInstances["circle"]) {
            foodQuadTree.insert(DataGroupInstances["circle"][i].GetPosition(), DataGroupInstances["circle"][i]);
        }
    }
    organismQuadTree.clear();
    while (Organism.count() < minOrganisms) {
        var x = randomValue(-spawnRange, spawnRange);
        var y = randomValue(-spawnRange, spawnRange);

        new Organism([x, y]);
    }

    for (var i in DataGroupInstances["organism"]) {
        organismQuadTree.insert(DataGroupInstances["organism"][i].GetPosition(), DataGroupInstances["organism"][i]);
    }
    for (var key in DataGroups) {
        var groupInstances = DataGroupInstances[key]
        if (groupInstances.length == 0 || groupInstances[0].Update === undefined) {
            continue;
        }
        for (var j = groupInstances.length - 1; j >= 0; --j) {
            var instance = groupInstances[j];
            if (instance.Update !== undefined) {
                instance.Update(dtime);
            }
        }
    }
}

self.addEventListener('message', function (e) {
    if (e.data[0] == "buffer") {
        sharedObjectData = e.data
        console.log(e.data)
        return;
    }
    if (e.data[0] == "init") {
        console.log(spawnRange, e.data[1].range);
        spawnRange = e.data[1].range;

        if (typeof importScripts == "function") {
            importScripts("quadtree.js", "GameInstance.js", "brain.js", "https://cdnjs.cloudflare.com/ajax/libs/mathjs/4.1.2/math.min.js");
        }
        foodQuadTree = new Quad(new Rectangle(-spawnRange * 1.5, -spawnRange * 1.5, spawnRange * 3, spawnRange * 3), 100);
        organismQuadTree = new Quad(new Rectangle(-spawnRange * 1.5, -spawnRange * 1.5, spawnRange * 3, spawnRange * 3), 100);
        for (var i = e.data[1].nrOfFood; i > 0; --i) {
            var x = randomValue(-spawnRange, spawnRange);
            var y = randomValue(-spawnRange, spawnRange);
            var food = new Food([x, y]);
            foodQuadTree.insert(food.GetPosition(), food);
        }
        speedMult = e.data[1].speedup;
        minOrganisms = e.data[1].nrOfOrganisms;
        setInterval(SendLeaderboard, 1000);
        setInterval(SendAvgUps, 100);
        setInterval(Run, 1000 / UpdatesPerSecond)
    }
    else if (e.data[0] == "speedup") {
        speedMult = e.data[1];
    }
    else if (e.data[0] == "minOrganisms") {
        minOrganisms = e.data[1];
    }
    else if (e.data[0] == "debugLines") {
        debugLines = e.data[1];
    }

    else if (e.data[0] == "doclick") {
        var query = new Query(organismQuadTree, new Sphere(e.data[1][0], e.data[1][1], 5));
        selectedObject = query.next();
        console.log(selectedObject);

        postMessage(["newSelection", selectedObject]);
    }
    else if (e.data[0] == "selectOrganism") {
        for (var i = 0; i < DataGroupInstances["organism"].length; ++i) {
            if (DataGroupInstances["organism"][i].__id == e.data[1]) {
                selectedObject = DataGroupInstances["organism"][i];
                return;
            }
        }

    }
    else if (e.data[0] == "newFrame") {
        if (hasUpdated) {
            hasUpdated = false;
            postMessage(["RenderData", DataGroups, lines, avgUps]);
        }
    }
    else {
        postMessage(e);
    }
})
