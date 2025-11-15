import { OWNER_SESSION_ID, getSessionId, isOwner } from './api'

/**
 * Initialize dev mode on app load
 * Show current owner status
 */
export function initializeDevMode() {
  const sessionId = getSessionId()
  const isOwnerUser = isOwner()
  
  console.log('🔧 Dev Mode Initialized')
  console.log(`   Session ID: ${sessionId}`)
  console.log(`   Status: ${isOwnerUser ? 'OWNER' : 'VISITOR'}`)
  
  if (!isOwnerUser) {
    console.log('')
    console.log('💡 To become OWNER, run in console:')
    console.log(`   localStorage.setItem("session_id", "${OWNER_SESSION_ID}")`)
    console.log('   Then refresh the page')
  } else {
    console.log('   ✅ You are the site owner')
  }
  
  console.log('')
  console.log('Available commands:')
  console.log('   checkOwnerStatus() - Check if you are the owner')
  console.log('   getSessionId() - Get your current session ID')
  console.log('   becomeOwner() - Set your session to owner (requires page refresh)')
}

/**
 * Become the owner (requires page refresh to take effect)
 */
export function becomeOwner() {
  localStorage.setItem('session_id', OWNER_SESSION_ID)
  console.log('✅ Owner session ID set!')
  console.log('🔄 Refresh the page to activate owner mode')
}

/**
 * Check current owner status
 */
export function checkOwnerStatus() {
  const sessionId = getSessionId()
  const isOwnerUser = isOwner()
  
  console.log(`Session ID: ${sessionId}`)
  console.log(`Status: ${isOwnerUser ? 'OWNER' : 'VISITOR'}`)
  console.log(`Owner sends to: ${isOwnerUser ? 'inbox (public)' : 'sent (private)'}`)
  
  return isOwnerUser
}

// Expose dev tools to window for console access
if (typeof window !== 'undefined') {
  (window as any).checkOwnerStatus = checkOwnerStatus
  ;(window as any).becomeOwner = becomeOwner
  ;(window as any).getSessionId = getSessionId
  ;(window as any).OWNER_SESSION_ID = OWNER_SESSION_ID
}
