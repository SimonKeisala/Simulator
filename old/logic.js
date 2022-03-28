var worker = null;
var sharedObjectData = null;
function InitLogic() {
    "use strict";
    if (window.Worker) {
        worker = new Worker("worker/main.js");
        worker.onmessage = logicResponse;
    }
    sharedObjectData = new SharedArrayBuffer(1024);
    send(["buffer", sharedObjectData])
    send(["init", { nrOfFood: nrOfFood, nrOfOrganisms: nrOfOrganisms, speedup: speedup, range: range }]);
}


function send(data) {
    if (worker != null) {
        worker.postMessage(data);
    }
}

