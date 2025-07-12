import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questions`);
      setQuestions(response.data);
    } catch (error) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading questions...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Latest Questions</h1>
        {user && (
          <Link to="/ask" className="btn btn-primary">
            Ask a Question
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="empty-state">
          <h3>No questions yet</h3>
          <p>Be the first to ask a question!</p>
          {user && (
            <Link to="/ask" className="btn btn-primary">
              Ask the First Question
            </Link>
          )}
        </div>
      ) : (
        <div>
          {questions.map((question) => (
            <div key={question.id} className="question-card">
              <Link to={`/questions/${question.id}`} className="question-title">
                {question.title}
              </Link>
              <div className="question-meta">
                Asked by <strong>{question.user_name}</strong> on {formatDate(question.created_at)}
              </div>
              <div className="question-description">
                {question.description.length > 200 
                  ? `${question.description.substring(0, 200)}...` 
                  : question.description
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
