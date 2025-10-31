import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import SearchAndFilter from './SearchAndFilter';

const Matches = () => {
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(null);

  // --- 1. REMOVED requestTime state ---
  // const [requestTime, setRequestTime] = useState(''); 

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await api.get(`/skills/matches/?${params.toString()}`);
      setFilteredMatches(response.data);

    } catch (error) {
      toast.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [searchQuery, selectedCategory]);

  // --- 2. UPDATED handleRequestSession ---
  const handleRequestSession = async (teacherId, skillId) => {
    // REMOVED the time check

    try {
      await api.post('/sessions/', {
        teacher_id: teacherId,
        skill_id: skillId,
        // REMOVED scheduled_time
      });
      toast.success('Session requested successfully!');
      setShowRequestForm(null);
      // REMOVED setRequestTime('')
      fetchMatches();
    } catch (error) {
      toast.error('Failed to request session');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Find Learning Matches</h1>

      <SearchAndFilter
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredMatches.length === 0 && !searchQuery && !selectedCategory ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            No matches found. Update your "Skills to Learn" in your profile to find teachers!
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            No matches found with your current filters. Try adjusting your search or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <div key={match.user_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex flex-col items-center mb-4">
                <img
                  src={match.image || '/default.jpg'}
                  alt={match.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-600 mb-3"
                />
                <h3 className="text-xl font-semibold text-gray-800">{match.username}</h3>

                {match.is_busy && (
                  <span className="mt-1 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {match.active_session_end_time
                      ? `Busy until ${new Date(match.active_session_end_time).toLocaleString('en-GB', { 
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

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Skills to Teach:</p>
                <div className="flex flex-wrap gap-2">
                  {match.skills_to_teach?.map((skill) => (
                    <span key={skill.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {match.bio && (
                <p className="text-gray-600 text-sm mb-4">{match.bio}</p>
              )}

              {/* --- 3. UPDATED THE REQUEST FORM --- */}
              {showRequestForm === match.user_id ? (
                <div className="space-y-3">

                  {/* REMOVED the datetime-local input */}
                  <p className="text-sm text-center text-gray-700">
                    Send a session request to {match.username}?
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequestSession(match.user_id, match.skills_to_teach[0]?.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Confirm Request
                    </button>
                    <button
                      onClick={() => setShowRequestForm(null)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowRequestForm(match.user_id)}
                    className={`w-full font-semibold py-2 px-4 rounded-lg ${match.is_busy
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    disabled={match.is_busy}
                  >
                    {match.is_busy ? 'User is Busy' : 'Request Session'}
                  </button>

                  <button
                    onClick={() => navigate(`/profile/${match.user_id}`)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                  >
                    View Profile
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;