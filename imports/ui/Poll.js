import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';

import { Polls } from '../api/polls';
import Choice from './Choice';

export default class Poll extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            poll: null,
            error: ''
        };
    }

    componentDidMount() {
        this.pollsTracker = Tracker.autorun(() => {
            Meteor.subscribe('polls');
            const poll = Polls.findOne({
                state: 'current'
            });
            this.setState({ poll });
        });
    }

    componentWillUnmount() {
        this.pollsTracker.stop();
    }

    addPoll() {
        console.log('add poll function');

        Meteor.call('polls.insert', (err, res) => {
        if (!err) {
            console.log('success', res);
        } else {
            this.setState({error : err.error});
            console.log('error', err);
        }

        });
    }

    renderPoll() {
        if(!this.state.poll) {
            return (
                <div>
                    <p>No poll found. A true animals group...</p>
                </div>
            );
        }
        return (
            <div>
                <h2>Poll</h2>
                <p>Semaine {moment(this.state.poll.date).format('w')}</p>
            </div>
        );
    }

    renderChoices() {
        if(this.state.poll && this.state.poll.choices.length === 0) {
            return (
                <div>
                    <p>No choices found. A true animals group...</p>
                </div>
            );
        } else if (this.state.poll) {
            console.log(this.state.poll);
            return this.state.poll.choices.map((choice) => {
                return <Choice key={choice._id} choice={choice} poll={this.state.poll._id}/>;
            });
        }
    }

    render() {
        return(
            <div>
                {this.state.error ? <p>{this.state.error}</p> : undefined}
                <button className='button' onClick={() => this.addPoll()}>+ Add Poll</button>
                {this.renderPoll()}
                {this.renderChoices()}
            </div>
        );
    }
}