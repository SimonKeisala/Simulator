import React, { Component } from "react";
import { round, max } from "mathjs"
import "./Menu.css"

function getNewSpeed(current, delta) {
    if (delta > 0) {
        current = (current * 1.1) + delta;
    }
    else {
        current = (current + delta) / 1.1;
    }
    current = round(current);
    if (current < 0) current = 0;
    return current;
}

class Menu extends Component {
    state = {
        rendering: {
            rays: false,
            scene: true
        },
        simulationSpeed: 1,
        minOrganisms: 1,
    }
    updateRenderRays() {
        let state = this.state
        state.rendering.rays = !state.rendering.rays;
        this.setState(state, this.props.callback(this.state));
    }
    updateRenderScene() {
        let state = this.state
        state.rendering.scene = !state.rendering.scene;
        this.setState(state, this.props.callback(this.state));
    }
    updateRenderScene() {
        let state = this.state
        state.rendering.scene = !state.rendering.scene;
        this.setState(state, this.props.callback(this.state));
    }
    updateSimulationSpeed(change) {
        let state = this.state
        state.simulationSpeed = getNewSpeed(state.simulationSpeed, change);
        this.setState(state, this.props.callback(this.state));
    }
    updateMinOrganisms(change) {
        let state = this.state
        state.minOrganisms = max(0, state.minOrganisms + change);
        this.setState(state, this.props.callback(this.state));
    }
    render() {
        return (
            <>
                <menu>
                    <button className={this.state.rendering.rays ? "on" : "off"}
                        onClick={() => this.updateRenderRays()}>Toggle Rays </button>
                    <button className={this.state.rendering.scene ? "on" : "off"}
                        onClick={() => this.updateRenderScene()}>Scene Rendering</button>
                    < div >
                        <button onClick={() => this.updateSimulationSpeed(1)}> +</button >
                        <button onClick={() => this.updateSimulationSpeed(-1)}>-</button>
                        <br />
                        <label>speed: {this.state.simulationSpeed}</label>
                    </div >
                    <div>
                        <button onClick={() => this.updateMinOrganisms(+5)}>+5</button>
                        <button onClick={() => this.updateMinOrganisms(-5)}>-5</button>
                        <br />
                        <label>min organisms: {this.state.minOrganisms}</label>
                    </div >
                </menu >
            </>
        )
    }
}

export default Menu;