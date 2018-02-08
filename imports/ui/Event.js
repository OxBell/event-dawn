import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';
import Modal from "react-modal";
import { Roles } from 'meteor/alanning:roles';
import TextField from 'material-ui/TextField';
import shortid from 'shortid';
import { UserStatus } from 'meteor/mizzao:user-status';
import { Accounts } from 'meteor/accounts-base';

import { Events } from '../api/events';
import { Polls } from '../api/polls';

export default class Event extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            poll: null,
            choice: null,
            isOpen: false,
            userStatus: null,
            optionIsOpen: false,
            participants: null,
            participate: false,
            name: this.props.event.name,
            place: this.props.event.place,
            startDate: this.props.event.startDate,
            endDate: this.props.event.endDate,
            labelOption:'',
            option: '',
            error: '',
            errorModal: '',
            errorModalOption: '',
            status: '',
        };
    }

    componentWillMount() {
        Modal.setAppElement('body');
        
    }

    componentDidMount() {
        this.eventsTracker = Tracker.autorun(() => {
            Meteor.subscribe('events');
            Meteor.subscribe('polls');
            Meteor.subscribe('userStatus');
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

    addParticipant() {
        if(this.props.event && !this.state.participate) {
            Meteor.call('events.addParticipant', this.props.event._id, Meteor.user().username, (err, res) => {
                if(err){
                    this.setState({error : err.message});
                } else {
                    this.setState({ participate: true });
                }
            });
        } else {
            this.setState({error : 'You\'re already in the party!'});
        }
    }

    handleModalOptionClose() {
        this.setState({
            optionIsOpen: false,
            labelOption: '',
            option: ''
        });
    }
    

    renderModalOption(option) {

        if(this.state.status=='add'){            
            option._id = shortid.generate();
        }

        onLabelOptionChange = (e) => {
            this.setState({ labelOption: e.target.value });            
        }

        onOptionChange = (e) => {
            this.setState({ option: e.target.value });
        }

        onSubmitOption = (e) => {
            e.preventDefault();
            if(this.state.labelOption != '' && this.state.option != ''){
                idOption = option._id;
                label = this.state.labelOption;
                value = this.state.option;
                if(this.state.status == 'edit'){
                    Meteor.call('events.updateOption', this.props.event._id, {_id :idOption, label, value}, (err, res) => {
                        if(err) {
                            this.setState({errorModalOption: err.message});
                        } else {
                            this.setState({optionIsOpen: false});
                        }
                    });
                } else {
                    Meteor.call('events.addOption', this.props.event._id, {_id :idOption, label, value}, (err, res) => {
                        if(err) {
                            this.setState({errorModalOption: err.message});
                        } else {
                            this.setState({optionIsOpen: false});
                        }
                    });
                }
            } else {
                this.setState({errorModalOption: 'Options must be enter!'});
            }
        }

        return (
            <Modal
                isOpen={this.state.optionIsOpen} 
                contentLabel="Edit Option"
                onAfterOpen={() => this.refs['label-'+option._id].focus()}
                onRequestClose={this.handleModalOptionClose.bind(this)}
                className="boxed-view__box"
                overlayClassName="boxed-view boxed-view--modal">
                {this.state.errorModalOption}
                {this.state.status == 'edit' ? <h1>Edit Option</h1> : <h1>Add Option</h1>}
                <form onSubmit={onSubmitOption.bind(this)} className="boxed-view__form">
                    <input type="text" value={this.state.labelOption} onChange={onLabelOptionChange.bind(this)} ref={"label-"+option._id} placeholder="Option Label"/>
                    <input type="text" value={this.state.option} onChange={onOptionChange.bind(this)} ref={option._id} placeholder="Option"/>
                    {this.state.status == 'edit' ? <button className='button'>Edit Option</button> : <button className='button'>Add Option</button>}
                    <button type="button" className="button button--secondary" onClick={this.handleModalOptionClose.bind(this)}>Cancel</button>
                </form>
            </Modal>
        );
    }

    editOption(option){
        this.setState({labelOption: option.label, option: option.value });  
        this.setState({optionIsOpen: true, status: 'edit'});
    }

    addOption(option) {
        this.setState({optionIsOpen: true, status:'add'});    
    }

    deleteOption(option) {
        Meteor.call('events.removeOption', this.props.event._id, option, (err, res) => {
            if (err) {
                this.setState({error : err.message});
            }
        });
    }

    renderParticipants() {
        return this.props.event.users.map((user) => {
            return <p key={user}>{user}</p>
        });
    }

    renderOptions() {
        const options = this.props.event.options;
        return options.map((option) => {
            return (
                <div key={option._id}>
                    <p>{option.label} : {option.value}</p>
                    {this.props.event && Roles.userIsInRole(Meteor.userId(), ['admin']) ? <button onClick={this.editOption.bind(this, option)}>Edit</button> : undefined}
                    {this.props.event && Roles.userIsInRole(Meteor.userId(), ['admin']) ? <button onClick={this.deleteOption.bind(this, option)}>X</button> : undefined}
                    {this.state.status == 'edit' ? this.renderModalOption(option) : undefined}
                </div>
            );
        });
    }

    renderEvent() {
        return (
            <div>
                <h1>{this.props.event.name} - manager : {this.props.event.username}</h1>
                <p>Place : {this.props.event.place}</p>
                <p>Start at {moment(this.props.event.startDate).format('D/M/Y HH:mm')}h, end at {moment(this.props.event.endDate).format('D/M/Y HH:mm')}h ({this.props.event.duration}h)</p>
                {this.props.event && Roles.userIsInRole(Meteor.userId(), ['admin']) ? <button onClick={this.addOption.bind(this)}>Add option</button> : undefined}
                {this.state.status == 'add' ? this.renderModalOption({_id: '', label: '', value: ''}) : undefined}
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
                    this.setState({ error: err.message });
                } else {
                    this.handleModalClose();
                }
            });
        }
    
        onSubmit = (e) => {
            e.preventDefault();

            let errMod = false;

            const { name, place, options } = this.state;
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
                    {this.state.errorModal ? <p>{this.state.errorModal}</p> : undefined}
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
                                value={this.state.place}
                            />

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