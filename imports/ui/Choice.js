import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import moment from 'moment';
import shortid from 'shortid';
import Button from 'material-ui/Button/Button';
import { Roles } from 'meteor/alanning:roles';

export default class Choice extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            alreadyVote: !!this.props.choice.votes.find((vote) => {
                return vote.username === Meteor.user().username;
            }),
            error: '',
            updated: false
        };
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.poll.extend && !this.state.updated) {
            this.setState({alreadyVote: !!this.props.choice.votes.find((vote) => {
                return vote.username === Meteor.user().username;
            }), updated: true});
        }
    }

    removeChoice() {
        this.props.poll.choices.forEach((choice, i) => {
            if(choice._id === this.props.choice._id) {
                console.log(choice, i);
                this.props.poll.choices.splice(i,1);
            }
        });
        Meteor.call('polls.updateChoices', this.props.poll._id, this.props.poll.choices, (err, res) => {
            if (err) {
                this.setState({error : err.error});
            }
        });
    }


    checkVote() {
        let voted = false;
        if(this.props.poll.extend){
            this.props.poll.choices.forEach((choice) => {
                if(choice.votes.find((vote) => { return vote.username === Meteor.user().username; })) {
                    this.setState({ error: 'You can vote for only one choice!' });
                    voted = true;
                    setTimeout(() => this.setState({ error: '' }), 1000);
                }
            });
        } else {
            this.addVote();
        }
        
        if(this.props.poll.extend && !voted) {
            this.addVote();
        }
    }

    removeVote() {
        if(this.state.alreadyVote) {
            this.props.choice.votes.forEach((elem, i) => {
                if(elem.username === Meteor.user().username){
                    this.props.choice.votes.splice(i,1);
                }
            });
            Meteor.call('polls.updateChoice', this.props.poll._id, this.props.choice, (err, res) => {
                if (!err) {
                    this.setState({ alreadyVote: false, error:'' });
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
                username: Meteor.user().username
            });
            Meteor.call('polls.updateChoice', this.props.poll._id, this.props.choice, (err, res) => {
                if (!err) {
                    this.setState({ alreadyVote: true, error: '' });
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
                <p key={vote._id}>{vote.username}</p>
            );
        });
    }

    renderOptions() {
        return this.props.choice.options.map((option) => {
            return (
                <p key={option._id}>{option.label} : {option.value}</p>
            );
        });
    }

    render() {
        return (
            <div>
                <div>
                    <h4>{this.props.choice.name} by {this.props.choice.username}</h4>
                    <p>Start at : {moment(this.props.choice.startDate).format('D/M/Y HH:mm')} h</p>
                    <p>End at : {moment(this.props.choice.endDate).format('D/M/Y HH:mm')} h</p>
                    <p>Place : {this.props.choice.place} - duration : {this.props.choice.duration} h</p>
                    {this.props.choice.options && this.props.choice.options.length > 0 ? this.renderOptions() : undefined}
                    {this.state.error ? <p>{this.state.error}</p> : undefined}
                    {!this.state.alreadyVote ? <button onClick={this.checkVote.bind(this)}>Vote</button> : <button onClick={this.removeVote.bind(this)}>Remove vote</button>}
                    {Roles.userIsInRole(Meteor.userId(), ['admin']) ? <button onClick={this.removeChoice.bind(this)}>Remove Choice</button> : undefined}
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