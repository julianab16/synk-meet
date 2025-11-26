import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Configuration Module
 * 
 * Initializes Firebase Admin SDK for server-side operations.
 * Provides authenticated access to Firestore database and other Firebase services.
 * 
 * @module firebase
 */

/**
 * Service account credentials for Firebase Admin SDK authentication.
 * Contains private key and project configuration from Google Cloud Console.
 * 
 * @type {Object}
 * @property {string} type - Account type (typically "service_account")
 * @property {string} project_id - Firebase project identifier
 * @property {string} private_key_id - Unique identifier for the private key
 * @property {string} private_key - RSA private key for authentication
 * @property {string} client_email - Service account email address
 * @property {string} client_id - OAuth 2.0 client ID
 * 
 * @see {@link https://firebase.google.com/docs/admin/setup#initialize-sdk|Firebase Admin Setup}
 */
const serviceAccount = require("../serviceAccountKey.json");

/**
 * Initialize Firebase Admin SDK with service account credentials.
 * This must be called before accessing any Firebase services.
 * 
 * @throws {Error} If serviceAccountKey.json is missing or invalid
 * @throws {Error} If Firebase project credentials are incorrect
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Firestore database instance.
 * Provides access to Cloud Firestore for storing and retrieving meeting data.
 * 
 * @type {FirebaseFirestore.Firestore}
 * @exports db
 * 
 * @example
 * import { db } from './firebase';
 * 
 * // Read a document
 * const doc = await db.collection('meetings').doc('meetingId').get();
 * 
 * // Write a document
 * await db.collection('meetings').doc('meetingId').set({ title: 'Meeting' });
 * 
 * @see {@link https://firebase.google.com/docs/firestore|Firestore Documentation}
 */
export const db = getFirestore();
