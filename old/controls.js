function keydown(e) {
    console.log(e)
    e = e || window.event;
    if (e.keyCode == '38' || e.key == 'w') {
        // up arrow
        cameraPos[1] += 3;
    }
    else if (e.keyCode == '40' || e.key == 's') {
        // down arrow
        cameraPos[1] -= 3;
    }
    else if (e.keyCode == '37' || e.key == 'a') {
        // left arrow
        cameraPos[0] -= 3;
    }
    else if (e.keyCode == '39' || e.key == 'd') {
        // right arrow
        cameraPos[0] += 3;
    }
}

function mousewheel(e) {
    if (e.target.id != "myCanvas") return;
    var dx = e.clientX - gl.canvas.clientWidth / 2;
    var dy = gl.canvas.clientHeight / 2 - e.clientY;

    var dz = 0;
    if (e.detail) {
        var dz = -e.detail / 250;
    } else {
        var dz = -e.deltaY / 250;
    }
    var newZoom = Math.max(0.1, Math.min(300, zoom * (1 + dz)));

    var factor = newZoom / zoom - 1;
    zoom = newZoom;

    cameraPos[0] += dx / zoom * factor;
    cameraPos[1] += dy / zoom * factor;
}

function dodrag(dx, dy) {
    cameraPos[0] -= dx / zoom;
    cameraPos[1] += dy / zoom;
}

function doclick(x, y) {
    var dx = x - gl.canvas.clientWidth / 2;
    var dy = gl.canvas.clientHeight / 2 - y;
    worker.postMessage(["doclick", [dx / zoom + cameraPos[0], dy / zoom + cameraPos[1]]]);
}

var touch_x_down = {};
var touch_y_down = {};
var touch_x_last = {};
var touch_y_last = {};
function touchstart(e) {
    console.log("start", e);
    for (var i = 0; i < e.changedTouches.length; ++i) {
        touch_x_down[e.changedTouches[i].identifier] = e.changedTouches[i].clientX;
        touch_y_down[e.changedTouches[i].identifier] = e.changedTouches[i].clientY;
        touch_x_last[e.changedTouches[i].identifier] = e.changedTouches[i].clientX;
        touch_y_last[e.changedTouches[i].identifier] = e.changedTouches[i].clientY;
    }
}

function touchend(e) {
    console.log("end", e);
    for (var i = 0; i < e.changedTouches.length; ++i) {
        if (touch_x_down[e.changedTouches[i].identifier] == e.changedTouches[0].clientX
            && touch_x_down[e.changedTouches[i].identifier] == e.changedTouches[0].clientY) {
            doclick(e);
        }
    }
}

function touchmove(e) {
    console.log("move", e);
    for (var i = 0; i < e.changedTouches.length; ++i) {
        var dx = e.changedTouches[0].clientX - touch_x_last[e.changedTouches[i].identifier];
        var dy = e.changedTouches[0].clientY - touch_y_last[e.changedTouches[i].identifier];
        dodrag(dx, dy);
        touch_x_last[e.changedTouches[i].identifier] = e.changedTouches[i].clientX;
        touch_y_last[e.changedTouches[i].identifier] = e.changedTouches[i].clientY;
    }
}

window.ontouchstart = touchstart;
window.ontouchend = touchend;
window.ontouchmove = touchmove;




var mouse_state = 0;
var mouse_x_down = 0;
var mouse_y_down = 0;
var mouse_x_last = 0;
var mouse_y_last = 0;
function mousedown(e) {
    console.log(e)
    if (e.target.id != "myCanvas") return;
    mouse_state = 1;
    mouse_x_down = e.clientX;
    mouse_y_down = e.clientY;
}

function mouseup(e) {
    mouse_state = 0;
    if (e.target.id != "myCanvas") return;
    if (Math.abs(mouse_x_down - e.clientX) < 3 && Math.abs(mouse_y_down - e.clientY) < 3) {
        doclick(e.clientX, e.clientY);
    }
}

function mousemove(e) {
    if (mouse_state == 1) {
        dodrag(e.clientX - mouse_x_last, e.clientY - mouse_y_last);
    }
    mouse_x_last = e.clientX;
    mouse_y_last = e.clientY;
}

window.onkeydown = keydown;
window.onmousedown = mousedown;
window.onmouseup = mouseup;
window.onmousemove = mousemove;
window.addEventListener("KeyboardEvent", keydown);
window.addEventListener("DOMMouseScroll", mousewheel);
window.addEventListener("mousewheel", mousewheel);