import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function QuestionDetail() {
  const [question, setQuestion] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answerError, setAnswerError] = useState('');
  
  const { id } = useParams();
  const { user } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      setError('Failed to fetch question');
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAnswerError('');

    try {
      const response = await axios.post(`${API_URL}/api/questions/${id}/answers`, {
        content: newAnswer
      });

      if (response.status === 201) {
        setNewAnswer('');
        // Refresh the question to show the new answer
        await fetchQuestion();
      }
    } catch (error) {
      setAnswerError(error.response?.data?.error || 'Failed to post answer');
      console.error('Error posting answer:', error);
    } finally {
      setSubmitting(false);
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
    return <div className="loading">Loading question...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <br />
        <Link to="/">← Back to Questions</Link>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="empty-state">
        <h3>Question not found</h3>
        <Link to="/" className="btn btn-primary">← Back to Questions</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="nav-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Questions
      </Link>
      
      {/* Question */}
      <div className="question-card">
        <h1 style={{ marginBottom: '1rem', color: '#333' }}>{question.title}</h1>
        <div className="question-meta">
          Asked by <strong>{question.user_name}</strong> on {formatDate(question.created_at)}
        </div>
        <div className="question-description" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          {question.description.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < question.description.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Answers Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>
          {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? 's' : ''}
        </h3>

        {question.answers && question.answers.length > 0 ? (
          question.answers.map((answer) => (
            <div key={answer.id} className="answer-card">
              <div className="answer-meta">
                Answered by <strong>{answer.user_name}</strong> on {formatDate(answer.created_at)}
              </div>
              <div className="answer-content">
                {answer.content.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < answer.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No answers yet. Be the first to answer!</p>
          </div>
        )}
      </div>

      {/* Answer Form */}
      {user ? (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Your Answer</h4>
          
          {answerError && (
            <div className="alert alert-error">
              {answerError}
            </div>
          )}
          
          <form onSubmit={handleSubmitAnswer}>
            <div className="form-group">
              <textarea
                className="form-control"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Write your answer here..."
                rows="6"
                required
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !newAnswer.trim()}
            >
              {submitting ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p>Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to post an answer.</p>
        </div>
      )}
    </div>
  );
}

export default QuestionDetail;
