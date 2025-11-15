import { supabase } from './supabase'

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Fixed owner session ID - set this in your browser's localStorage once
 */
export const OWNER_SESSION_ID = "3b6f5cba-8242-4b02-8f44-7137fcfd3a13";

/**
 * Get or create a session ID for the current visitor
 */
export function getSessionId(): string {
  let id = localStorage.getItem('session_id')
  
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('session_id', id)
  }
  
  return id
}

/**
 * Check if the current user is the owner
 */
export function isOwner(): boolean {
  return getSessionId() === OWNER_SESSION_ID
}

// ============================================
// INBOX (Immutable blog-like entries)
// ============================================

/**
 * Load all public inbox entries (newest first)
 * Calls renderInbox(data) which should be defined elsewhere
 */
export async function loadInbox(renderInbox: (data: any[]) => void) {
  try {
    const { data, error } = await supabase
      .from('inbox')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading inbox:', error)
      return
    }

    renderInbox(data || [])
  } catch (err) {
    console.error('Unexpected error loading inbox:', err)
  }
}

// ============================================
// DRAFTS (Editable visitor thoughts)
// ============================================

/**
 * Load the current draft for this session (if exists)
 */
export async function loadCurrentDraft() {
  const sessionId = getSessionId()
  
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) {
      // If no draft exists, that's okay - return null
      if (error.code === 'PGRST116') return null
      console.error('Error loading draft:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error loading draft:', err)
    return null
  }
}

/**
 * Save draft (create or update)
 */
export async function saveDraft({ id, to, subject, body }: { id?: string; to: string; subject: string; body: string }) {
  const session_id = getSessionId()
  
  try {
    if (id) {
      // Update existing draft
      const { data, error } = await supabase
        .from('drafts')
        .update({
          to,
          subject,
          body,
          last_updated: new Date().toISOString()
        })
        .eq('id', id)
        .eq('session_id', session_id)
        .select()

      if (error) {
        console.error('Error updating draft:', error)
        return null
      }
      return data?.[0] || null
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from('drafts')
        .insert({
          to,
          subject,
          body,
          session_id,
          last_updated: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error creating draft:', error)
        return null
      }
      return data?.[0] || null
    }
  } catch (err) {
    console.error('Unexpected error saving draft:', err)
    return null
  }
}

/**
 * Load all drafts for the current session (newest/last edited first)
 * Calls renderDrafts(data) which should be defined elsewhere
 */
export async function loadDrafts(renderDrafts: (data: any[]) => void) {
  const session_id = getSessionId()
  
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('session_id', session_id)
      .order('last_updated', { ascending: false })

    if (error) {
      console.error('Error loading drafts:', error)
      return
    }

    renderDrafts(data || [])
  } catch (err) {
    console.error('Unexpected error loading drafts:', err)
  }
}


/**
 * Delete the current session's draft
 * Called when "sending" a draft (which just removes it, doesn't publish)
 */
export async function deleteDraft() {
  const sessionId = getSessionId()
  
  try {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error deleting draft:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Unexpected error deleting draft:', err)
    return false
  }
}

// ============================================
// SEND DRAFT (Owner -> inbox, Visitor -> sent)
// ============================================

/**
 * Send a draft - routes to inbox (owner) or sent (visitor)
 */
export async function sendDraft({ id, to, subject, body, from_identity }: {
  id?: string;
  to: string;
  subject: string;
  body: string;
  from_identity?: string;
}) {
  const session_id = getSessionId()
  
  try {
    if (isOwner()) {
      // Owner: publish to INBOX
      const { data, error } = await supabase
        .from('inbox')
        .insert({
          from_identity: from_identity || 'Owner',
          to,
          subject,
          body,
          tags: [],
          visibility: 'public'
        })
        .select()

      if (error) {
        console.error('Error sending to inbox:', error)
        return null
      }
      
      // Delete draft after successful send
      if (id) {
        await supabase.from('drafts').delete().eq('id', id).eq('session_id', session_id)
      }
      
      return data?.[0] || null
    } else {
      // Visitor: record in SENT (permanent, scoped by session_id)
      const { data, error } = await supabase
        .from('sent')
        .insert({
          to,
          subject,
          body,
          session_id
        })
        .select()

      if (error) {
        console.error('Error sending to sent:', error)
        return null
      }
      
      // Delete draft after successful send
      if (id) {
        await supabase.from('drafts').delete().eq('id', id).eq('session_id', session_id)
      }
      
      return data?.[0] || null
    }
  } catch (err) {
    console.error('Unexpected error sending:', err)
    return null
  }
}

/**
 * Load sent messages for the current session (newest first)
 * RLS ensures users only see their own messages
 */
export async function loadSent(renderSent: (data: any[]) => void) {
  const session_id = getSessionId()
  
  try {
    const { data, error } = await supabase
      .from('sent')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading sent messages:', error)
      return
    }

    renderSent(data || [])
  } catch (err) {
    console.error('Unexpected error loading sent messages:', err)
  }
}

// ============================================
// MAILBOX COUNTS
// ============================================

/**
 * Get counts for all mailboxes
 */
export async function getMailboxCounts() {
  const session_id = getSessionId()
  
  try {
    // Get inbox count (public posts)
    const { count: inboxCount } = await supabase
      .from('inbox')
      .select('*', { count: 'exact', head: true })
      .eq('visibility', 'public')

    // Get drafts count (session-scoped)
    const { count: draftsCount } = await supabase
      .from('drafts')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id)

    // Get sent count (session-scoped)
    const { count: sentCount } = await supabase
      .from('sent')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id)

    return {
      inbox: inboxCount || 0,
      drafts: draftsCount || 0,
      sent: sentCount || 0,
      starred: 0, // Not implemented yet
      snoozed: 0, // Not implemented yet
      spam: 0, // Not implemented yet
      trash: 0 // Not implemented yet
    }
  } catch (err) {
    console.error('Error getting mailbox counts:', err)
    return {
      inbox: 0,
      drafts: 0,
      sent: 0,
      starred: 0,
      snoozed: 0,
      spam: 0,
      trash: 0
    }
  }
}
