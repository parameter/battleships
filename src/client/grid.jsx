import React, { Component } from 'react';
import _ from 'underscore';
import './App.css';

const cols = 10;
const rows = 10;

class Grid extends Component {
    constructor(props) {
        super(props);
    }

    printGrid() {

        var grid = [];
        for (var i = 0; i < rows; i++) {
            var row = [];
            for (var j = 0; j < cols; j++) {
                var status = this.cellStatus(j, i);
                row.push(
                    <Cell key={"col_"+j} x={j} y={i} 
                    status={status.status} 
                    bomb={this.props.bomb} 
                    bombResult={this.props.bombResult} 
                    boatIndex={status.boatindex} />
                );
            }
            grid.push(<tr key={"row_"+i}>{row}</tr>);
        }
        return grid;
    }

    cellStatus(x, y) {
        if (this.props.id === "player") {
            for (var i = 0; i < this.props.ships.length; i++) {
                for (var j = 0; j < this.props.ships[i].length; j++) {
                    if (this.props.ships[i][j].x === x && this.props.ships[i][j].y === y) {
                        return {status:'ship',boatindex:this.props.ships[i].length};
                    }
                }
            }
            return {status:'empty',boatindex:null};
        }
        if (this.props.id === "enemy") {
            return {status:this.findBombAndStatus(x, y, this.props.socketId),boatindex:''};
        }
    }

    findBombAndStatus(x,y,socketId) {
        //console.log('GRID',x,y,this.props.bombs);
        var _bomb = _.find(this.props.bombs, function(bomb) { return bomb.x === x && bomb.y === y && bomb.socketId === socketId});
        return typeof _bomb !== 'undefined' ? _bomb.result : '';
    }

    render() {

        if (this.props.id === 'enemy') {
            var turnClass = (this.props.turn == true ? 'my_turn' : '');
        } else {
            var turnClass = '';
        }

        return (
            <table className="grid">
            <tbody className={this.props.id + ' ' + turnClass}>{this.printGrid()}</tbody>
            </table>
        );
    }
}

class Cell extends Component {

    constructor() {
        super()

        this.state = {
            bomb: null
        }
    }

    bomb = () => (event) => {
        // console.log(this.props.bombResult);
        // this.setState({bomb: this.props.bombResult});
        // console.log(this.state.bomb);

        this.props.bomb(this.props.x, this.props.y);

        // return this.setState({bomb: "miss"});

        // if (this.props.status === "ship") {
        //     this.setState({bomb: "hit"});
        // } else {
        //     this.setState({bomb: "miss"});
        //     this.props.emitBomb();
        //     console.log(this.props);

        // }   
    }

    boatIndex() {
        return this.props.boatIndex === null ? '' : this.props.boatIndex;
    }

    render() {

        return (
            <td onClick={this.bomb()} className={this.props.status}>{this.boatIndex()}</td>
        );
    }
}

export default Grid;