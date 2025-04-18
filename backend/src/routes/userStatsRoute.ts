import { Router } from 'express';
import { db } from '../firebase'; // Adjust if needed
import { collection, getDocs, query, where } from 'firebase/firestore';

const router = Router();

router.get('/:uid/stats', async (req, res) => {
  const { uid } = req.params;

  try {
    const meetingsSnap = await getDocs(query(collection(db, 'upcoming_meetings'), where('userId', '==', uid)));
    const transcriptionsSnap = await getDocs(query(collection(db, 'meeting_analysis'), where('userId', '==', uid)));

    // Count total number of task objects and uncompleted tasks in all transcriptions
    let totalTasks = 0;
    let uncompletedTasks = 0;

    transcriptionsSnap.forEach(doc => {
      const data = doc.data();
      const tasks = data.tasks || [];
      
      if (Array.isArray(tasks)) {
        totalTasks += tasks.length;
        
        // Count uncompleted tasks (where completed is not true)
        const incompleteTasks = tasks.filter(task => !task.completed);
        uncompletedTasks += incompleteTasks.length;
      }
    });

    res.json({
      meetings: meetingsSnap.size,
      transcriptions: transcriptionsSnap.size,
      tasks: totalTasks,
      uncompletedTasks: uncompletedTasks
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Error fetching user stats' });
  }
});

export default router;