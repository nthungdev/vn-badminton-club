'server-only'

import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { credential } from 'firebase-admin'
import FirebaseServiceAccount from '@/firebase-service-account.json'
import { headers } from 'next/headers'
import { initializeServerApp } from 'firebase/app'

// const auth = getAuth(firebaseServerApp)

const firebaseAdminConfig = {
  credential: credential.cert({
    projectId: FirebaseServiceAccount.project_id,
    clientEmail: FirebaseServiceAccount.client_email,
    privateKey: FirebaseServiceAccount.private_key,
  }),
}

const firebaseServerApp = getApps()?.[0] || initializeApp(firebaseAdminConfig)

const auth = getAuth(firebaseServerApp)

const initAuth = () => {
  const idToken = headers().get('Authorization')?.split('Bearer ')[1]
  return { idToken }
}

const initApp = () => {
  if (getApps().length <= 0) {
    initializeApp(firebaseAdminConfig)
  }
}

export { auth, firebaseServerApp, initAuth, initApp }
