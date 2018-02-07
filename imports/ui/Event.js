import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
import Modal from "react-modal";
import { Roles } from 'meteor/alanning:roles';
import TextField from 'material-ui/TextField';

import { Events } from '../api/events';
import { Polls } from '../api/polls';

export default class Event extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            poll: null,
            choice: null,
            isOpen: false,
            participants: null,
            participate: false,
            name: this.props.event.name,
            place: this.props.event.place,
            startDate: this.props.event.startDate,
            endDate: this.props.event.endDate,
            error: ''
        };
    }

    componentWillMount() {
        Modal.setAppElement('body');
        
    }

    componentDidMount() {
        this.eventsTracker = Tracker.autorun(() => {
            Meteor.subscribe('events');
            Meteor.subscribe('polls');
            if(this.props.event) {
                if(this.props.event.users.indexOf(Meteor.user().username) != -1) {
                    this.setState({ participate: true });
                } else {
                    this.setState({ participate: false });
                }
            }
        });
    }

    componentWillUnmount() {
        this.eventsTracker.stop();
    }

    genereEvent() {
        if(this.props.event) {
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
                            this.setState({ participants });
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

    addParticipant() {
        if(this.props.event && !this.state.participate) {
            Meteor.call('events.addParticipant', this.props.event._id, Meteor.user().username, (err, res) => {
                if(err){
                    this.setState({error : err.error});
                } else {
                    this.setState({ participate: true });
                }
            });
        } else {
            this.setState({error : 'You\'re already in the party!'});
        }
    }

    renderParticipants() {
        return this.props.event.users.map((user) => {
            return <p key={user}>{user}</p>
        });
    }

    renderOptions() {
        return this.props.event.options.map((option) => {
            return (
                <p key={option._id}>{option.label} : {option.value}</p>
            );
        });
    }

    renderEvent() {
        return (
            <div>
                <h1>{this.props.event.name} - manager : {this.props.event.username}</h1>
                <p>Place : {this.props.event.place}</p>
                <p>Start at {moment(this.props.event.startDate).format('D/M/Y HH:mm')}h, end at {moment(this.props.event.endDate).format('D/M/Y HH:mm')}h ({this.props.event.duration}h)</p>
                {this.props.event.options && this.props.event.options.length > 0 ? this.renderOptions() : undefined}
                {this.renderParticipants()}
            </div>
        );
    }

    handleModalClose() {
        this.setState({
            isOpen: false,
        });
    }

    renderEditEvent() {

        onNameChange = (e) => {
            this.setState({
                name: e.target.value
            });
        }
    
        onPlaceChange = (e) => {
            this.setState({
                place: e.target.value
            });
        }
    
        onStartDateChange= (e) => {
            this.setState({
                startDate: e.target.value
            });
        }
    
        onEndDateChange = (e) => {
            this.setState({
                endDate: e.target.value
            });
        }

        updateEvent = (name, place, startDate, endDate, duration) => {
            Meteor.call('events.update', this.props.event._id, name, place, startDate, endDate, duration, (err, res) => {
                if(err) {
                    this.setState({ error: err.error });
                } else {
                    this.handleModalClose();
                }
            });
        }
    
        onSubmit = (e) => {
            e.preventDefault();
            console.log('on submit edit event');

            const { name, place } = this.state;
            const startDate = new Date(this.state.startDate).getTime();
            const endDate = new Date(this.state.endDate).getTime();
            const duration = moment(endDate).diff(startDate, 'hours');

            if(this.props.event) {
                updateEvent(name, place, startDate, endDate, duration);
            } else {
                this.setState({error: 'No event to edit!'});
            }
        }

        return(
            <div>
                <Modal
                    isOpen={this.state.isOpen} 
                    contentLabel="Add link"
                    onAfterOpen={() => this.refs.name.focus()}
                    onRequestClose={this.handleModalClose.bind(this)}
                    className="boxed-view__box"
                    overlayClassName="boxed-view boxed-view--modal">
                    <h1>Edit Event</h1>
                    {this.state.error ? <p>{this.state.error}</p> : undefined}
                    <form onSubmit={onSubmit.bind(this)} className="boxed-view__form">
                        <input
                            type="text"
                            ref='name'
                            placeholder="Name"
                            onChange={onNameChange.bind(this)} 
                            value={this.state.name}
                        />
 
                            <TextField
                                id="datetime-local-start"
                                label="Start Date"
                                value={moment(this.state.startDate).format('Y-MM-DDTHH:mm')}
                                onChange={onStartDateChange.bind(this)}
                                type="datetime-local"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                id="datetime-local-end"
                                label='End Date' 
                                value={moment(this.state.endDate).format('Y-MM-DDTHH:mm')} 
                                onChange={onEndDateChange.bind(this)}
                                type="datetime-local"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <input
                            type="text"
                            ref='place'
                            placeholder="Place"
                            onChange={onPlaceChange.bind(this)} 
                            value={this.state.place}/>

                        <button className='button'>Edit Event</button>
                        <button type="button" className="button button--secondary" onClick={this.handleModalClose.bind(this)}>Cancel</button>
                    </form>
                </Modal>
            </div>
        );
    }

    render() {
        return(
            <div>
                {this.state.error ? <p>{this.state.error}</p> : undefined}
                {this.props.event ? this.renderEvent() : undefined}
                {this.props.event && !this.state.participate ? <button onClick={this.addParticipant.bind(this)}>Participate</button> : undefined}
                {this.props.event && Roles.userIsInRole(Meteor.userId(), ['admin']) ? <button onClick={() => this.setState({isOpen: true})}>Edit Event</button> : undefined}
                {this.renderEditEvent()}
            </div>
        );
    }
}