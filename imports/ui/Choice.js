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

    getUserUsername(_id) {
        Meteor.subscribe('singleUser', _id);
        if(Meteor.users.find({ _id }).fetch()[0]){
            return Meteor.users.find({ _id }, {
                fields: {
                    'createdAt': 0,
                    'services': 0,
                    'emails': 0,
                    'roles': 0
                }
            }).fetch()[0].profile.username;
        }
    }

    removeVote() {
        if(this.state.alreadyVote) {
            this.props.choice.votes.forEach((elem, i) => {
                if(elem.userId === Meteor.userId()){
                    this.props.choice.votes.splice(i,1);
                }
            });
            Meteor.call('polls.updateChoice', this.props.poll, this.props.choice, (err, res) => {
                if (!err) {
                    this.setState({ alreadyVote: false });
                } else {
                    this.setState({error : err.error});
                }
            });
        } else {
            this.setState({ error: 'You haven\'t vote for this choice' });
        }
    }

    addVote() {
        if(!this.state.alreadyVote) {
            this.props.choice.votes.push({
                _id: shortid.generate(),
                userId: Meteor.userId()
            });
            Meteor.call('polls.updateChoice', this.props.poll, this.props.choice, (err, res) => {
                if (!err) {
                    this.setState({ alreadyVote: true });
                } else {
                    this.setState({error : err.error});
                }
            });
        } else {
            this.setState({ error: 'You already vote for this choice' });
        }
    }

    renderVotes() {
        return this.props.choice.votes.map((vote) => {
            return (
                <p key={vote._id}>{this.getUserUsername(vote.userId)}</p>
            );
        });
    }

    render() {
        return (
            <div>
                <div>
                    <h4>{this.props.choice.name} by {this.getUserUsername(this.props.choice.userId)}</h4>
                    <p>Début : {moment(this.props.choice.startDate).format('D/M/Y HH:mm')} h</p>
                    <p>Fin : {moment(this.props.choice.endDate).format('D/M/Y HH:mm')} h</p>
                    <p>Lieu : {this.props.choice.place} - durée : {this.props.choice.duration} h</p>
                    {!this.state.alreadyVote ? <button onClick={this.addVote.bind(this)}>Voter</button> : <button onClick={this.removeVote.bind(this)}>Retirer vote</button>}
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