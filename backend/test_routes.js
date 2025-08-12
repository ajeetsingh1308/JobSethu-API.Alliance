// minimal-test.js
const express = require('express');
const app = express();

// Test basic routes first
// app.get('/', (req, res) => res.json({ message: 'OK' }));
// app.get('/test/:id', (req, res) => res.json({ id: req.params.id }));
// In server.js, comment these out one by one:
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/reviews', require('./routes/reviews'));
app.listen(3001, () => console.log('Test server on 3001'));