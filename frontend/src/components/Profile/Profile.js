import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    skills_to_teach: '',
    skills_to_learn: '',
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    // We check user.profile here because the `user` object from AuthContext
    // now contains the nested profile data, including 'received_feedback'
    if (user && user.profile) {
      setProfile(user.profile);
      setFormData({
        bio: user.profile.bio || '',
        skills_to_teach: user.profile.skills_to_teach?.map(s => s.name).join(', ') || '',
        skills_to_learn: user.profile.skills_to_learn?.map(s => s.name).join(', ') || '',
        image: null,
        imagePreview: user.profile.image || null,
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('bio', formData.bio);
    formDataToSend.append('skills_to_teach', formData.skills_to_teach);
    formDataToSend.append('skills_to_learn', formData.skills_to_learn);
    
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await api.post(`/users/${user.id}/update_profile/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Update the user in AuthContext with the new profile data
      updateUser({ ...user, profile: response.data });
      setProfile(response.data); // Also update local state
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  // This is the "View Profile" mode
  if (!editing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Edit Profile
            </button>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <img
              src={profile?.image || '/default.jpg'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Bio</h3>
              <p className="text-gray-800">{profile?.bio || 'No bio added yet'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Skills to Teach</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.skills_to_teach?.length > 0 ? (
                  profile.skills_to_teach.map((skill) => (
                    <span key={skill.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Skills to Learn</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.skills_to_learn?.length > 0 ? (
                  profile.skills_to_learn.map((skill) => (
                    <span key={skill.id} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            </div>

            {/* --- THIS IS THE NEW FEEDBACK SECTION --- */}
            {profile.received_feedback && profile.received_feedback.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Feedback You've Received
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
                        - {feedback.learner_username} for {feedback.skill_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* --- END OF NEW FEEDBACK SECTION --- */}

          </div>
        </div>
      </div>
    );
  }

  // This is the "Edit Profile" mode (no changes here)
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={formData.imagePreview || '/default.jpg'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-600"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills You Can Teach (comma-separated)
            </label>
            <input
              type="text"
              name="skills_to_teach"
              value={formData.skills_to_teach}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Python, Guitar, Cooking"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills You Want to Learn (comma-separated)
            </label>
            <input
              type="text"
              name="skills_to_learn"
              value={formData.skills_to_learn}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="React, Spanish, Piano"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;