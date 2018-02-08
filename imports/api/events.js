import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';

import { Polls } from './polls';
import Event from '../ui/Event';

export const Events = new Mongo.Collection('events');

if(Meteor.isServer) {
    Meteor.publish('events', function () {
        return Events.find(); 
    });
    Meteor.publish("userStatus", function() {
        return Meteor.users.find();
    });
}

Meteor.methods({
    'events.create'(choice, participants) {
        if (Events.findOne({ state: 'current' })){
            throw new Meteor.Error('Already have current event. What awesome group !');
        }

        new SimpleSchema({
            state: {
                type: String,
            },
            place: {
                type: String
            },
            name: {
                type: String
            },
            startDate: {
                type: Number,
            },
            endDate: {
                type: Number
            },
            duration: {
                type: Number
            }
        }).validate({ state: 'current', startDate: choice.startDate, endDate: choice.endDate, place: choice.place,name: choice.name, duration: choice.duration});
        Events.insert({
            state: 'current',
            startDate: choice.startDate,
            endDate: choice.endDate,
            place: choice.place,
            name: choice.name,
            duration: choice.duration,
            username: choice.username,
            users: participants,
            options: choice.options
        });
    },
    'events.update'(_id, name, place, startDate, endDate, duration) {
        if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
            throw new Meteor.Error(403, 'not-authorized');
        }
        if (!Events.findOne({ _id })){
            throw new Meteor.Error('No event!');
        }

        Events.update({
            _id
        }, {
            $set: {
                name,
                place,
                startDate,
                endDate, 
                duration
            }
        });
    },
    'events.updateOption'(_id, option) {
        
        if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
            throw new Meteor.Error(403, 'not-authorized');
        }
        if (!Events.findOne({ _id })){
            throw new Meteor.Error('No event!');
        }

        let options = Events.findOne({ _id }).options;
        options.forEach(element => {
            if(element._id === option._id ){
                element.label = option.label;
                element.value = option.value;
            }
        });
        Events.update({
            _id
        }, {
            $set: {
                options
            }
        });
    },
    'events.removeOption'(_id, option) {
        
        if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
            throw new Meteor.Error(403, 'not-authorized');
        }
        if (!Events.findOne({ _id })){
            throw new Meteor.Error('No event!');
        }

        let options = Events.findOne({ _id }).options;
        options.forEach((element, i) => {
            if(element._id === option._id ){
                options.splice(i,1)
            }
        });
        Events.update({
            _id
        }, {
            $set: {
                options
            }
        });
    },
    'events.addOption'(_id, option) {
        
        if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
            throw new Meteor.Error(403, 'not-authorized');
        }
        if (!Events.findOne({ _id })){
            throw new Meteor.Error('No event!');
        }

        Events.update({
            _id
        }, {
            $addToSet: {
                options: option
            }
        });
    },
    'events.addParticipant'(eventId, user) {
        if(!this.userId || !Roles.userIsInRole(this.userId, ['normal-user'])){
            throw new Meteor.Error('not-authorized');
        }
        Events.update({
            _id: eventId
        }, {
            $addToSet: {
                users: user
            }
        });
    },
    'events.findUserByUsername'(username){
        if (!this.isSimulation)
            return Accounts.findUserByUsername(username);
    },
    'events.UserIsOnline'(username) {
        if (!this.isSimulation) {
            if(Accounts.findUserByUsername(username)) {
                return Accounts.findUserByUsername(username).status.online;
            }
        }
    },
    'events.finish'() {
        if(!Events.findOne({state: 'current'})) {
            throw new Meteor.Error('no current event');
        }

        const eventId = Events.findOne({state: 'current'})._id;

        Events.update( {
            _id: eventId
        }, {
            $set: {state: 'finished'}
        });
    }
});
