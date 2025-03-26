import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import Connection from './database/connnectMongoDB.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import meetingRoutes from './routes/meetings.js';
// import momRoutes from './routes/mom.js';
// import taskRoutes from './routes/tasks.js';

const app = express()
const port = 3000

Connection();
// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/meetings', meetingRoutes);
// app.use('/api/mom', momRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
    res.send('Hey user');
})
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});