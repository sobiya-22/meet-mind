import express, { Router, Request, Response } from 'express';
import { startLiveMeetingBot, analyzeRecording } from '../controllers/meetController';
import multer from 'multer';
import { db } from '../firebase';
import { collection, getDocs, limit, orderBy, query, where, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';

const router: Router = express.Router();
const upload = multer({ dest: 'uploads/' });

interface Meeting {
  id: string;
  userId: string;
  meetingTitle: string;
  meetingDescription: string;
  meetingLink: string;
  meetingType: string;
  dateTime: Timestamp;
  createdAt: Timestamp;
}

router.post('/record', startLiveMeetingBot);
router.post('/analyze', upload.single('file'), analyzeRecording);

// ✅ GET meetings for currently signed-in user
router.get('/:id/completed-meetings', async (req: Request, res: Response) => {

    const id = req.params.id;
    // console.log('id-completed-meetings:', id);
    if (!id) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing in headers' });
    }
  
    try {
      const q = query(collection(db, 'meeting_analysis'), where('userId', '==', id));
        const snapshot = await getDocs(q); 
        if (snapshot.empty) {
            console.log('No meetings found for userId:', id);
            return res.status(404).json({ error: 'No meetings found for the user' });
        }
      const meetings = snapshot.docs.map((doc: any)  => ({ id: doc.id, ...doc.data() }));
      return res.json(meetings);
    } catch (err) {
      console.error('Error fetching user meetings:', err);
      return res.status(500).json({ error: 'Failed to fetch user meetings' });
    }
  });
  
// ✅ GET single meeting by ID
router.get('/meetings/:itemid', async (req: Request, res: Response) => {
    const itemid = req.params.itemid;
    // console.log("Fetching meeting for ID:", itemid);
    // console.log('Headers received:', req.headers);
    // console.log('User ID:', req.headers['x-user-id']);
    try {
      const docRef = doc(db, 'meeting_analysis', itemid);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
      // console.log('docSnap.data():', docSnap.data());
      return res.json(docSnap.data());
    } catch (error) {
      console.error('Error fetching meeting:', error);
      return res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});


router.get('/tasks', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing in headers' });
    }
  
    // Fetch meetings that belong to the user
    const q = query(collection(db, 'meeting_analysis'), where('userId', '==', userId));
    try {
      const snapshot = await getDocs(q); 
  
      if (snapshot.empty) {
        console.log('No meetings found for userId:', userId);
        return res.status(404).json({ error: 'No meetings found for the user' });
      }
  
      // Create an array to store all the tasks associated with the user's meetings
      const tasks: any[] = [];
  
      snapshot.forEach(doc => {
        const meetingData = doc.data();
        // Assuming tasks are stored as an array of objects in a field `tasks` within each meeting document
        if (meetingData.tasks && Array.isArray(meetingData.tasks)) {
          meetingData.tasks.forEach((task: any) => {
            // Add the meeting info along with each task
            tasks.push({
              taskId: task.id,
              taskTitle: task.title,
              meetingTitle: meetingData.meetingTitle,
              meetingDate: meetingData.meetingDate,
              dueDate: task.dueDate,
              completed: task.completed
            });
          });
        }
      });
  
      // Return the tasks as a JSON response
      return res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});
  

router.get('/recent-activity/:id', async (req, res) => {
    const { id } = req.params;
    // console.log('Received ID:', id);
    if (!id) return res.status(400).json({ error: 'User ID required' });
  
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'meeting_analysis'),
          where('userId', '==', id),
          limit(2)
        )
      );
  
      const activity = querySnapshot.docs.map(doc => ({
        id: doc.id,
          title: doc.data().title || 'Untitled',
            source: doc.data().source, 
      }));
  
      res.json({ activity });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch activity' });
    }
});
  

