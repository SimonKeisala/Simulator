import React, { Component } from 'react';
import Canvas from "./Canvas";
import './App.css';


class App extends Component {
  render() {
    return (
      <React.StrictMode>
        <div className="App">
          <Canvas />
          <span id="version">version 0.4.0</span>
        </div>
        <footer>
        </footer>
      </React.StrictMode>
    );
  }
}

export default App;