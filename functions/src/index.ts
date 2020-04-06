import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

// The Firebase Admin SDK to access the Firebase Cloud Firestore
admin.initializeApp();

// Function that fires when auth adds a user
exports.createUserInFirestore = functions.auth.user().onCreate(async user => {
  // Adds document to users to stay up to date with auth
  const { uid, displayName, email, photoURL, phoneNumber } = user;
  const displayNameArray = displayName?.split(" ")
  const firstName = displayNameArray?.shift();
  const lastName = displayNameArray?.join(" ");

  const doc = {
    __deleted: false,
    id: uid,
    displayName,
    firstName,
    lastName,
    description: "",
    email,
    img: photoURL,
    phone: phoneNumber,
    services: [],
    registrations: []
  };

  // Create new user with the data retrieved and latest moments
  await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .set(doc)
    .then(() => console.log("User document created for " + uid + "!"))
    .catch((error) => console.log("Error adding user document for " + uid + ": " + error));
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
    .then(() => console.log("User document deleted for " + uid + "!"))
    .catch((error) => console.error("Error removing user document for " + uid + ": " + error));
});
