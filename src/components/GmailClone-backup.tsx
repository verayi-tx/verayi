import React, { useState } from 'react';
import { Mail, Star, Clock, Send, FileText, AlertCircle, Trash2, Archive, RefreshCw, MoreVertical, Search, Menu, Settings, HelpCircle, Grid3x3, ChevronLeft, ChevronRight, Printer, ExternalLink, Reply, Forward, ArrowLeft, X, Minimize2, Maximize2, Paperclip, Image, Smile, Link2, Plus } from 'lucide-react';

const GmailClone = () => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('primary');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const emails = [
    { id: 1, sender: 'Leslie Alexander', subject: 'Hiya', preview: 'Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.', time: '10:41 PM', starred: false, read: false, category: 'primary' },
    { id: 2, sender: 'Theresa Webb', subject: 'Build prototypes without code', preview: 'Sunt qui esse pariatur duis deserunt mollit dolore cillum minim tempor', time: '12:01 PM', starred: true, read: false, category: 'promotions', label: 'Promotions' },
    { id: 3, sender: 'Albert Flores', subject: 'Build prototypes without code', preview: 'Nostrud irure ex duis ea quis id quis ad et. Sunt qui esse pariatur duis deserunt mol', time: '11:59 AM', starred: false, read: false, category: 'primary' },
    { id: 4, sender: 'Jacob Jones', subject: "Don't make this bad", preview: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequ', time: '10:30 AM', starred: false, read: false, category: 'primary' },
    { id: 5, sender: 'Guy Hawkins', subject: 'The results to our user testing', preview: 'Nulla Lorem mollit cupidatat irure. Laborum magna nulla duis ullamco cillu', time: '5:49 AM', starred: false, read: false, category: 'updates', label: 'Updates' },
    { id: 6, sender: 'Annette Black', subject: 'Your account with us', preview: 'Non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia conse', time: '5:49 AM', starred: false, read: true, category: 'updates', label: 'Updates', selected: true },
    { id: 7, sender: 'Ralph Edwards', subject: 'Welcome to startmail', preview: 'Aliqua id fugiat nostrud irure ex duis ea quis id quis ad et. Sunt qui esse pariatur duis deseru', time: 'Apr 25', starred: false, read: true, category: 'primary' },
    { id: 8, sender: 'Darrell Steward', subject: 'We missed you last night', preview: 'Minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequa', time: 'Apr 25', starred: false, read: true, category: 'primary' },
    { id: 9, sender: 'Darlene Robertson', subject: 'Welcome to our mailing list', preview: 'Irure ex duis ea quis id quis ad et. Sunt qui esse pariatur duis deserunt molli', time: 'Apr 25', starred: false, read: true, category: 'primary' },
  ];

  const EmailRow = ({ email, onClick }) => (
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
        onClick={() => setIsComposing(true)}
        className="m-4 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-full shadow-md flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Compose
      </button>

      <nav className="flex-1 px-2">
        <SidebarItem icon={<Mail />} label="Inbox" count="3" active />
        <SidebarItem icon={<Star />} label="Starred" />
        <SidebarItem icon={<Clock />} label="Snoozed" />
        <SidebarItem icon={<Send />} label="Sent" />
        <SidebarItem icon={<FileText />} label="Drafts" count="1" />
        <SidebarItem icon={<AlertCircle />} label="Spam" count="3" />
        <SidebarItem icon={<Trash2 />} label="Trash" />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">Meet</div>
        <button className="mt-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left py-2 px-2 rounded flex items-center">
          <span className="w-5 h-5 mr-2">📹</span> New meeting
        </button>
        <button className="text-sm text-gray-700 hover:bg-gray-100 w-full text-left py-2 px-2 rounded flex items-center">
          <span className="w-5 h-5 mr-2">⌨️</span> Join a meeting
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Hangouts</div>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
          Sign in
        </button>
      </div>
    </div>
  );

  const SidebarItem = ({ icon, label, count, active }) => (
    <div
      className={`flex items-center px-4 py-2 my-1 rounded-r-full cursor-pointer ${
        active ? 'bg-red-100 text-red-600 font-medium' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="w-5 h-5 mr-4">{icon}</span>
      <span className="flex-1">{label}</span>
      {count && <span className="text-sm">{count}</span>}
    </div>
  );

  const EmailDetail = ({ email }) => (
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
          <h1 className="text-2xl font-normal">Email Subject</h1>
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
                <span className="font-medium">Michelle Rivera</span>
                <span className="text-gray-600 text-sm ml-2">&lt;michelle.rivera@example.com&gt;</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span>9:14 AM (8 hours ago)</span>
                <Star className="w-5 h-5 ml-4 text-gray-400 cursor-pointer hover:text-yellow-400" />
                <Reply className="w-5 h-5 ml-2 text-gray-600 cursor-pointer hover:text-gray-900" />
                <MoreVertical className="w-5 h-5 ml-2 text-gray-600 cursor-pointer hover:text-gray-900" />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">to me</div>
            <div className="text-gray-800 leading-relaxed">
              Aliqua id fugiat nostrud irure ex duis ea quis id quis ad et. Sunt qui esse pariatur duis deserunt mollit dolore cillum minim tempor enim. Elit aute irure tempor cupidatat incididunt sint deserunt ut voluptate aute id deserunt nisi.
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

  const ComposeWindow = () => (
    <div className="fixed bottom-0 right-8 w-[600px] bg-white rounded-t-lg shadow-2xl z-50">
      <div className="bg-gray-800 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <span className="font-medium">New Message</span>
        <div className="flex items-center gap-3">
          <Minimize2 className="w-4 h-4 cursor-pointer hover:bg-gray-700 rounded p-0.5" />
          <Maximize2 className="w-4 h-4 cursor-pointer hover:bg-gray-700 rounded p-0.5" />
          <X onClick={() => setIsComposing(false)} className="w-4 h-4 cursor-pointer hover:bg-gray-700 rounded p-0.5" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Recipients"
            className="w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none"
          />
          <div className="flex justify-end text-sm text-blue-600 mt-1">
            <span className="cursor-pointer hover:underline mr-2">Cc</span>
            <span className="cursor-pointer hover:underline">Bcc</span>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="Subject"
          className="w-full px-3 py-2 border-b border-gray-300 focus:border-blue-500 outline-none mb-3"
        />
        
        <textarea
          placeholder="Body Text"
          className="w-full px-3 py-2 h-64 outline-none resize-none"
        ></textarea>
      </div>
      
      <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-200 pt-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">
          Send
        </button>
        <div className="flex items-center gap-3 text-gray-600">
          <Paperclip className="w-5 h-5 cursor-pointer hover:text-gray-900" />
          <Link2 className="w-5 h-5 cursor-pointer hover:text-gray-900" />
          <Smile className="w-5 h-5 cursor-pointer hover:text-gray-900" />
          <Image className="w-5 h-5 cursor-pointer hover:text-gray-900" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-gray-900" />
          <Trash2 className="w-5 h-5 cursor-pointer hover:text-gray-900" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center">
        <button className="mr-4 p-2 hover:bg-gray-100 rounded-full">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23EA4335' d='M5 5v14l7-7z'/%3E%3Cpath fill='%23FBBC04' d='M5 5h14l-7 7z'/%3E%3Cpath fill='%2334A853' d='M19 5v14l-7-7z'/%3E%3Cpath fill='%234285F4' d='M5 19h14l-7-7z'/%3E%3C/svg%3E" alt="Gmail" className="w-8 h-8 mr-2" />
        <span className="text-xl text-gray-700 mr-8">Gmail</span>
        
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
          <HelpCircle className="w-6 h-6 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-1" />
          <Settings className="w-6 h-6 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-1" />
          <Grid3x3 className="w-6 h-6 text-gray-600 cursor-pointer hover:bg-gray-100 rounded-full p-1" />
          <div className="w-8 h-8 bg-blue-600 rounded-full ml-2"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {!selectedEmail ? (
            <>
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center">
                <input type="checkbox" className="mr-3" />
                <RefreshCw className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
                <MoreVertical className="w-5 h-5 mx-2 text-gray-600 cursor-pointer hover:text-gray-900" />
                
                <div className="ml-auto flex items-center">
                  <span className="text-sm text-gray-600 mr-4">1–50 of 2,619</span>
                  <ChevronLeft className="w-5 h-5 mx-1 text-gray-600 cursor-pointer hover:text-gray-900" />
                  <ChevronRight className="w-5 h-5 mx-1 text-gray-600 cursor-pointer hover:text-gray-900" />
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border-b border-gray-200 flex">
                <button className={`px-6 py-3 border-b-4 ${selectedTab === 'primary' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-600'} font-medium flex items-center`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Primary
                </button>
                <button className={`px-6 py-3 border-b-4 ${selectedTab === 'social' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'} font-medium flex items-center relative`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Social
                  <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">1 new</span>
                </button>
                <button className={`px-6 py-3 border-b-4 ${selectedTab === 'promotions' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-600'} font-medium flex items-center relative`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Promotions
                  <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">6 new</span>
                </button>
                <button className={`px-6 py-3 border-b-4 ${selectedTab === 'updates' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-600'} font-medium flex items-center`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Updates
                </button>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto bg-white">
                {emails.map(email => (
                  <EmailRow key={email.id} email={email} onClick={setSelectedEmail} />
                ))}
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