'server-only'

import { headers } from 'next/headers'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { credential } from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import FirebaseServiceAccount from '@/firebase-service-account.json'

const firebaseAdminConfig = {
  credential: credential.cert({
    projectId: FirebaseServiceAccount.project_id,
    clientEmail: FirebaseServiceAccount.client_email,
    privateKey: FirebaseServiceAccount.private_key,
  }),
}

const firebaseServerApp = getApps()?.[0] || initializeApp(firebaseAdminConfig)

const auth = getAuth(firebaseServerApp)
// const firestore  = getFirestore()
const firestore = getFirestore()

const initAuth = () => {
  const idToken = headers().get('Authorization')?.split('Bearer ')[1]
  return { idToken }
}

const initApp = () => {
  if (getApps().length <= 0) {
    initializeApp(firebaseAdminConfig)
  }
}

export { auth, firestore, firebaseServerApp, initAuth, initApp }
