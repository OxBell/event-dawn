import React from 'react';
import { Link } from 'react-router';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { UserStatus } from 'meteor/mizzao:user-status';

export default class Signup extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      error: '',
    };
  }

  onSubmit(e) {
    e.preventDefault();

    let email = this.refs.email.value.trim();
    let password = this.refs.password.value.trim();
    let username = this.refs.username.value.trim();

    if(password.length < 9){
      return this.setState({error: 'Password must be more than 8 characters long.'});
    }
    Accounts.createUser({email, password, username}, (err) => {
      if(err){
        this.setState({error: err.reason});
      } else {
        this.setState({error: ''});
        Meteor.call('users.addUserRole', (err, res) => {
          if(err){
            console.log('error', err);
            this.setState({error : err.message});
          }
        });
        // Meteor.call('users.addUserRoleAdmin', (err, res) => {
        //   if(err){
        //     console.log('error', err);
        //     this.setState({error : err.message});
        //   }
        // });
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
            <input type='text' ref='username' name='username' placeholder='Username'/>
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