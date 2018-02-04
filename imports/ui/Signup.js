import React from 'react';
import { Link } from 'react-router';

import { Accounts } from 'meteor/accounts-base';

export default class Signup extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      error: ''
    };
  }

  onSubmit(e) {
    e.preventDefault();

    let email = this.refs.email.value.trim();
    let password = this.refs.password.value.trim();
    let nickname = this.refs.nickname.value.trim();

    let profile = { nickname };

    if(password.length < 9){
      return this.setState({error: 'Password must be more than 8 characters long.'});
    }

    Accounts.createUser({email, password, profile}, (err) => {
      if(err){
        this.setState({error: err.reason});
      } else {
        this.setState({error: ''});
        Meteor.call('users.addRole', Meteor.userId(), (err, res) => {
          if(err){
            this.setState({error : err.error});
          } else {
          }
        });
      }
    });
  }

  render() {
    return (
      <div className="boxed-view">
        <div className="boxed-view__box">
          <h1>Join</h1>

          {this.state.error ? <p>{this.state.error}</p> : undefined}

          <form onSubmit={this.onSubmit.bind(this)} noValidate className="boxed-view__form">
            <input type='text' ref='nickname' name='nickname' placeholder='Nickname'/>
            <input type='email' ref='email' name='email' placeholder='Email'/>
            <input type='password' ref='password' name='password' placeholder='password'/>
            <button className="button">Create Account</button>
          </form>
          <Link to="/">Already have a account?</Link>
        </div>
      </div>
    );
  }
}