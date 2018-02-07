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
            options: [],
            key_option: 1,
            startDate: moment(new Date()).format('Y-MM-DDTHH:mm'),
            endDate: moment(new Date()).format('Y-MM-DDTHH:mm')
        };
    }

    componentWillMount() {
        Modal.setAppElement('body');
        
    }

    insertChoice(name, place, startDate, endDate, options) {
        const choice =  {
            _id: shortid.generate(),
            name,
            duration: moment(endDate).diff(startDate, 'hours'),
            place,
            startDate,
            endDate,
            username: Meteor.user().username,
            votes: [],
            options
        }
            
        Meteor.call('polls.addChoice', this.props.poll._id, choice, (err, res) => {
            if (!err) {
                this.handleModalClose();
            } else {
                this.setState({error: err.reason });
            }

        });
    }

    onSubmit(e) {
        e.preventDefault();

        if(this.props.poll){
            const { name, place } = this.state; // const name = this.state.name, const duration = this.state.duration, const place = this.state.place
            const startDate = new Date(this.state.startDate).getTime();
            const endDate = new Date(this.state.endDate).getTime();
            let choice_options = [];

            if(this.state.options.length > 0){
                this.state.options.forEach((option) => {
                    if(this.refs[option].value && this.refs['label-'+option].value) {
                        choice_options.push({_id: shortid.generate(),label: this.refs['label-'+option].value, value: this.refs[option].value});
                        this.insertChoice(name, place, startDate, endDate, choice_options);
                    } else {
                        this.setState({error: 'Options must be enter!'});
                    }
                });
            } else {
                this.insertChoice(name, place, startDate, endDate, null);
            }
            
        } else {
            this.setState({error: 'No poll to add the choice!' });
        }
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
            options: [],
            key_option: 1
        });
    }

    addOption() {
        this.state.options.push(`option-${this.state.key_option}`);
        this.setState({options: this.state.options, key_option: this.state.key_option+1});
    }

    removeOption(option) {
        this.state.options.forEach((elem, i) => {
            if(elem === option){
                this.state.options.splice(i,1);
            }
        });
        this.setState({options: this.state.options});
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
                                value={this.state.startDate} 
                                onChange={this.onStartDateChange.bind(this)}
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

                            {this.state.options.map(option => 
                                <div key={option}>
                                    <input type="text" ref={"label-"+option} placeholder="Option Label"/>
                                    <button type="button" onClick={this.removeOption.bind(this, option)}>X</button>
                                    <input type="text" ref={option} placeholder="Option"/>
                                </div>
                            )}

                        <button type="button" className="button button--secondary" onClick={this.addOption.bind(this)}>Add Option</button>
                        <button className='button'>Add Choice</button>
                        <button type="button" className="button button--secondary" onClick={this.handleModalClose.bind(this)}>Cancel</button>
                    </form>
                </Modal>
            </div>
        );
    }
}