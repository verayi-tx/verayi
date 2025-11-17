import React, { useState, useEffect } from 'react';
import { Mail, Star, Clock, Send, FileText, AlertCircle, Trash2, Archive, RefreshCw, MoreVertical, Search, Menu, Settings, HelpCircle, Grid, ChevronLeft, ChevronRight, Printer, ExternalLink, Reply, Forward, ArrowLeft, X, Minimize2, Maximize2, Plus } from 'lucide-react';
import { loadInbox, loadDrafts, loadSent, saveDraft, sendDraft, isOwner, getSessionId, getMailboxCounts } from '../lib/api';

interface Email {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  starred: boolean;
  read: boolean;
  category: string;
  label?: string;
  selected?: boolean;
}

const GmailClone = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('primary');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('inbox');
  const [currentMailbox, setCurrentMailbox] = useState('inbox');
  const [mailboxContent, setMailboxContent] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mailboxCounts, setMailboxCounts] = useState({
    inbox: 0,
    drafts: 0,
    sent: 0,
    starred: 0,
    snoozed: 0,
    spam: 0,
    trash: 0
  });

  // Load mailbox counts on mount and when mailbox changes
  const loadCounts = async () => {
    const counts = await getMailboxCounts();
    setMailboxCounts(counts);
  };

  // Load counts on mount
  useEffect(() => {
    loadCounts();
  }, []);

  // Load data when mailbox changes
  useEffect(() => {
    const loadMailboxData = async () => {
      setIsLoading(true);
      
      try {
        if (currentMailbox === 'inbox') {
          await loadInbox((data: any[]) => {
            const formatted = data.map(entry => ({
              id: entry.id,
              sender: entry.from_identity || 'Unknown',
              subject: entry.subject,
              preview: entry.body?.substring(0, 100) || '',
              time: new Date(entry.created_at).toLocaleString(),
              starred: false,
              read: true,
              category: 'primary'
            }));
            setMailboxContent(formatted);
            setIsLoading(false);
          });
        } else if (currentMailbox === 'drafts') {
          await loadDrafts((data: any[]) => {
            const formatted = data.map(entry => ({
              id: entry.id,
              sender: 'Draft',
              subject: entry.subject || '(no subject)',
              preview: entry.body?.substring(0, 100) || '',
              time: new Date(entry.last_updated).toLocaleString(),
              starred: false,
              read: true,
              category: 'drafts'
            }));
            setMailboxContent(formatted);
            setIsLoading(false);
          });
        } else if (currentMailbox === 'sent') {
          await loadSent((data: any[]) => {
            const formatted = data.map(entry => ({
              id: entry.id,
              sender: `To: ${entry.to}`,
              subject: entry.subject || '(no subject)',
              preview: entry.body?.substring(0, 100) || '',
              time: new Date(entry.created_at).toLocaleString(),
              starred: false,
              read: true,
              category: 'sent'
            }));
            setMailboxContent(formatted);
            setIsLoading(false);
          });
        } else {
          // Other mailboxes not implemented yet
          setMailboxContent([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading mailbox data:', error);
        // Don't let Supabase errors break the UI
        setMailboxContent([]);
        setIsLoading(false);
      }
    };
    
    loadMailboxData();
    loadCounts(); // Refresh counts when mailbox changes
  }, [currentMailbox]);


  const handleEmailClick = (email: Email) => {
    // If it's a draft, open Compose modal with that draft ID
    if (email.category === 'drafts') {
      setEditingDraftId(String(email.id));
      setIsComposing(true);
    } else {
      setSelectedEmail(email);
    }
  };

  const EmailRow = ({ email, onClick }: { email: Email; onClick: (email: Email) => void }) => (
    <div
      onClick={() => onClick(email)}
      className={`flex items-center px-4 py-2 border-b border-gray-200 hover:shadow-md cursor-pointer transition-all ${
        email.selected ? 'bg-blue-50' : email.read ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      <input type="checkbox" className="mr-3" />
      <Star className={`w-5 h-5 mr-3 cursor-pointer ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
      <Mail className="w-5 h-5 mr-3 text-gray-400" />
      <div className="flex-1 flex items-center min-w-0">
        <span className={`w-48 truncate ${email.read ? 'font-normal' : 'font-semibold'}`}>
          {email.sender}
        </span>
        <div className="flex-1 min-w-0 mx-4">
          {email.label && (
            <span className={`inline-block px-2 py-0.5 text-xs rounded mr-2 ${
              email.label === 'Updates' ? 'bg-orange-500 text-white' : 'bg-teal-500 text-white'
            }`}>
              {email.label}
            </span>
          )}
          <span className={email.read ? 'font-normal' : 'font-semibold'}>{email.subject}</span>
          <span className="text-gray-600 ml-1">- {email.preview}</span>
        </div>
        <span className={`text-sm ml-auto whitespace-nowrap ${email.read ? 'text-gray-500' : 'text-gray-900'}`}>
          {email.time}
        </span>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <button
        onClick={() => {
          setEditingDraftId(null); // null means new draft
          setIsComposing(true);
        }}
        className="m-4 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-full shadow-md flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Compose
      </button>

      <nav className="flex-1 px-2">
        <SidebarItem 
          icon={<Mail />} 
          label="Inbox" 
          count={mailboxCounts.inbox > 0 ? mailboxCounts.inbox.toString() : undefined}
          active={activeSection === 'inbox'}
          onClick={() => {
            setActiveSection('inbox');
            setCurrentMailbox('inbox');
          }}
        />
        <SidebarItem 
          icon={<Star />} 
          label="Starred" 
          active={activeSection === 'starred'}
          onClick={() => {
            setActiveSection('starred');
            setCurrentMailbox('starred');
          }}
        />
        <SidebarItem 
          icon={<Clock />} 
          label="Snoozed" 
          active={activeSection === 'snoozed'}
          onClick={() => {
            setActiveSection('snoozed');
            setCurrentMailbox('snoozed');
          }}
        />
        <SidebarItem 
          icon={<Send />} 
          label="Sent" 
          count={mailboxCounts.sent > 0 ? mailboxCounts.sent.toString() : undefined}
          active={activeSection === 'sent'}
          onClick={() => {
            setActiveSection('sent');
            setCurrentMailbox('sent');
          }}
        />
        <SidebarItem 
          icon={<FileText />} 
          label="Drafts" 
          count={mailboxCounts.drafts > 0 ? mailboxCounts.drafts.toString() : undefined}
          active={activeSection === 'drafts'}
          onClick={() => {
            setActiveSection('drafts');
            setCurrentMailbox('drafts');
          }}
        />
        <SidebarItem 
          icon={<AlertCircle />} 
          label="Spam" 
          count={mailboxCounts.spam > 0 ? mailboxCounts.spam.toString() : undefined}
          active={activeSection === 'spam'}
          onClick={() => {
            setActiveSection('spam');
            setCurrentMailbox('spam');
          }}
        />
        <SidebarItem 
          icon={<Trash2 />} 
          label="Trash" 
          active={activeSection === 'trash'}
          onClick={() => {
            setActiveSection('trash');
            setCurrentMailbox('trash');
          }}
        />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">Meet</div>
        <button 
          onClick={() => console.log('New meeting clicked')}
          className="mt-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left py-2 px-2 rounded flex items-center"
        >
          <span className="w-5 h-5 mr-2">📹</span> New meeting
        </button>
        <button 
          onClick={() => console.log('Join meeting clicked')}
          className="text-sm text-gray-700 hover:bg-gray-100 w-full text-left py-2 px-2 rounded flex items-center"
        >
          <span className="w-5 h-5 mr-2">⌨️</span> Join a meeting
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Hangouts</div>
        <button 
          onClick={() => console.log('Hangouts sign in clicked')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          Sign in
        </button>
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, count, active, onClick }: { icon: React.ReactNode; label: string; count?: string; active?: boolean; onClick?: () => void }) => (
    <div
      onClick={onClick}
      className={`flex items-center px-4 py-2 my-1 rounded-r-full cursor-pointer ${
        active ? 'bg-red-100 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="w-5 h-5 mr-4">{icon}</span>
      <span className="flex-1">{label}</span>
      {count && <span className="text-sm">{count}</span>}
    </div>
  );

  const EmailDetail = ({ email }: { email: Email }) => (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="border-b border-gray-200 p-4 flex items-center">
        <button onClick={() => setSelectedEmail(null)} className="mr-4 hover:bg-gray-100 p-2 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Archive className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
        <AlertCircle className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
        <Trash2 className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
        <Mail className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
        <Clock className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
        <RefreshCw className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
        <MoreVertical className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
        
        <div className="ml-auto flex items-center">
          <span className="text-sm text-gray-600 mr-4">1–50 of 2,619</span>
          <ChevronLeft className="w-5 h-5 mx-1 text-gray-600 cursor-pointer hover:text-gray-900" />
          <ChevronRight className="w-5 h-5 mx-1 text-gray-600 cursor-pointer hover:text-gray-900" />
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-normal">{email.subject}</h1>
          <div className="flex items-center">
            <Printer className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
            <ExternalLink className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
          </div>
        </div>

        <div className="flex items-start mb-6">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium">{email.sender}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span>{email.time}</span>
                <Star className={`w-5 h-5 ml-4 cursor-pointer hover:text-yellow-400 ${email.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                <Reply className="w-5 h-5 ml-2 text-gray-600 cursor-pointer hover:text-gray-900" />
                <MoreVertical className="w-5 h-5 ml-2 text-gray-600 cursor-pointer hover:text-gray-900" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">to me</div>
            <div className="text-gray-800 leading-relaxed">
              {email.preview}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
            Looking forward to it!
          </button>
          <button className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
            We will be there!
          </button>
          <button className="px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded hover:bg-blue-50">
            Thanks for the update!
          </button>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center">
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </button>
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center">
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </button>
        </div>
      </div>
    </div>
  );

  const ComposeWindow = () => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

    // Load existing draft when modal opens (if editingDraftId is set)
    useEffect(() => {
      const loadDraft = async () => {
        if (editingDraftId) {
          // Load specific draft by ID (only if it belongs to this session)
          const { data, error } = await (await import('../lib/supabase')).supabase
            .from('drafts')
            .select('*')
            .eq('id', editingDraftId)
            .eq('session_id', getSessionId()) // Security: only load own drafts
            .single();
          
          if (data && !error) {
            setTo(data.to || '');
            setSubject(data.subject || '');
            setBody(data.body || '');
            setCurrentDraftId(editingDraftId);
          }
        } else {
          // Creating new draft - start fresh
          setCurrentDraftId(null);
        }
        setIsLoading(false);
      };
      loadDraft();
    }, []);

    // Auto-save draft when to, subject, or body changes (debounced)
    useEffect(() => {
      if (!isLoading && (to || subject || body)) {
        const timeoutId = setTimeout(async () => {
          const result = await saveDraft({
            id: currentDraftId || undefined,
            to,
            subject,
            body
          });
          
          // If creating new draft, store the ID
          if (result && !currentDraftId) {
            setCurrentDraftId(result.id);
          }
          
          // Don't refresh drafts view while composing - causes modal to flicker
        }, 1000); // Save 1 second after user stops typing

        return () => clearTimeout(timeoutId);
      }
    }, [to, subject, body, isLoading, currentDraftId]);

    const handleSend = async () => {
      if (!to.trim() || !subject.trim() || !body.trim()) {
        alert('Please fill in To, Subject, and Body');
        return;
      }

      setIsSending(true);
      try {
        let from_identity: string | undefined;
        
        // For owner, prompt for from_identity
        if (isOwner()) {
          const input = window.prompt('Send as (your name or email):');
          if (!input || !input.trim()) {
            alert('From identity is required to send');
            setIsSending(false);
            return;
          }
          from_identity = input.trim();
        }
        
        // Send draft (routes to inbox or sent based on isOwner)
        const result = await sendDraft({
          id: currentDraftId || undefined,
          to,
          subject,
          body,
          from_identity
        });
        
        if (result) {
          setIsComposing(false);
          alert(isOwner() ? 'Message sent to Inbox!' : 'Message sent!');
          setTo('');
          setSubject('');
          setBody('');
          
          // Refresh current view
          if (currentMailbox === 'drafts') {
            setCurrentMailbox('');
            setTimeout(() => setCurrentMailbox('drafts'), 0);
          } else if (currentMailbox === 'inbox' && isOwner()) {
            setCurrentMailbox('');
            setTimeout(() => setCurrentMailbox('inbox'), 0);
          } else if (currentMailbox === 'sent' && !isOwner()) {
            setCurrentMailbox('');
            setTimeout(() => setCurrentMailbox('sent'), 0);
          }
        } else {
          alert('Failed to send. Check console for errors.');
        }
      } catch (error) {
        console.error('Error sending:', error);
        alert('Failed to send');
      } finally {
        setIsSending(false);
      }
    };

    const handleDiscard = async () => {
      if (subject || body) {
        const confirmed = window.confirm('Discard this draft?');
        if (!confirmed) return;
        
        // Delete this specific draft if it exists
        if (currentDraftId) {
          await (await import('../lib/supabase')).supabase
            .from('drafts')
            .delete()
            .eq('id', currentDraftId)
            .eq('session_id', getSessionId()); // Security: only delete own drafts
          
          // Refresh drafts view
          if (currentMailbox === 'drafts') {
            setCurrentMailbox('');
            setTimeout(() => setCurrentMailbox('drafts'), 0);
          }
        }
      }
      setTo('');
      setSubject('');
      setBody('');
      setIsComposing(false);
    };

    return (
      <div className="fixed bottom-0 right-8 w-[600px] bg-white rounded-t-lg shadow-2xl z-50">
        <div className="bg-gray-800 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <span className="font-medium">{editingDraftId ? 'Edit Draft' : 'New Message'}</span>
          <div className="flex items-center gap-3">
            <Minimize2 
              onClick={() => console.log('Minimize compose')}
              className="w-4 h-4 cursor-pointer hover:bg-gray-700 rounded p-0.5" 
            />
            <Maximize2 
              onClick={() => console.log('Maximize compose')}
              className="w-4 h-4 cursor-pointer hover:bg-gray-700 rounded p-0.5" 
            />
            <X 
              onClick={() => setIsComposing(false)} 
              className="w-4 h-4 cursor-pointer hover:bg-gray-700 rounded p-0.5" 
            />
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading draft...</div>
          ) : (
            <>
              <input
                type="text"
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none mb-3"
              />
              
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none mb-3"
              />
              
              <textarea
                placeholder="Body Text (auto-saves while you type)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 h-64 outline-none resize-none border-b border-gray-300 focus:border-blue-500"
              ></textarea>
              
              <div className="text-xs text-gray-500 mt-2">
                Draft auto-saved • Send to mark as done (manually publish to Inbox later)
              </div>
            </>
          )}
        </div>
        
        <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-200 pt-3">
          <button 
            onClick={handleSend}
            disabled={isSending || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
          <div className="flex items-center gap-3 text-gray-600">
            <Trash2 
              onClick={handleDiscard}
              className="w-5 h-5 cursor-pointer hover:text-gray-900"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23EA4335' d='M5 5v14l7-7z'/%3E%3Cpath fill='%23FBBC04' d='M5 5h14l-7 7z'/%3E%3Cpath fill='%2334A853' d='M19 5v14l-7-7z'/%3E%3Cpath fill='%234285F4' d='M5 19h14l-7-7z'/%3E%3C/svg%3E" alt="Vmail" className="w-8 h-8 mr-2" />
        <span className="text-xl text-gray-700 mr-8">Vmail</span>
        
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search mail"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:bg-white focus:shadow-md outline-none"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <HelpCircle 
            onClick={() => console.log('Help clicked')}
            className="w-6 h-6 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-1" 
          />
          <Settings 
            onClick={() => console.log('Settings clicked')}
            className="w-6 h-6 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-1" 
          />
          <Grid 
            onClick={() => console.log('Apps menu clicked')}
            className="w-6 h-6 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-1" 
          />
          <div 
            onClick={() => console.log('Profile clicked')}
            className="w-8 h-8 bg-blue-600 rounded-full ml-2 cursor-pointer"
          ></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {!selectedEmail ? (
            <>
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-3 cursor-pointer" 
                  onChange={(e) => console.log('Select all:', e.target.checked)}
                />
                <RefreshCw 
                  onClick={() => {
                    // Trigger reload by resetting currentMailbox to force useEffect
                    const current = currentMailbox;
                    setCurrentMailbox('');
                    setTimeout(() => setCurrentMailbox(current), 0);
                  }}
                  className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" 
                />
                <MoreVertical 
                  onClick={() => console.log('More options clicked')}
                  className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" 
                />
                
                <div className="ml-auto flex items-center">
                  <span className="text-sm text-gray-600 mr-4">1–50 of 2,619</span>
                  <ChevronLeft 
                    onClick={() => console.log('Previous page')}
                    className="w-5 h-5 mx-1 text-gray-600 cursor-pointer hover:text-gray-900" 
                  />
                  <ChevronRight 
                    onClick={() => console.log('Next page')}
                    className="w-5 h-5 mx-1 text-gray-600 cursor-pointer hover:text-gray-900" 
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border-b border-gray-200 flex">
                <button 
                  onClick={() => setSelectedTab('primary')}
                  className={`px-6 py-3 border-b-4 ${selectedTab === 'primary' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-600'} font-medium flex items-center`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Primary
                </button>
                <button 
                  onClick={() => setSelectedTab('social')}
                  className={`px-6 py-3 border-b-4 ${selectedTab === 'social' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'} font-medium flex items-center relative`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Social
                  <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">1 new</span>
                </button>
                <button 
                  onClick={() => setSelectedTab('promotions')}
                  className={`px-6 py-3 border-b-4 ${selectedTab === 'promotions' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-600'} font-medium flex items-center relative`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Promotions
                  <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">6 new</span>
                </button>
                <button 
                  onClick={() => setSelectedTab('updates')}
                  className={`px-6 py-3 border-b-4 ${selectedTab === 'updates' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-600'} font-medium flex items-center`}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Updates
                </button>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto bg-white">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading...
                  </div>
                ) : mailboxContent.length > 0 ? (
                  mailboxContent.map(email => (
                    <EmailRow key={email.id} email={email} onClick={handleEmailClick} />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {currentMailbox === 'inbox' && 'No messages in inbox'}
                    {currentMailbox === 'drafts' && 'No drafts yet'}
                    {currentMailbox === 'starred' && 'No starred messages'}
                    {currentMailbox === 'sent' && 'No sent messages'}
                    {currentMailbox === 'spam' && 'No spam'}
                    {currentMailbox === 'trash' && 'Trash is empty'}
                    {currentMailbox === 'snoozed' && 'No snoozed messages'}
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmailDetail email={selectedEmail} />
          )}
        </div>
      </div>

      {isComposing && <ComposeWindow />}
    </div>
  );
};

export default GmailClone;
