import React, { Component } from 'react';

class GameOutcome extends Component {

	printClassName() {
		return 'gameoutcome' + ' ' + this.props.gameOutcome;
	}

	message() {
		if (this.props.gameOutcome !== null) {
			if (this.props.gameOutcome === 'won') {
				return <h3>You are a winner!</h3>;
			}
			if (this.props.gameOutcome === 'lost') {
				return <h3>You lost!</h3>;
			}
		}
	}
  
	render() {

		return (
 			<div className={this.printClassName()}>
 				{this.message()}
 				<button onClick={this.props.resetGame} className="new_game">New Game</button>
 			</div>
  		)
	}

}

export default GameOutcome;