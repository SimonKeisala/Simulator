var worker = null;
function InitLogic() {
    "use strict";
    if (window.Worker) {
        worker = new Worker("worker/main.js");
        worker.onmessage = logicResponse;
    }
    send(["init", { nrOfFood: nrOfFood, nrOfOrganisms: nrOfOrganisms, speedup: speedup, range: range }]);
}


function send(data) {
    if (worker != null) {
        worker.postMessage(data);
    }
}

