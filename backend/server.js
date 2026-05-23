require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/exams',  require('./routes/exams'));
app.use('/api/scores', require('./routes/scores'));

app.get('/', (req, res) => res.json({ status: 'Online Exam API running ✅' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
