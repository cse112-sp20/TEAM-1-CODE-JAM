const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
app.get("/", (req, res) => {
  res.send("hello world!");
});
/**
 * Pull all the data from database based on team code
 * @author Trevor Perez
 * @param req Request from user. The team code
 * @param res All the data from that specific team
 */
app.get("/:id", (req, res) => {
  const teamsRef = db.collection("teams").doc(req.params.id);
  teamsRef
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
      } else {
        //console.log(req.query);
        console.log("Document data:", doc.data());
      }
      res.json({
        result: doc.data(),
      });
    })
    .catch((err) => {
      console.log("Error getting document", err);
    });
});
/**
 * Delete team based off of team code
 * @author Trevor Perez
 * @param req Request from user. The team code
 * @param res A deleted team
 */
app.delete("/:id", (req, res) => {
  let deleteDoc = db.collection("teams").doc(req.params.id).delete();
  res.json({
    result: deleteDoc,
  });
});

// Expose Express API as a single Cloud Function:
exports.teams = functions.https.onRequest(app);
