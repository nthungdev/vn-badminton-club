'server-only'

import { headers } from 'next/headers'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getAuth as getClientAuth } from 'firebase/auth'
import { credential } from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeServerApp } from 'firebase/app'
import { firebaseConfig } from './config'

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

export async function getAuthenticatedAppForUser() {
  const idToken = headers().get('Authorization')?.split('Bearer ')[1]

  const firebaseServerApp = initializeServerApp(
    firebaseConfig,
    idToken
      ? {
          authIdToken: idToken,
        }
      : {}
  )

  const auth = getClientAuth(firebaseServerApp)
  await auth.authStateReady()

  return { firebaseServerApp, me: auth.currentUser }
}

export { auth, firestore, firebaseServerApp }
