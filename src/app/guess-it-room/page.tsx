'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface GuessItRoom {
  id: number;
  title: string;
  desc: string;
  user_password?: string;
  mod_password?: string;
  isLocked: boolean;
}

export default function GuessItRoomPage() {
  const [rooms, setRooms] = useState<GuessItRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<GuessItRoom | null>(null);
  const [version, setVersion] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/guess-it-room/list');
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        } else {
          toast.error('Failed to fetch guess-it rooms.');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while fetching guess-it rooms.');
      }
    };
    fetchRooms();
  }, [version]);

  const handleAddRoom = useCallback(() => {
    setEditingRoom(null);
    setIsModalOpen(true);
  }, []);

  const handleEditRoom = useCallback((room: GuessItRoom) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  }, []);

  const handleDeleteRoom = useCallback(async (id: number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await fetch(`/api/guess-it-room/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Guess-it room deleted successfully!');
          setVersion(v => v + 1);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to delete guess-it room.');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while deleting the guess-it room.');
      }
    }
  }, []);

  const handleLockRoom = async (id: number) => {
    if (window.confirm('Are you sure you want to lock this room? Once locked, this action cannot be undone.')) {
      try {
        const response = await fetch(`/api/guess-it-room/${id}/lock`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isLocked: true }),
        });

        if (response.ok) {
          toast.success('Guess-it room locked successfully!');
          setVersion(v => v + 1);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to lock guess-it room.');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while locking the guess-it room.');
      }
    }
  };

  const handleSaveRoom = useCallback(async (roomData: Omit<GuessItRoom, 'id' | 'isLocked'>) => {
    const url = editingRoom ? `/api/guess-it-room/${editingRoom.id}` : '/api/guess-it-room';
    const method = editingRoom ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        toast.success(`Guess-it room ${editingRoom ? 'updated' : 'created'} successfully!`);
        setIsModalOpen(false);
        setVersion(v => v + 1);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save guess-it room.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving the guess-it room.');
    }
  }, [editingRoom]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 p-4 sm:p-8 font-sans">
      <Toaster position="bottom-center" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-[-5deg]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                My Guess-It Rooms
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage your rooms and start quizzes</p>
            </div>
          </div>
          
          <button
            onClick={handleAddRoom}
            className="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Guess-It Room
          </button>
        </div>

        {/* Rooms Grid */}
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div 
                key={room.id} 
                className={`relative group bg-[#12121b] border rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-sm overflow-hidden ${
                  room.isLocked 
                  ? 'border-gray-800/50' 
                  : 'border-gray-700/50 hover:border-purple-500/30'
                }`}
              >
                {/* Background Glow for Unlocked */}
                {!room.isLocked && (
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
                )}
                
                {/* Locked Indicator */}
                {room.isLocked && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-xs font-medium border border-red-500/20">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked
                  </div>
                )}

                <div className="flex flex-col h-full">
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {room.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
                    {room.desc}
                  </p>
                  
                  <div className="space-y-2 text-xs text-gray-500 mb-6 bg-gray-900/30 p-3 rounded-lg border border-gray-800/50">
                    <div className="flex justify-between">
                      <span>ID</span>
                      <span className="font-mono text-gray-400">#{room.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Pass</span>
                      <span className="font-mono text-gray-400">{room.user_password || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mod Pass</span>
                      <span className="font-mono text-gray-400">{room.mod_password || 'None'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-800/50">
                    {room.isLocked ? (
                      <>
                        <button
                          onClick={() => router.push(`/guess-it-room/${room.id}`)}
                          className="flex-1 py-2 px-3 text-sm bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => router.push(`/guess-it-room/${room.id}/start-quiz`)}
                          className="flex-1 py-2 px-3 text-sm bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 rounded-lg transition-colors font-medium"
                        >
                          Start Quiz
                        </button>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)} 
                          className="py-2 px-3 text-sm bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => router.push(`/guess-it-room/${room.id}`)} 
                          className="flex-1 py-2 px-3 text-sm bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 rounded-lg transition-colors font-medium"
                        >
                          Manage
                        </button>
                        <button 
                          onClick={() => handleEditRoom(room)} 
                          className="py-2 px-3 text-sm bg-yellow-600/10 hover:bg-yellow-600/20 text-yellow-400 border border-yellow-500/20 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)} 
                          className="py-2 px-3 text-sm bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleLockRoom(room.id)} 
                          className="py-2 px-3 text-sm bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-800/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Rooms Found</h3>
            <p className="text-gray-500 mb-6">Create a new room to get started with your Guess-It game.</p>
            <button
              onClick={handleAddRoom}
              className="text-purple-400 hover:text-purple-300 font-medium hover:underline"
            >
              + Create your first room
            </button>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121b] border border-gray-700/50 w-full max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <GuessItRoomForm
              room={editingRoom}
              onSave={handleSaveRoom}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface GuessItRoomFormProps {
  room: GuessItRoom | null;
  onSave: (room: Omit<GuessItRoom, 'id' | 'isLocked'>) => void;
  onCancel: () => void;
}

function GuessItRoomForm({ room, onSave, onCancel }: GuessItRoomFormProps) {
  const [formData, setFormData] = useState({
    title: room?.title || '',
    desc: room?.desc || '',
    user_password: room?.user_password || '',
    mod_password: room?.mod_password || '',
  });
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showModPassword, setShowModPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 bg-gray-900/30 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">
          {room ? 'Edit' : 'Add'} Guess-It Room
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1.5">Title</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-700/50 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600"
            placeholder="e.g. Weekly Trivia Night"
            required
          />
        </div>
        
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
          <textarea
            id="desc"
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-700/50 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600 resize-none"
            rows={3}
            placeholder="Brief description of the room..."
            required
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user_password" className="block text-sm font-medium text-gray-400 mb-1.5">User Password <span className="text-gray-600">(Optional)</span></label>
            <div className="relative">
              <input
                id="user_password"
                type={showUserPassword ? 'text' : 'password'}
                value={formData.user_password}
                onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
                className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-700/50 rounded-xl py-2.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600"
              />
              <button type="button" onClick={() => setShowUserPassword(!showUserPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showUserPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="mod_password" className="block text-sm font-medium text-gray-400 mb-1.5">Moderator Password <span className="text-gray-600">(Optional)</span></label>
            <div className="relative">
              <input
                id="mod_password"
                type={showModPassword ? 'text' : 'password'}
                value={formData.mod_password}
                onChange={(e) => setFormData({ ...formData, mod_password: e.target.value })}
                className="w-full bg-[#0a0a0f] text-gray-200 border border-gray-700/50 rounded-xl py-2.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600"
              />
              <button type="button" onClick={() => setShowModPassword(!showModPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showModPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5"
          >
            Save Room
          </button>
        </div>
      </form>
    </>
  );
}
