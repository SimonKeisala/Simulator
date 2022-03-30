import React, { Component } from "react";
import { Init, mainCamera } from '../rendering/render';
import Run, { UpdateState, UpdateKeys } from '../simulator/logic';
import Menu from "./Menu";
import Board from "./Board";


class Canvas extends Component {
    canvasRef = React.createRef();
    boardRef = React.createRef();
    menuRef = React.createRef();
    mouseStates = new Set();
    keyStates = new Set();
    render() {
        return (
            <>
                <canvas ref={this.canvasRef} id="myCanvas"
                    onMouseDown={e => this.mouseDown(e)}
                    onMouseUp={e => this.mouseUp(e)}
                    onMouseMove={e => this.mouseMove(e)}
                    // Prevent opening drop down menu when right clicking on canvas
                    onContextMenu={e => e.preventDefault()}
                ></canvas>
                <div id="board">
                    <p> <span>uid</span> test</p>
                    <p> test </p>
                </div>
                <Menu ref={this.menuRef} callback={this.stateChange.bind(this)} />
                <Board ref={this.boardRef} object_callback={this.boardObjectClicked.bind(this)}></Board>
            </>
        )
    }

    mouseDown(e) {
        this.mouseStates.add(e.button);
        this.canvasRef.current.style.cursor = 'none';
    }

    mouseUp(e) {
        this.mouseStates.delete(e.button);
        this.canvasRef.current.style.cursor = this.canvasDefaultCursor;
    }

    mouseMove(e) {
        if (this.mouseStates.has(0)) {
            mainCamera.rotate(e.movementX, e.movementY);
        }
    }

    keyPress(e) {
        this.keyStates.add(e.key);
        UpdateKeys(this.keyStates);
    }

    keyRelease(e) {
        this.keyStates.delete(e.key);
        UpdateKeys(this.keyStates);
    }

    componentDidMount() {
        this.canvasDefaultCursor = this.canvasRef.current.style.cursor;
        UpdateState(this.menuRef.current.state)
        Init(this.canvasRef.current);
        Run(this.boardCallback.bind(this));
        document.addEventListener("keydown", this.keyPress.bind(this));
        document.addEventListener("keyup", this.keyRelease.bind(this));
    }
    stateChange(state) {
        UpdateState(state);
    }
    boardObjectClicked(obj) {
        obj.selected = !obj.selected;
    }

    boardCallback(list) {
        this.boardRef.current.setList(list);
    }
}

export default Canvas;