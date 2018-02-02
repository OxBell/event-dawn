import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';

Accounts.validateNewUser((user) => {
  const email = user.emails[0].address;
  
  new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validate({ email });

  return true;
});

Meteor.methods({
  'users.addRole'(id) {
    console.log('on users add role');
    try {
      Roles.addUsersToRoles(id, ['normal-user']);
    } catch (err) {
      throw new Meteor.Error(500, 'can\'t add role to user', err);
    }
  }
});