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
}

Meteor.methods({
    'events.insert'(choice, participants) {
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
            users: participants
        });
    },
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
            users: participants
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
