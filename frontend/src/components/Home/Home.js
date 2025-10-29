import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center -mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to SkillSwap
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Learn new skills and share your expertise with others
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Learn</h3>
            <p className="text-gray-600">
              Connect with teachers and learn new skills from experts in your community
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Teach</h3>
            <p className="text-gray-600">
              Share your knowledge and help others grow by teaching skills you're passionate about
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Connect</h3>
            <p className="text-gray-600">
              Build meaningful connections with like-minded learners in your community
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to get started?
          </h2>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-8 rounded-lg text-lg transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

