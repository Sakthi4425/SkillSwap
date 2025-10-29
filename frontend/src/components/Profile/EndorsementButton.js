import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const EndorsementButton = ({ userId, skillId, skillName }) => {
  const { user } = useAuth();
  const [endorsed, setEndorsed] = useState(false);
  const [endorsementCount, setEndorsementCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id !== parseInt(userId)) {
      checkEndorsement();
      fetchEndorsementCount();
    }
  }, [userId, skillId, user]);

  const checkEndorsement = async () => {
    try {
      // Get all endorsements for this user
      const response = await api.get(`/endorsements/for_user/?user_id=${userId}`);
      const endorsement = response.data.find(
        (e) => e.skill === skillId && e.endorser === user.id
      );
      setEndorsed(!!endorsement);
    } catch (error) {
      // No endorsements or error
    }
  };

  const fetchEndorsementCount = async () => {
    try {
      const response = await api.get(`/endorsements/for_user/?user_id=${userId}`);
      const count = response.data.filter((e) => e.skill === skillId).length;
      setEndorsementCount(count);
    } catch (error) {
      // Ignore
    }
  };

  const handleEndorse = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (endorsed) {
        // Remove endorsement (optional - you might want to keep it)
        toast.info('Endorsement removed');
        setEndorsed(false);
        setEndorsementCount(endorsementCount - 1);
      } else {
        await api.post('/endorsements/', {
          endorsee: userId,
          skill: skillId,
        });
        
        toast.success(`Endorsed for ${skillName}!`);
        setEndorsed(true);
        setEndorsementCount(endorsementCount + 1);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Already endorsed this skill');
      } else {
        toast.error('Failed to endorse');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show for own profile
  if (!user || user.id === parseInt(userId)) {
    return null;
  }

  return (
    <button
      onClick={handleEndorse}
      disabled={loading}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition ${
        endorsed
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {endorsed ? '✓ Endorsed' : '+ Endorse'}
      {endorsementCount > 0 && (
        <span className="ml-2 text-xs">{endorsementCount}</span>
      )}
    </button>
  );
};

export default EndorsementButton;

