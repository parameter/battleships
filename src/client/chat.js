import React, { Component } from 'react';
import _ from 'underscore';

class Chat extends Component {

	sendMessage = (event) => {
		event.preventDefault();
		this.props.sendChatMessage(event.target.message.value);
		event.target.message.value = '';
	}

	printMessages() {

		return _.map(this.props.messages, function(item,i) {
			return <li className={item.who}>
					   <div className="username">{item.userName}</div>
					   <div className="message">{item.message}</div>
				   </li>
		});
	}
	
	render() {

		console.log(this.props.messages,this.props.messages.length);

		return (
			<div className="chat">
				<ul className="chat">
					{this.printMessages()}
				</ul>
				<form onSubmit={this.sendMessage}>
					<input type="text" name="message" />
					<button type="submit">Send</button>
				</form>
			</div>
		)
	}

}

export default Chat;
