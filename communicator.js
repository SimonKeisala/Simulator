function changeSpeed(amount) {
    if (amount > 0) {
        speedup = (speedup * 1.1) +amount;
    }
    else {
        speedup = (speedup + amount)/1.1;
    }
    speedup = Math.round(speedup);
    if (speedup < 0) speedup = 0;
    document.getElementById("speedMult").innerHTML = "speed: " + speedup.toString();
    send(["speedup", speedup])
}

function changeMinOrganisms(amount) {
    nrOfOrganisms += amount;
    if (nrOfOrganisms < 0) nrOfOrganisms = 0;
    document.getElementById("nrOfOrganisms").innerHTML = "min organisms: " + nrOfOrganisms.toString();
    send(["minOrganisms", nrOfOrganisms])
}

function toggleRays() {
    debugLines = !debugLines;
    send(["debugLines", debugLines]);
}

function toggleRender() {
    rendering = !rendering;
}

function logicResponse(e) {
    if (e.data[0] == "RenderData")
    {
        RenderData = e.data[1];
        lines = e.data[2];
        avgUps = e.data[3];
    }
    else if (e.data[0] == "boardData") {
        updateBoard(e.data[1]);
    }
    else if (e.data[0] == "avgUps")
        avgUps = e.data[1];
    else {
        console.log(e);
    }

}