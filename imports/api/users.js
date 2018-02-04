import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

if(Meteor.isServer) {
  Meteor.publish('singleUser', function (userId) {
    return Meteor.users.find({ _id: userId }, {
      fields: {
        'createdAt': 0,
        'services': 0,
        'emails': 0,
        'roles': 0
      }
    });
  });
}

Accounts.validateNewUser((user) => {
  const email = user.emails[0].address;
  const username = user.profile.username;

  new SimpleSchema({
    username: {
      type: String,
      min: 4,
      regEx: /[a-zA-Z][a-zA-Z0-9-_]{4,32}/,
    },
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validate({ 
    username, 
    email
  });

  return true;
});

Meteor.methods({
  'users.addRole'(_id) {
    try {
      Roles.addUsersToRoles(_id, ['normal-user']);
    } catch (err) {
      throw new Meteor.Error(500, 'Can\'t add role to user', err);
    }
  }
});