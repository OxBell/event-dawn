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
            choices: []
        });
    },
    'polls.addChoice'(_id, choice) {
        if(!this.userId){
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

        Polls.update( {
            _id, 
        }, {
            $push: { choices: choice } 
        });
    },
    'polls.updateChoice'(_id, choice) {
        if(!this.userId){
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

    }
});