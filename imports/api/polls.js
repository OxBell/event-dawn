import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Polls = new Mongo.Collection('polls');

if(Meteor.isServer) {
    Meteor.publish('polls', function () {
        return Polls.find(); 
    });
}

Meteor.methods({
    'polls.insert'() {

        if (Polls.findOne({ state: 'current' })){
            throw new Meteor.Error('Already have current poll');
        }

        new SimpleSchema({
            state: {
                type: String,
            }
        }).validate({ state: 'current' });
        
        Polls.insert({
            state: 'current',
            date: new Date().getTime(),
            choices: null
        });
    },
    test() {
        console.log('test');
    }
});