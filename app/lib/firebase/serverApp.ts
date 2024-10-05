'server-only'

import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { credential } from 'firebase-admin'
import FirebaseServiceAccount from '@/firebase-service-account.json'

// const auth = getAuth(firebaseServerApp)

const firebaseAdminConfig = {
  credential: credential.cert({
    projectId: FirebaseServiceAccount.project_id,
    clientEmail: FirebaseServiceAccount.client_email,
    privateKey: FirebaseServiceAccount.private_key,
  }),
}

const firebaseServerApp = getApps()?.[0] || initializeApp(firebaseAdminConfig)

// function initFirebaseAdmin() {
//   if (getApps().length <= 0) {
//     initializeApp(firebaseAdminConfig)
//   }
// }

const auth = getAuth(firebaseServerApp)

export { auth, firebaseServerApp }
