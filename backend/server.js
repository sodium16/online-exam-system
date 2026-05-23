require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/exams',  require('./routes/exams'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/admin',  require('./routes/admin'));

app.get('/', (_req, res) => res.json({ status: 'Online Exam API running successfully' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
