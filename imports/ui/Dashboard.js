import React from 'react';
import { Meteor } from 'meteor/meteor';

import PrivateHeader from './PrivateHeader';
import Poll from './Poll';
import { Polls } from '../api/polls';

export default class Dashboard extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      error: '',
      polls: []
    };
  }

  render() {
    return (
      <div>
        <PrivateHeader title='Dashboard'/>
        <div className="page-content">
          Dashboard page content.
        </div>
        <Poll/>
      </div>
    );
  }
}