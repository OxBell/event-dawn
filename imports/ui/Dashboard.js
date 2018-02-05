import React from 'react';
import { Meteor } from 'meteor/meteor';

import PrivateHeader from './PrivateHeader';
import Poll from './Poll';

import { Polls } from '../api/polls';
import Event from './Event';
import { Events } from '../api/events';

export default class Dashboard extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      error: '',
      event: null
    };
  }

  componentDidMount() {
    this.eventsTracker = Tracker.autorun(() => {
        Meteor.subscribe('events');
        const event = Events.findOne({
            state: 'current'
        });
        this.setState({ event });
    });
  }

  componentWillUnmount() {
      this.eventsTracker.stop();
  }

  render() {
    return (
      <div>
        <PrivateHeader title='Dashboard'/>
        <div className="page-content">
          Dashboard page content.
          {this.state.event ? <Event event={this.state.event}/> : <Poll/>}
        </div>        
      </div>
    );
  }
}