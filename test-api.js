const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Testing StackIt API...\n');

  try {
    // Test registration
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✓ Registration successful');
    const token = registerResponse.data.token;

    // Test login
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✓ Login successful');

    // Set auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Test creating a question
    console.log('\n3. Testing question creation...');
    const questionResponse = await axios.post(`${API_BASE}/questions`, {
      title: 'How to use React hooks?',
      description: 'I am new to React and want to understand how to use hooks like useState and useEffect properly.'
    });
    console.log('✓ Question created successfully');

    // Test getting all questions
    console.log('\n4. Testing get all questions...');
    const questionsResponse = await axios.get(`${API_BASE}/questions`);
    console.log(`✓ Retrieved ${questionsResponse.data.length} questions`);
    
    const questionId = questionsResponse.data[0]?.id;
    if (questionId) {
      // Test getting single question
      console.log('\n5. Testing get single question...');
      const singleQuestionResponse = await axios.get(`${API_BASE}/questions/${questionId}`);
      console.log('✓ Single question retrieved');

      // Test creating an answer
      console.log('\n6. Testing answer creation...');
      const answerResponse = await axios.post(`${API_BASE}/questions/${questionId}/answers`, {
        content: 'React hooks are functions that let you use state and other React features in functional components. useState manages local state, while useEffect handles side effects like API calls.'
      });
      console.log('✓ Answer created successfully');

      // Test getting question with answers
      console.log('\n7. Testing get question with answers...');
      const questionWithAnswersResponse = await axios.get(`${API_BASE}/questions/${questionId}`);
      console.log(`✓ Question with ${questionWithAnswersResponse.data.answers.length} answers retrieved`);
    }

    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('\n❌ API test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
