import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import render from './rendering/render';
import shader from './rendering/shaders/vertexShader';

var mock_data = {
  organism: {
    positions: [0, 0, 50, 50, 100, 100],
    scales: [10.0, 10, 15],
    colors: [1.0, 0.0, 1.0, 1, 1, 1, 1, 1, 0],
    rotations: [0.0, 1, -1]
  }
}
var camera = [0, 0]
function logic() {
  mock_data.organism.positions[0] += 1;
  camera[0] += 1
  render.Render(mock_data, null, 1, camera);
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <canvas id="myCanvas"></canvas>
      </div>
    );
  }
  componentDidMount() {
    render.Init();
    setInterval(logic, 10);
  }
}

export default App;