const admin = require('firebase-admin');
const roles = ['admin', 'super-instructor', 'instructor']
var config = require('./config.js');

admin.initializeApp(config);

const args = process.argv.slice(2)

if (args.length != 2) {
    console.error("Invalid argument. First argument should be the UID of the user, and the second one should be the role")
} else {

    if (roles.indexOf(args[1]) == -1) {
        console.error("Invalid role. role must be one of these: " + roles.join(', '))
    } else {
        admin.auth().setCustomUserClaims(args[0], {
            role: args[1]
        }).then(() => {
            console.log('Role granted succefully')
        }).catch((error) => {
            if (error.code == "auth/user-not-found") {
                console.error("User does not exist.")

            } else {
                console.error("An error occurred. code: " + error.code)
            }
        });
    }
}
