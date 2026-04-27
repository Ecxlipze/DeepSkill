import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const GroupChatContext = createContext();

export const GroupChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeBatch, setActiveBatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [mutes, setMutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parse batches and courses (handle comma separated strings)
  const availableBatches = useMemo(() => {
    if (!user?.batch) return [];
    const batchList = user.batch.split(',').map(b => b.trim());
    const courseList = user.assigned_course ? user.assigned_course.split(',').map(c => c.trim()) : [];
    
    return batchList.map((batch, index) => ({
      batch,
      course: courseList[index] || user.assigned_course || "General Course"
    }));
  }, [user?.batch, user?.assigned_course]);

  useEffect(() => {
    if (availableBatches.length > 0 && !activeBatch) {
      setActiveBatch(availableBatches[0].batch);
    }
  }, [availableBatches, activeBatch]);

  const fetchMembers = useCallback(async () => {
    if (!activeBatch) return;
    try {
      const { data, error } = await supabase
        .from('allowed_cnics')
        .select('cnic, name, role, batch')
        // Check if batch column contains activeBatch (handling comma separated or exact match)
        .ilike('batch', `%${activeBatch}%`);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }, [activeBatch]);

  const fetchMutes = useCallback(async () => {
    if (!activeBatch) return;
    try {
      const { data, error } = await supabase
        .from('group_chat_mutes')
        .select('*')
        .eq('batch', activeBatch);

      if (error) throw error;
      setMutes(data || []);
    } catch (err) {
      console.error('Error fetching mutes:', err);
    }
  }, [activeBatch]);

  const fetchMessages = useCallback(async () => {
    if (!activeBatch) return;
    try {
      const { data, error } = await supabase
        .from('group_chat_messages')
        .select('*')
        .eq('batch', activeBatch)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [activeBatch]);

  useEffect(() => {
    if (activeBatch) {
      setLoading(true);
      Promise.all([fetchMembers(), fetchMessages(), fetchMutes()]).then(() => {
        setLoading(false);
      });

      // Real-time Subscriptions
      const channel = supabase
        .channel(`group-chat-${activeBatch}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_chat_messages', filter: `batch=eq.${activeBatch}` }, () => {
          fetchMessages();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_chat_mutes', filter: `batch=eq.${activeBatch}` }, () => {
          fetchMutes();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'allowed_cnics' }, () => {
          fetchMembers();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeBatch, fetchMembers, fetchMessages, fetchMutes]);

  const sendMessage = async (messageData) => {
    if (!user || !activeBatch || isMuted) return;
    try {
      const { error } = await supabase
        .from('group_chat_messages')
        .insert([{
          ...messageData,
          batch: activeBatch,
          sender_cnic: user.cnic,
          sender_name: user.name,
          sender_role: user.role,
          reactions: []
        }]);
      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const sendReaction = async (messageId, emoji) => {
    try {
      const msg = messages.find(m => m.id === messageId);
      if (!msg) return;

      let newReactions = [...(msg.reactions || [])];
      const existingIdx = newReactions.findIndex(r => r.emoji === emoji);

      if (existingIdx > -1) {
        // Simple logic for counts (not per-user for simplicity as per requirements)
        // In a real app, you'd track which user reacted with which emoji
        newReactions[existingIdx].count += 1;
      } else {
        newReactions.push({ emoji, count: 1 });
      }

      const { error } = await supabase
        .from('group_chat_messages')
        .update({ reactions: newReactions })
        .eq('id', messageId);

      if (error) throw error;
    } catch (err) {
      console.error('Error sending reaction:', err);
    }
  };

  const muteStudent = async (studentCnic, studentName) => {
    if (user.role !== 'teacher' || !activeBatch) return;
    try {
      // 1. Add to mutes table
      const { error: muteError } = await supabase
        .from('group_chat_mutes')
        .insert([{
          batch: activeBatch,
          user_cnic: studentCnic,
          muted_by: user.name
        }]);

      if (muteError) throw muteError;

      // 2. Send system message
      await sendMessage({
        type: 'system',
        text: `⚠️ ${studentName} has been muted by the teacher.`
      });

      // 3. Send warning bubble (visible to student via type='warning' and matching cnic logic in UI)
      await sendMessage({
        type: 'warning',
        text: `You have been muted by Sir ${user.name}. You cannot send messages until unmuted.`,
        sender_cnic: 'SYSTEM', // Special marker
        target_cnic: studentCnic // Extra field for targeted warning
      });

    } catch (err) {
      console.error('Error muting student:', err);
    }
  };

  const unmuteStudent = async (studentCnic, studentName) => {
    if (user.role !== 'teacher' || !activeBatch) return;
    try {
      const { error: muteError } = await supabase
        .from('group_chat_mutes')
        .delete()
        .eq('batch', activeBatch)
        .eq('user_cnic', studentCnic);

      if (muteError) throw muteError;

      // Send system message
      await sendMessage({
        type: 'system',
        text: `✅ ${studentName} has been unmuted.`
      });
    } catch (err) {
      console.error('Error unmuting student:', err);
    }
  };

  const isMuted = mutes.some(m => m.user_cnic === user?.cnic);

  return (
    <GroupChatContext.Provider value={{
      activeBatch,
      setActiveBatch,
      availableBatches,
      messages,
      members,
      mutes,
      loading,
      isMuted,
      sendMessage,
      sendReaction,
      muteStudent,
      unmuteStudent,
      fetchMessages
    }}>
      {children}
    </GroupChatContext.Provider>
  );
};

export const useGroupChat = () => useContext(GroupChatContext);
