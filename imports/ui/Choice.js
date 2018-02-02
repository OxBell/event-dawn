import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import moment from 'moment';
import shortid from 'shortid';
import Button from 'material-ui/Button/Button';

export default class Choice extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            alreadyVote: !!this.props.choice.votes.find((vote) => {
                return vote.userId === Meteor.userId();
            }),
            error: '',
        };
    }

    addVote() {
        console.log(this.state.alreadyVote);
        if(!this.state.alreadyVote) {
            this.props.choice.votes.push({
                _id: shortid.generate(),
                userId: Meteor.userId()
            });
            Meteor.call('polls.updateChoice', this.props.poll, this.props.choice, (err, res) => {
                if (!err) {
                    console.log('success', res);
                } else {
                    console.log('error', err);
                }
            });
            this.setState({ alreadyVote: true });
        } else {
            this.setState({ error: 'You already vote for this choice' });
        }
        
    }

    renderVotes() {
        console.log(this.props.choice.votes);
        return this.props.choice.votes.map((vote) => {
            return (
                <p key={vote._id}>{vote.userId}</p>
            );
        });
    }

    render() {
        return (
            <div>
                <div>
                    <h4>{this.props.choice.name}</h4>
                    <p>Début : {moment(this.props.choice.startDate).format('D/M/Y HH:mm')} h</p>
                    <p>Fin : {moment(this.props.choice.endDate).format('D/M/Y HH:mm')} h</p>
                    <p>Lieu : {this.props.choice.place} - durée : {this.props.choice.duration} h</p>
                    {!this.state.alreadyVote ? <button onClick={this.addVote.bind(this)}>Voter</button> : undefined}
                    <p>{this.props.choice.votes.length} vote(s)</p>
                    {this.renderVotes()}
                </div>
            </div>
        );
    }

}

Choice.propTypes = {
    choice: PropTypes.object.isRequired
};