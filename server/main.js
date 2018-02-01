import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

import '../imports/api/users';
import '../imports/startup/simple-schema-configuration';
import { Polls } from '../imports/api/polls';

Meteor.startup(() => {
  // Meteor.call('polls.insert', (err, res) => {
  //     if (!err) {
  //       console.log('polls', Polls.find().fetch());
  //     } else {
  //       console.log('error', err, Polls.find().fetch());
  //     }
  //   });
});
