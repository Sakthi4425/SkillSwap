import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import FeedbackModal from './FeedbackModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesValue, setNotesValue] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(null);
  const [sessionsWithFeedback, setSessionsWithFeedback] = useState({});

  // --- NEW STATE FOR THE SCHEDULING FORM ---
  const [schedulingSession, setSchedulingSession] = useState(null);
  const [scheduleData, setScheduleData] = useState({ start: '', end: '' });

  useEffect(() => {
    if (user) {
        fetchSessions();
    }
  }, [user]); // Add user dependency

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions/');
      setSessions(response.data);

      // Fetch feedback for completed sessions
      for (const session of response.data) {
        if (session.status === 'completed' && session.learner.username === user.username) {
          try {
            const feedbackResponse = await api.get(`/sessions/${session.id}/get_feedback/`);
            if (feedbackResponse.data) {
              setSessionsWithFeedback(prev => ({
                ...prev,
                [session.id]: feedbackResponse.data
              }));
            }
          } catch (error) {
            // No feedback found, which is fine
          }
        }
      }
    } catch (error) {
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  // This function is now ONLY for 'completed' or 'cancelled'
  const updateStatus = async (sessionId, newStatus) => {
    try {
      await api.post(`/sessions/${sessionId}/update_status/`, { status: newStatus });
      toast.success('Session updated successfully');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  // --- NEW FUNCTION TO CONFIRM AND SET TIME ---
  const handleConfirmSession = async (e) => {
    e.preventDefault();
    if (!scheduleData.start || !scheduleData.end) {
        toast.error("Please set both a start and end time.");
        return;
    }
    try {
        await api.post(`/sessions/${schedulingSession.id}/update_status/`, { 
            status: 'confirmed',
            scheduled_time: scheduleData.start,
            end_time: scheduleData.end
        });
        toast.success('Session confirmed and time set!');
        setSchedulingSession(null);
        setScheduleData({ start: '', end: '' });
        fetchSessions();
    } catch (error) {
        toast.error('Failed to confirm session');
    }
  };


  const updateMeetingLink = async (sessionId, meetingLink) => {
    try {
      await api.post(`/sessions/${sessionId}/update_meeting_link/`, { meeting_link: meetingLink });
      toast.success('Meeting link updated');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to update meeting link');
    }
  };

  const handleAddMeetingLink = async (sessionId) => {
    const link = prompt('Enter meeting link:');
    if (link) {
      await updateMeetingLink(sessionId, link);
    }
  };

  const updateNotes = async (sessionId) => {
    try {
      await api.post(`/sessions/${sessionId}/update_notes/`, { notes: notesValue });
      toast.success('Notes updated successfully');
      setEditingNotes(null);
      setNotesValue('');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to update notes');
    }
  };

  const handleEditNotes = (session) => {
    setEditingNotes(session.id);
    setNotesValue(session.notes || '');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending' },
      confirmed: { color: 'blue', text: 'Ongoing' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Sessions</h1>

      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No sessions yet. Start by finding matches!</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {session.skill?.name || 'Session'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    <strong>{session.teacher.username === user.username ? 'Teaching' : 'Learning'}:</strong>{' '}
                    {session.teacher.username === user.username
                      ? session.learner.username
                      : session.teacher.username}
                  </p>
                  
                  {/* --- UPDATED SCHEDULED TIME DISPLAY --- */}
                  {session.scheduled_time ? (
                    <>
                      <p className="text-gray-600 mb-1">
                        <strong>Start:</strong>{' '}
                        {new Date(session.scheduled_time).toLocaleString('en-GB', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong>End:</strong>{' '}
                        {new Date(session.end_time).toLocaleString('en-GB', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-600 mb-2">
                      <strong>Scheduled:</strong>{' '}
                      <span className="text-yellow-700 font-medium">Not yet scheduled</span>
                    </p>
                  )}
                  
                  {session.meeting_link && (
                    <p className="text-blue-600 mb-2">
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                        🔗 Meeting Link
                      </a>
                    </p>
                  )}

                  {/* Notes Section */}
                  {editingNotes === session.id ? (
                    <div className="mt-4">
                      <textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows="3"
                        placeholder="Add notes for this session..."
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => updateNotes(session.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(null);
                            setNotesValue('');
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      {session.notes ? (
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg mb-2">
                          📝 {session.notes}
                        </p>
                      ) : null}
                      {/* Only show Add/Edit Notes if session is not cancelled */}
                      {session.status !== 'cancelled' && (
                        <button
                          onClick={() => handleEditNotes(session)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {session.notes ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* --- UPDATED TEACHER ACTION BUTTONS --- */}
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(session.status)}
                  
                  {session.teacher.username === user.username && (
                    <>
                      {/* IF SCHEDULING, SHOW THE FORM */}
                      {schedulingSession && schedulingSession.id === session.id ? (
                        <form onSubmit={handleConfirmSession} className="mt-4 p-4 bg-gray-50 rounded-lg w-full">
                          <h4 className="font-semibold mb-2 text-gray-800 text-sm">Set Session Time</h4>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700">Start Time</label>
                            <input 
                                type="datetime-local"
                                value={scheduleData.start}
                                onChange={(e) => setScheduleData({ ...scheduleData, start: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                required
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700">End Time</label>
                            <input 
                                type="datetime-local"
                                value={scheduleData.end}
                                onChange={(e) => setScheduleData({ ...scheduleData, end: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                required
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">Save</button>
                            <button type="button" onClick={() => setSchedulingSession(null)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-sm">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        /* OTHERWISE, SHOW NORMAL BUTTONS */
                        <div className="flex space-x-2">
                          {session.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setSchedulingSession(session)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Set Time & Confirm
                              </button>
                              <button
                                onClick={() => updateStatus(session.id, 'cancelled')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {session.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(session.id, 'completed')}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Complete
                            </button>
                          )}
                          {session.status === 'confirmed' && !session.meeting_link && (
                            <button
                              onClick={() => handleAddMeetingLink(session.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Add Link
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Feedback Section for Learners */}
                  {session.learner.username === user.username && session.status === 'completed' && (
                    <div className="mt-4">
                      {sessionsWithFeedback[session.id] ? (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-green-800 mb-1">
                            ⭐ Your Feedback:
                          </p>
                          <div className="flex items-center mb-2">
                            <span className="text-2xl">
                              {'⭐'.repeat(sessionsWithFeedback[session.id].rating)}
                            </span>
                            <span className="ml-2 text-gray-600">
                              ({sessionsWithFeedback[session.id].rating}/5)
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            "{sessionsWithFeedback[session.id].comment}"
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowFeedbackModal(session)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Leave Feedback
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          session={showFeedbackModal}
          onClose={() => setShowFeedbackModal(null)}
          onFeedbackSubmitted={fetchSessions}
        />
      )}
    </div>
  );
};

export default Dashboard;