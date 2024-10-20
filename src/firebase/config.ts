const firebaseConfig: Record<string, string> = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL!,
}

// When deployed, there are quotes that need to be stripped
Object.keys(firebaseConfig).forEach((key) => {
  const configValue = firebaseConfig[key] + ''
  if (configValue.charAt(0) === '"') {
    firebaseConfig[key] = configValue.substring(1, configValue.length - 1)
  }
})

export { firebaseConfig }
