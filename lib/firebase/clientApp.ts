'use-client'

// Add SDKs for Firebase products to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app'
import { getAuth } from "firebase/auth";
import { firebaseConfig } from './config'


const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)

export { firebaseApp, auth }
