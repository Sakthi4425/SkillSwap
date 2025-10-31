import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}/`);
      setProfile(response.data.profile); 
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <button
          onClick={() => navigate('/matches')}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Matches
        </button>

        <div className="flex flex-col items-center mb-6">
          <img
            src={profile.image || '/default.jpg'}
            alt={profile.username}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
          
          {/* --- ADDED THIS BUSY BADGE --- */}
          {profile.is_busy && (
            <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
              {profile.active_session_end_time
                ? `Busy until ${new Date(profile.active_session_end_time).toLocaleString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true
                  })}`
                : 'Currently in a session'
              }
            </span>
          )}
        </div>

        {profile.bio && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">About</h2>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Skills to Teach</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {profile.skills_to_teach?.map((skill) => (
              <span key={skill.id} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        {profile.skills_to_learn && profile.skills_to_learn.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Want to Learn</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills_to_learn.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.received_feedback && profile.received_feedback.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Feedback ({profile.received_feedback.length})
            </h2>
            <div className="space-y-3">
              {profile.received_feedback.map((feedback) => (
                <div key={feedback.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl" role="img" aria-label="star">
                      {'⭐'.repeat(feedback.rating)}
                    </span>
                    <span className="ml-2 text-gray-600 font-semibold">
                      ({feedback.rating}/5)
                    </span>
                  </div>
                  <p className="text-gray-700 italic mb-2">
                    "{feedback.comment}"
                  </p>
                  <p className="text-sm text-gray-500 text-right">
                    - {feedback.learner_username} on {feedback.skill_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;