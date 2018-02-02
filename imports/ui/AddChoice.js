import React from 'react';
import { Meteor } from 'meteor/meteor';
import Modal from "react-modal";
import shortid from 'shortid';
import { Polls } from '../api/polls';
import TextField from 'material-ui/TextField';
import moment from 'moment';

export default class AddChoice extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isOpen: false,
            error: '',
            name: '',
            place: '',
            startDate: '',
            endDate: ''
        };
    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    onSubmit(e) {

        e.preventDefault();

        const { name, place } = this.state; // const name = this.state.name, const duration = this.state.duration, const place = this.state.place
        const startDate = new Date(this.state.startDate).getTime();
        const endDate = new Date(this.state.endDate).getTime();
        const choice =  {
            _id: shortid.generate(),
            name,
            duration: moment(endDate).diff(startDate, 'hours'),
            place,
            startDate,
            endDate,
            userId: Meteor.userId(),
            votes: null
        }
        
        const poll_id = Polls.findOne({
            state: 'current'
        })._id;

        Meteor.call('polls.addChoice', poll_id, choice, (err, res) => {
            if (!err) {
                this.handleModalClose();
            } else {
                this.setState({error: err.reason });
            }

        });
    }

    onNameChange(e) {
        this.setState({
            name: e.target.value
        });
    }

    onPlaceChange(e) {
        this.setState({
            place: e.target.value
        });
    }

    onStartDateChange(e) {
        this.setState({
            startDate: e.target.value
        });
    }

    onEndDateChange(e) {
        this.setState({
            endDate: e.target.value
        });
    }

    handleModalClose() {
        this.setState({
            isOpen: false, 
            name: '', 
            place: '', 
            error: '',
        });
    }

    render() {
        return(
            <div>
                <button className='button' onClick={() => this.setState({isOpen: true})}>+ Add Choice</button>
                <Modal
                    isOpen={this.state.isOpen} 
                    contentLabel="Add link"
                    onAfterOpen={() => this.refs.name.focus()}
                    onRequestClose={this.handleModalClose.bind(this)}
                    className="boxed-view__box"
                    overlayClassName="boxed-view boxed-view--modal">
                    <h1>Add Choice</h1>
                    {this.state.error ? <p>{this.state.error}</p> : undefined}
                    <form onSubmit={this.onSubmit.bind(this)} className="boxed-view__form">
                        <input
                            type="text"
                            ref='name'
                            placeholder="Name"
                            onChange={this.onNameChange.bind(this)} 
                            value={this.state.name}/>
                            <TextField
                                id="datetime-local-start"
                                label="Start Date"
                                value={this.state.startDate} onChange={this.onStartDateChange.bind(this)}
                                type="datetime-local"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                id="datetime-local-end"
                                label='End Date' 
                                value={this.state.endDate} 
                                onChange={this.onEndDateChange.bind(this)}
                                type="datetime-local"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <input
                            type="text"
                            ref='place'
                            placeholder="Place"
                            onChange={this.onPlaceChange.bind(this)} 
                            value={this.state.place}/>
                        <button className='button'>Add Choice</button>
                        <button type="button" className="button button--secondary" onClick={this.handleModalClose.bind(this)}>Cancel</button>
                    </form>
                </Modal>
            </div>
        );
    }
}