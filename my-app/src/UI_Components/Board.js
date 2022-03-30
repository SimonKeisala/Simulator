import { floor } from "mathjs";
import React, { Component } from "react"
import "./Board.css"

class Board extends Component {
    state = { items: [] }
    render() {
        const items = this.state.items.map((item, index) =>
            <p key={"board_item_" + index.toString()}
                style={{ background: item.selected ? "greenyellow" : "lightgray" }}
                onClick={() => this.props.object_callback(item)}>
                <span >#{index}</span>
                M: {item.familyMembers[0]},
                D: {floor(item.duration)},
                E: {floor(item.__energy)}</p >
        );
        return (
            <div id="board" >
                {items}
            </div >
        );
    }
    setList(list) {
        this.setState({ items: list });
    }
}

export default Board;