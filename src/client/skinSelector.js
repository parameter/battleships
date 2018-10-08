import React, { Component } from 'react';
import _ from 'underscore';

class SkinSelector extends Component {

	renderSkins() {		
		return this.props.skins.map(function(item, i) {
			return <option value={item.name} key={i}>{item.name}</option>
		});
	}

	onChange = (event) => {
		this.props.skinChange(event.target);
	}

	render() {

		return(
			<div className="skinselector">
				<select value={this.props.currentSkin} onChange={this.onChange}>
	              	{this.renderSkins()}
	          	</select>
          	</div>
			
		);
	}
}

export default SkinSelector;