router.post('/add-meeting', async (req, res) => {
    const {
        userId,
        meetingTitle,
        meetingDescription,
        meetingLink,
        meetingType,
        meetingDateTime, // ISO string
      } = req.body;
    
      try {
        // Convert ISO string to Firestore Timestamp
        const dateTime = Timestamp.fromDate(new Date(meetingDateTime));
    
        const docRef = await addDoc(collection(db, 'upcoming_meetings'), {
          userId,
          meetingTitle,
          meetingDescription,
          meetingLink,
          meetingType,
          dateTime, // stored as Firestore Timestamp
          createdAt: Timestamp.now(),
        });
    
        res.status(200).json({ success: true, id: docRef.id });
      } catch (error) {
        console.error('Error adding meeting:', error);
        res.status(500).json({ error: 'Failed to add meeting' });
      }
});

router.get('/upcoming-meetings/:uid', async (req, res) => {
    const { uid } = req.params;
    const now = new Date();

    try {
      const userMeetingsSnapshot = await getDocs(
        query(collection(db, 'upcoming_meetings'), where('userId', '==', uid))
      );

      const allMeetings = userMeetingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meeting[];
      
      const upcomingMeetings = allMeetings.filter(meeting => {
        const meetingDate = meeting.dateTime.toDate();
        return meetingDate > now;
      });
    //   console.log('upcomingMeetings:', upcomingMeetings);
      upcomingMeetings.sort((a, b) => {
        const dateA = a.dateTime.toDate();
        const dateB = b.dateTime.toDate();
        return dateA.getTime() - dateB.getTime();
      });

      const recentMeetings = upcomingMeetings.slice(0, 2);

      res.json({ meetings: recentMeetings });
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
    }
});
  
router.get('/:id/all-upcoming-meetings', async (req, res) => {
    const id = req.params.id;
    // console.log('id:', id);
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
        const userMeetingsSnapshot = await getDocs(
          query(collection(db, 'upcoming_meetings'), where('userId', '==', id))
        );
  
        const upcomingMeetings = userMeetingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Meeting[];
        
        
        upcomingMeetings.sort((a, b) => {
          const dateA = a.dateTime.toDate();
          const dateB = b.dateTime.toDate();
          return dateA.getTime() - dateB.getTime();
        });
        // console.log('upcomingMeetings:', upcomingMeetings);
        res.json({ meetings: upcomingMeetings });
      } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
      }
  });
  // backend/routes/meetRoutes.js


// GET /api/meet/my-meetings
router.get('/my-meetings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: 'User ID is required' });
    // console.log('userId for my meetings:', userId);
    const snapshot = await getDocs(query(collection(db, 'meeting_analysis'), where('userId', '==', userId)));

    const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching my-meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

router.patch('/tasks/:meetingId/:taskTitle', async (req, res) => {
  const { meetingId, taskTitle } = req.params;
  const { completed } = req.body;

  try {
    const docRef = doc(db, 'meeting_analysis', meetingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const data = docSnap.data();
    if (!data?.tasks) {
      return res.status(404).json({ error: 'No tasks found' });
    }

    const updatedTasks = data.tasks.map((task: any) =>
      task.title === taskTitle ? { ...task, completed } : task
    );

    await updateDoc(docRef, { tasks: updatedTasks });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// GET a specific upcoming meeting by ID
router.get('/upcoming-meet-details/:itemid', async (req: Request, res: Response) => {
  const itemid = req.params.itemid;

  try {
    const docRef = doc(db, 'upcoming_meetings', itemid); // Match Firestore collection name
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ message: 'Upcoming meeting not found' });
    }

    // Get the raw data
    const meetingData = docSnap.data();

    // Format timestamps
    const formattedData = {
      ...meetingData,
      dateTime: meetingData.dateTime?.toDate().toISOString() || null, // Convert Timestamp to ISO string
      createdAt: meetingData.createdAt?.toDate().toISOString() || null, // Convert Timestamp to ISO string
      meetingTitle: meetingData.meetingTitle || 'Untitled Meeting',
      meetingType: meetingData.meetingType || 'not specified',
      meetingDescription: meetingData.meetingDescription || '',
      meetingLink: meetingData.meetingLink || '',
      userId: meetingData.userId || '',
    };

    return res.json(formattedData);
  } catch (error) {
    console.error('Error fetching upcoming meeting:', error);
    return res.status(500).json({ error: 'Failed to fetch upcoming meeting' });
  }
});

export default router;
