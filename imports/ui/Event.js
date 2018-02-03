import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';

import { Events } from '../api/events';
import { Polls } from '../api/polls';

export default class Event extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            poll: null,
            choice: null,
            participants: null,
            error: ''
        };
    }

    componentDidMount() {
        this.eventsTracker = Tracker.autorun(() => {
            Meteor.subscribe('events');
            const event = Events.findOne({
                state: 'current'
            });
            Meteor.subscribe('polls');
        });
    }

    componentWillUnmount() {
        this.eventsTracker.stop();
    }

    genereEvent() {
        if(event = Events.findOne({ state: 'current' })) {
            this.setState({ error: 'Already have an event!'} );
        } else {
            const choices = Polls.findOne({
                state: 'current'
            }).choices;
            Meteor.call('polls.getBestChoice', choices, (err, res) => {
                if(err) {
                    this.setState({error : err.error});
                } else {
                    const choice = res;
                    Meteor.call('polls.getParticipants', choice.votes, (err, res) => {
                        if(err) {
                            this.setState({error : err.error});
                        } else {
                            const participants = res;
                            Meteor.call('events.insert', choice, participants, (err, res) => {
                                if (!err) {
                                    const idPoll = Polls.findOne({
                                        state: 'current'
                                    })._id;
                                    Meteor.call('polls.finish', idPoll, (err, res) => {
                                        if (!err) {
                                        } else {
                                            this.setState({error : err.error});
                                        }
                                    });
                                } else {
                                    this.setState({error : err.error});
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    getUserNickname(_id) {
        Meteor.subscribe('singleUser', _id);
        if(Meteor.users.find({ _id }).fetch()[0]){
            return Meteor.users.find({ _id }, {
                fields: {
                    'createdAt': 0,
                    'services': 0,
                    'emails': 0,
                    'roles': 0
                }
            }).fetch()[0].profile.nickname;
        }
    }

    renderParticipants() {
        return this.props.event.users.map((user) => {
            return <p key={user}>{this.getUserNickname(user)}</p>
        });
    }

    renderEvent() {
        return (
            <div>
                <h1>{this.props.event.name} - manager : {this.getUserNickname(this.props.event.userId)}</h1>
                <p>Place : {this.props.event.place}</p>
                <p>Start at {moment(this.props.event.startDate).format('D/M/Y HH:mm')}h, end at {moment(this.props.event.endDate).format('D/M/Y HH:mm')}h ({this.props.event.duration}h)</p>
                {this.renderParticipants()}
            </div>
        );
    }

    render() {
        return(
            <div>
                {this.state.error ? <p>{this.state.error}</p> : undefined}
                <button className='button' onClick={() => this.genereEvent()}>+ Add Event</button> {/* TO DELETE WHEN EVENT AUTO GENERATE */}
                {this.props.event ? this.renderEvent() : undefined}
            </div>
        );
    }
}