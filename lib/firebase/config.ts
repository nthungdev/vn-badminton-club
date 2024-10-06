const firebaseConfig: Record<string, string> = {
  apiKey: 'AIzaSyAwzpIH5oHuJBBoGLgqm-_VR_TrM2sApOM',
  authDomain: 'apple-badminton.firebaseapp.com',
  projectId: 'apple-badminton',
  storageBucket: 'apple-badminton.appspot.com',
  messagingSenderId: '326161071088',
  appId: '1:326161071088:web:d30ff8d93d28034d097b35',
}

// When deployed, there are quotes that need to be stripped
Object.keys(firebaseConfig).forEach((key) => {
  const configValue = firebaseConfig[key] + ''
  if (configValue.charAt(0) === '"') {
    firebaseConfig[key] = configValue.substring(1, configValue.length - 1)
  }
})

export { firebaseConfig }
