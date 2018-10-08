import React, { Component } from 'react';
import Signup from './auth/signup.jsx';
import SignIn from './auth/signin.jsx';

class Start extends Component {

  register() {

  }
  
  render() {

    return (
      <div className="usernameholder">

        <SignIn setUser={this.props.setUser} setupSockets={this.props.setupSockets} />
        <Signup />

      </div>
      )
  }

}

export default Start;