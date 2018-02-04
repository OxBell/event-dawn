import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import shortid from 'shortid';

import { Events } from './events';

export const Polls = new Mongo.Collection('polls');

if(Meteor.isServer) {
    Meteor.publish('polls', function () {
        return Polls.find(); 
    });
}

Meteor.methods({
    'polls.insert'() {

        if (Polls.findOne({ state: 'current' }) || Events.findOne({ state: 'current' })){
            throw new Meteor.Error('Already have current poll or a event already planed!');
        }

        new SimpleSchema({
            state: {
                type: String,
            }
        }).validate({ state: 'current' });
        
        Polls.insert({
            state: 'current',
            date: new Date().getTime(),
            choices: []
        });
    },
    'polls.addChoice'(_id, choice) {
        if(!this.userId || !Roles.userIsInRole(this.userId, ['normal-user'])){
            throw new Meteor.Error(403, 'not-authorized');
        }
        
        new SimpleSchema({
            _id: {
                type: String,
                min: 1
            }
            // Validate an object ... error => choice.name is not allowed by the schema
            // choice: {
            //     type: Object
            // }
        }).validate({ _id });

        choice.votes.push({
            _id: shortid.generate(),
            userId: Meteor.userId()
        });

        Polls.update( {
            _id, 
        }, {
            $push: { choices: choice } 
        });
    },
    'polls.finish'(_id) {
        Polls.update( {
            _id, 
        }, {
            $set: {state: 'finished'}
        });
    },
    'polls.updateChoice'(_id, choice) {
        if(!this.userId || !Roles.userIsInRole(this.userId, ['normal-user'])){
            throw new Meteor.Error('not-authorized');
        }
        
        new SimpleSchema({
            _id: {
                type: String,
                min: 1
            }
            // Validate an object ... error => choice.name is not allowed by the schema
            // choice: {
            //     type: Object
            // }
        }).validate({ _id });

        const choices = Polls.findOne({
            _id
        }).choices;

        for(key in choices) {
            if(choices[key]._id === choice._id){
                choices[key] = choice;
            }
        }

        Polls.update( {
            _id, 
        }, {
            $set: {choices}
        });
    },
    'polls.getBestChoice'(choices) {
        if(choices.length === 0){
            return new Meteor.Error('no choice!');
        } else if(choices.length === 1){
            return choices[0];
        } else if(choices.length > 1){
            let choice = choices[0];
            for(let i=1; i < choices.length; i++) {
                if(choices[i].votes.length > choice.votes.length){
                    choice = choices[i];
                }
            }
            return choice;
        }
    },
    'polls.getParticipants'(votes) {
        if(votes.length === 0) {
            return new Meteor.Error('no participant!');
        }
        participants = [];
        votes.forEach((vote)=> {
            participants.push(vote.userId);
        });
        return participants;
    }
});