'use-client'

import { initializeApp } from 'firebase/app'
// Add SDKs for Firebase products to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { firebaseConfig } from './config'

export const firebaseApp = initializeApp(firebaseConfig)
