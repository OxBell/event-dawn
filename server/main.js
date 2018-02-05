import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import schedule from 'node-schedule';

import { Polls } from '../imports/api/polls';
import { Events } from '../imports/api/events';

Meteor.startup(() => {

  // GENERATE POLL

  // schedule.scheduleJob({hour: 05, dayOfWeek: 1}, Meteor.bindEnvironment(function(){
  schedule.scheduleJob({hour: 20, minute: 32, dayOfWeek: 1}, Meteor.bindEnvironment(function(){
    Meteor.call('polls.insert', (err, res) => {
      if (!err) {
      } else {
        console.log('error', err.error);
      }
      });
  }));

  // GENERATE EVENT
  // schedule.scheduleJob({hour: 20, dayOfWeek: 3}, Meteor.bindEnvironment(function(){
    schedule.scheduleJob({hour: 20, minute: 33, dayOfWeek: 1}, Meteor.bindEnvironment(function(){
      Meteor.call('polls.getBestChoice', Polls.findOne({ state: 'current' }).choices, (err, res) => {
        if(err) {
          console.log(err.message);
        } else {
          let choices = res;
          Meteor.call('polls.getParticipants', res[0].votes, (err, res) => {
            if(err) {
              console.log(err.message);
            } else {
              if(choices.length === 1) {
                Meteor.call('events.create', choices[0], res, (err, res) => {
                  if (!err) {
                    Meteor.call('polls.finish', Polls.findOne({state: 'current'})._id, (err, res) => {
                      if (!err) {
                      } else {
                        console.log('error', err);
                      }
                    });
                  } else {          
                    console.log('error tests', err);
                  }
                });
              } else {
                Meteor.call('polls.finish', Polls.findOne({state: 'current'})._id, (err, res) => {
                  if (!err) {
                    Meteor.call('polls.extend', choices, (err, res) => {
                      if(!err){
                      } else {
                        console.log(err);
                      }
                    });
                  } else {
                    console.log('error', err);
                  }
                });
              }
            }
          });
        }
      });
    }));

    // IF POLL WAS EXTENDED
    // schedule.scheduleJob({hour: 20, dayOfWeek: 4}, Meteor.bindEnvironment(function(){
    schedule.scheduleJob({hour: 19, minute: 44, dayOfWeek: 1}, Meteor.bindEnvironment(function(){
      if(Polls.findOne({ state: 'current', extend: true })) {
        Meteor.call('polls.getOneBestChoice', Polls.findOne({ state: 'current' }).choices, (err, res) => {
          if(err) {
            console.log(err.message);
          } else {
            let choice = res;
            Meteor.call('polls.getParticipants', res.votes, (err, res) => {
              if(err) {
                console.log(err.message);
              } else {
                Meteor.call('events.create', choice, res, (err, res) => {
                  if (!err) {
                    Meteor.call('polls.finish', Polls.findOne({state: 'current'})._id, (err, res) => {
                      if (!err) {
                      } else {
                        console.log('error', err);
                      }
                    });
                  } else {          
                    console.log('error tests', err);
                  }
                });
              }
            });
          }
        });
      }
    }));

    // FINISH EVENT
    // schedule.scheduleJob({hour: 04, minute: 50, dayOfWeek: 1}, Meteor.bindEnvironment(function(){
      schedule.scheduleJob({hour: 17, minute: 29, dayOfWeek: 1}, Meteor.bindEnvironment(function(){
        console.log('finish event!');
        Meteor.call('events.finish', (err, res) => {
          if (!err) {
            
          } else {
            console.log('error', err);
          }
          });
      }));

});
