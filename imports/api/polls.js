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
            choices: [],
            extend: false
        });
    },
    'polls.updateChoices'(_id, choices) {
        if(!this.userId || !Roles.userIsInRole(this.userId, ['admin'])){
            throw new Meteor.Error(403, 'not-authorized');
        }
        if (!Polls.findOne({ _id })){
            throw new Meteor.Error('No poll!');
        }
        Polls.update( {
            _id, 
        }, {
            $set: { choices } 
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
            username: Meteor.user().username
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
            throw new Meteor.Error('no choice!');
        } else if(choices.length === 1){
            return choices[0];
        } else if(choices.length > 1){
            let Bchoice = choices[0];
            let Bchoices = [Bchoice];
            for(let i=1; i < choices.length; i++) {
                if(choices[i].votes.length >= Bchoice.votes.length){
                    Bchoices.push(choices[i]);
                    Bchoice = choices[i];
                }
            }
            return Bchoices;
        }
    },
    'polls.getParticipants'(votes) {
        if(votes.length === 0) {
            throw new Meteor.Error('no participant!');
        }
        participants = [];
        votes.forEach((vote)=> {
            participants.push(vote.username);
        });
        return participants;
    },
    'polls.getOneBestChoice'(choices) {
        if(choices.length === 0){
            throw new Meteor.Error('no choice!');
        } else if(choices.length === 1){
            return choices[0];
        } else if(choices.length > 1){
            let Bchoice = choices[0];
            for(let i=1; i < choices.length; i++) {
                if(choices[i].votes.length === Bchoice.votes.length){
                    Bchoice = choices[i];
                }
            }
            return Bchoice;
        }
    },
    'polls.extend'(choices) {
        if (Polls.findOne({ state: 'current' }) || Events.findOne({ state: 'current' })){
            throw new Meteor.Error('Already have current poll or a event already planed!');
        }

        choices.forEach((choice) => {
            choice.votes = [];
        });

        new SimpleSchema({
            state: {
                type: String,
            }
        }).validate({ state: 'current' });
        
        Polls.insert({
            state: 'current',
            date: new Date().getTime(),
            extend: true,
            choices
        });

    },
    'users.addUserRole'() {
        if(!Meteor.userId()){
            throw new Meteor.Error('Not authenticate!');
        }
        try {
            Roles.addUsersToRoles(Meteor.userId(), ['normal-user']);
        } catch (err) {
            throw new Meteor.Error(500, 'can\'t add role to user', err);
        }        
    },
    'users.addUserRoleAdmin'() {
        if(!Meteor.userId()){
            throw new Meteor.Error('Not authenticate!');
        }
        try {
            Roles.addUsersToRoles(Meteor.userId(), ['normal-user', 'admin']);
        } catch (err) {
            throw new Meteor.Error(500, 'can\'t add role to user', err);
        }        
    }
});