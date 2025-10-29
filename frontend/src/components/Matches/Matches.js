import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import SearchAndFilter from './SearchAndFilter';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(null);
  const [requestTime, setRequestTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, searchQuery, selectedCategory]);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/skills/matches/');
      setMatches(response.data);
    } catch (error) {
      toast.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = [...matches];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((match) => {
        const skillsText = match.skills_to_teach
          ?.map((skill) => skill.name.toLowerCase())
          .join(' ');
        return (
          match.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skillsText?.includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((match) => {
        return match.skills_to_teach?.some(
          (skill) => skill.category === selectedCategory
        );
      });
    }

    setFilteredMatches(filtered);
  };

  const handleRequestSession = async (teacherId, skillId) => {
    if (!requestTime) {
      toast.error('Please select a time for the session');
      return;
    }

    try {
      await api.post('/sessions/', {
        teacher_id: teacherId,
        skill_id: skillId,
        scheduled_time: requestTime,
      });
      toast.success('Session requested successfully!');
      setShowRequestForm(null);
      setRequestTime('');
      fetchMatches();
    } catch (error) {
      toast.error('Failed to request session');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Find Learning Matches</h1>
      
      {/* Search and Filter Component */}
      <SearchAndFilter
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      {matches.length === 0 ? (
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
              
              {showRequestForm === match.user_id ? (
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    value={requestTime}
                    onChange={(e) => setRequestTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequestSession(match.user_id, match.skills_to_teach[0]?.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Request
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Request Session
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

