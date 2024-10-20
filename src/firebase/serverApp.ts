'server-only'

import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { credential } from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

const firebaseAdminConfig = {
  credential: credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
}

const firebaseServerApp = getApps()?.[0] || initializeApp(firebaseAdminConfig)

const auth = getAuth(firebaseServerApp)
const firestore = getFirestore()

export { auth, firestore, firebaseServerApp }
