import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// The Firebase Admin SDK to access the Firebase Cloud Firestore
admin.initializeApp();

// Function that fires when auth adds a user
exports.createUserInFirestore = functions.auth.user().onCreate(async (user) => {
	// Adds document to users to stay up to date with auth
	const { uid, displayName, email, photoURL, phoneNumber } = user;

	const doc = {
		__deleted: false,
		id: uid,
		displayName,
		description: null,
		email,
		img: photoURL,
		phone: phoneNumber,
		pushToken: null,
	};

	// Create new user with the data retrieved and latest moments
	await admin
		.firestore()
		.collection("users")
		.doc(uid)
		.set(doc)
		.then(() => console.log(`User document created for ${uid}`))
		.catch((error) =>
			console.log(`Error adding user document for ${uid}: ${error}`)
		);
});

// Function that fires when auth removes a user
exports.deleteUserInFirestore = functions.auth.user().onDelete(async (user) => {
	// Removes document from users to stay up to date with auth
	const { uid } = user;

	// Remove the document selected by user ID
	await admin
		.firestore()
		.collection("users")
		.doc(uid)
		.delete()
		.then(
			async () =>
				await admin
					.firestore()
					.collection("users")
					.doc(uid)
					.collection("registrations")
					.listDocuments()
					.then(
						async (data) =>
							await Promise.all(
								data.map((_registration) => _registration.delete())
							)
								.then(() => console.log(`User document deleted for ${uid}`))
								.catch((error) =>
									console.error(
										`Error removing user document for ${uid}: ${error}`
									)
								)
					)
					.catch((error) =>
						console.error(`Error removing user document for ${uid}: ${error}`)
					)
		)
		.catch((error) =>
			console.error(`Error removing user document for ${uid}: ${error}`)
		);
});

// Function that fires when firestore collection activities are deleted
exports.activityDelete = functions.firestore
	.document("activities/{activityID}")
	.onDelete(async (__change, context) => {
		const { activityID } = context.params;

		await admin
			.firestore()
			.collectionGroup("registrations")
			.where("activity", "==", `activities/${activityID}`)
			.get()
			.then((querySnapshot) => querySnapshot.forEach((doc) => doc.ref.delete()))
			.catch((error) => console.error(error));
	});

// Function that fires when firestore collection users are created
exports.registrationCreate = functions.firestore
	.document("users/{userID}/registrations/{registrationID}")
	.onCreate((change, context) => {
		console.log(
			context.params.userID,
			context.params.registrationID,
			change,
			context
		);
	});

// Function that fires when firestore collection users are updated
exports.registrationUpdate = functions.firestore
	.document("users/{userID}/registrations/{registrationID}")
	.onUpdate((change, context) => {
		console.log(
			context.params.userID,
			context.params.registrationID,
			change,
			context
		);
	});

// Function that fires when firestore collection users are deleted
exports.registrationDelete = functions.firestore
	.document("users/{userID}/registrations/{registrationID}")
	.onDelete((change, context) => {
		console.log(
			context.params.userID,
			context.params.registrationID,
			change,
			context
		);
	});

// firebase messaging:
// Authorization = AAAACCaHSxk:APA91bGgxmfCjIMF9eRPZyc9XyY6A9ocdLQlB1SfArdYKu2zqLxahQz4d7s_fGePSDYFDuGHJkzq1FTb4b7ffzRiUbd1Bfpe12d3fkL2qu6QQYSlu6PgPt7FwTN90TiI74kQa7fO9yCg
// {
// 	"data": {
// 			"title": "Max is de beste",
// 			"body": "Hierbij wil ik verklaren dat Max de beste is!! Bron: https://ikwil-app.web.app/",
// 			"sound": "default",
// 			"badge": "1",
// 			"icon": "https://ikwil-app.web.app/icons/android-chrome-48x48.png",
// 			"click_action": "https://ikwil-app.web.app/",
// 			"subtitle": "Nogmaals: de beste",
// 			"body_loc_key": "",
// 			"body_loc_args": "",
// 			"title_loc_key": "",
// 			"title_loc_args": "",
// 			"android_channel_id": "",
// 			"tag": "",
// 			"color": "#F38C00"
// 	},
// 	"to": "",
// 	"condition": "",
// 	"registration_ids": ["f2sBWX05YBoV9enKhwPLup:APA91bFwKni58wOX_j4xCEodzj6y70_zH6RCj1EZcg4H85ws5T_XtQoxonei1NdBXXki4DIzrwia2RzsbeDLrJe2wivEzPUzDBBAzs9jZHPJBOBxSrttcdEc1Nm3_xEJ23XAFobQESJr"],
// 	"collapse_key": "",
// 	"priority": "normal",
// 	"content_available": false,
// 	"mutable_content": false,
// 	"time_to_live": 4,
// 	"restricted_package_name": "",
// 	"dry_run": false
// }

///////////
// UTILS //
///////////

exports.sendNotification = functions
	.runWith({ timeoutSeconds: 540, memory: "2GB" })
	.https.onCall((data, context) => {
		console.log("Sending notification");
	});
