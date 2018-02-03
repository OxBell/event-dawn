import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';

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
            userId: choice.userId,
            users: participants
        });
    }

});
