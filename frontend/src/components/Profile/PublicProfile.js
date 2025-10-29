import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import EndorsementButton from './EndorsementButton';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endorsements, setEndorsements] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchEndorsements();
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

  const fetchEndorsements = async () => {
    try {
      const response = await api.get(`/endorsements/for_user/?user_id=${userId}`);
      setEndorsements(response.data);
    } catch (error) {
      // Endorsements might not exist, that's ok
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
              <div key={skill.id} className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {skill.name}
                </span>
                <EndorsementButton
                  userId={userId}
                  skillId={skill.id}
                  skillName={skill.name}
                />
              </div>
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

        {endorsements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Endorsements ({endorsements.length})
            </h2>
            <div className="space-y-2">
              {endorsements.map((endorsement) => (
                <div key={endorsement.id} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{endorsement.endorser_username}</span> endorsed
                    for <span className="font-semibold text-blue-600">{endorsement.skill_name}</span>
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

