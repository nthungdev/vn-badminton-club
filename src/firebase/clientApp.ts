'use-client'

// Add SDKs for Firebase products to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { firebaseConfig } from './config'

function initApp() {
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig)
    initAnalytics()
    return app
  } else {
    return getApp()
  }
}

const firebaseApp = initApp()
const auth = getAuth(firebaseApp)

function initAnalytics() {
  if (typeof window !== "undefined") {
    // Enable analytics. https://firebase.google.com/docs/analytics/get-started
    if ("measurementId" in firebaseConfig) {
      getAnalytics();
    }
  }
}

export { firebaseApp, auth, initApp }
