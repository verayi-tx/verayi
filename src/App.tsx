import { useEffect } from 'react'
import GmailClone from './components/GmailClone'
import { initializeDevMode } from './lib/devTools'

function App() {
  useEffect(() => {
    // Initialize dev mode on app load
    initializeDevMode()
  }, [])

  return <GmailClone />
}

export default App
