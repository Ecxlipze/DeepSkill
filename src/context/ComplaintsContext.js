import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const ComplaintsContext = createContext();

export const ComplaintsProvider = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      let query = supabase.from('complaints').select(`
        *,
        messages:complaint_messages(*)
      `).order('updated_at', { ascending: false });

      // Apply filtering based on role
      if (user.role === 'student') {
        query = query.eq('student_cnic', user.cnic);
      } else if (user.role === 'teacher') {
        query = query.eq('send_to', 'My Batch Teacher');
        const filters = [];
        if (user.batch) filters.push(`batch.eq.${user.batch}`);
        if (user.assigned_course) filters.push(`course.eq.${user.assigned_course}`);
        if (filters.length > 0) query = query.or(filters.join(','));
      } else if (user.role === 'admin') {
        query = query.eq('send_to', 'Admin');
      }

      const { data, error } = await query;
      if (error) throw error;

      const processedData = data.map(complaint => ({
        ...complaint,
        messages: (complaint.messages || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }));

      setComplaints(processedData);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();

      // Real-time Subscription - Listening to all changes in the public schema
      const channel = supabase
        .channel('complaints-channel')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'complaints' 
        }, (payload) => {
          console.log('Complaint change detected:', payload);
          fetchComplaints();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'complaint_messages' 
        }, (payload) => {
          console.log('Message change detected:', payload);
          fetchComplaints();
        })
        .subscribe((status) => {
          console.log('Supabase real-time status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const createComplaint = async (complaintData, initialMessage) => {
    try {
      const { data: newComplaint, error: compError } = await supabase
        .from('complaints')
        .insert([{
          ...complaintData,
          student_name: user.name,
          student_cnic: user.cnic,
          batch: user.batch,
          course: user.assigned_course || user.course || 'General'
        }])
        .select()
        .single();

      if (compError) throw compError;

      const { error: msgError } = await supabase
        .from('complaint_messages')
        .insert([{
          complaint_id: newComplaint.id,
          sender_role: 'student',
          sender_name: user.name,
          text: initialMessage
        }]);

      if (msgError) throw msgError;

      await fetchComplaints();
      return newComplaint;
    } catch (err) {
      console.error('Error creating complaint:', err);
      throw err;
    }
  };

  const sendMessage = async (complaintId, text) => {
    try {
      const { error } = await supabase
        .from('complaint_messages')
        .insert([{
          complaint_id: complaintId,
          sender_role: user.role,
          sender_name: user.name,
          text: text
        }]);

      if (error) throw error;

      const newStatus = user.role === 'student' ? 'Open' : 'Pending Reply';
      await supabase
        .from('complaints')
        .update({ updated_at: new Date().toISOString(), status: newStatus })
        .eq('id', complaintId);

      // fetchComplaints will be called by real-time subscription or manually
      await fetchComplaints();
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const closeComplaint = async (id) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'Closed', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchComplaints();
    } catch (err) {
      console.error('Error closing complaint:', err);
      throw err;
    }
  };

  const reopenComplaint = async (id) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'Open', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchComplaints();
    } catch (err) {
      console.error('Error reopening complaint:', err);
      throw err;
    }
  };

  const toggleUrgent = async (id, currentUrgent) => {
    try {
      const newPriority = currentUrgent === 'Urgent' ? 'Normal' : 'Urgent';
      const { error } = await supabase
        .from('complaints')
        .update({ priority: newPriority })
        .eq('id', id);

      if (error) throw error;
      await fetchComplaints();
    } catch (err) {
      console.error('Error toggling priority:', err);
      throw err;
    }
  };

  return (
    <ComplaintsContext.Provider value={{ 
      complaints, 
      loading, 
      fetchComplaints, 
      createComplaint, 
      sendMessage, 
      closeComplaint,
      reopenComplaint,
      toggleUrgent 
    }}>
      {children}
    </ComplaintsContext.Provider>
  );
};

export const useComplaints = () => useContext(ComplaintsContext);
