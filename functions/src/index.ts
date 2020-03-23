import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

// The Firebase Admin SDK to access the Firebase Cloud Firestore
admin.initializeApp();

// Function that fires when auth adds a user
exports.createUserInFirestore = functions.auth.user().onCreate(async user => {
  // Adds document to users to stay up to date with auth
  const { uid, displayName, email, photoURL, phoneNumber } = user;
  let doc = {
    uid,
    displayName,
    email,
    photoURL,
    phoneNumber,
  };

  // Create new user with the data retrieved and latest moments
  await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .set(doc)
    .then(() => {
      return console.log("User document created for " + uid + "!");
    })
    .catch(error => {
      return console.log("Error adding user document for " + uid + ": " + error);
    });
});

// Function that fires when auth removes a user
exports.deleteUserInFirestore = functions.auth.user().onDelete(user => {
  // Removes document from users to stay up to date with auth
  const { uid } = user;

  // Remove the document selected by user ID
  return admin
    .firestore()
    .collection("users")
    .doc(uid)
    .delete()
    .then(() => {
      return console.log("User document deleted for " + uid + "!");
    })
    .catch(error => {
      return console.error("Error removing user document for " + uid + ": " + error);
    });
});
