import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

// if(Meteor.isServer) {
//   console.log('isServer');  
//   Meteor.publish('otherUser', function() {
//     return Meteor.users.find({}, {
//       fields: {
//         'createdAt': 0,
//         'services': 0,
//         'emails': 0,
//         'roles': 0
//       }
//     });
//   });
// }

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

// Meteor.methods({
//   'users.addRole'(_id) {
//     try {
//       Roles.addUsersToRoles(_id, ['normal-user']);
//     } catch (err) {
//       throw new Meteor.Error(500, 'can\'t add role to user', err);
//     }
//   }
// });