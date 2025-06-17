import express from 'express';

const app = express();
const PORT = process.env.PORT || 8002;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'user-service', 
    timestamp: new Date().toISOString(),
    version: '1.0.0' 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'User Service',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /health',
      'GET /',
      'GET /users',
      'GET /users/:id',
      'POST /users',
      'PUT /users/:id',
      'DELETE /users/:id'
    ]
  });
});

// Mock user data
const mockUsers = [
  { id: '1', navn: 'Test Bruker 1', email: 'test1@example.com', bedriftId: 'b1' },
  { id: '2', navn: 'Test Bruker 2', email: 'test2@example.com', bedriftId: 'b1' },
  { id: '3', navn: 'Test Bruker 3', email: 'test3@example.com', bedriftId: 'b2' }
];

// User endpoints
app.get('/users', (req, res) => {
  res.json({ 
    users: mockUsers,
    total: mockUsers.length,
    success: true
  });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = mockUsers.find(u => u.id === id);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  res.json({ user, success: true });
});

app.post('/users', (req, res) => {
  const { navn, email, bedriftId } = req.body;
  const newUser = {
    id: (mockUsers.length + 1).toString(),
    navn,
    email,
    bedriftId
  };
  
  mockUsers.push(newUser);
  res.status(201).json({ user: newUser, success: true });
});

app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { navn, email, bedriftId } = req.body;
  const userIndex = mockUsers.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  mockUsers[userIndex] = { ...mockUsers[userIndex], navn, email, bedriftId };
  res.json({ user: mockUsers[userIndex], success: true });
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = mockUsers.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  const deletedUser = mockUsers.splice(userIndex, 1)[0];
  res.json({ user: deletedUser, success: true });
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
}); 