import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

interface MeetingAnalysis {
  title: string;
  source: string; // 'live', 'uploaded', or a recording URL
  transcript: string;
  summary: string;
  tasks: string[];
  minutes: string[];
  participants: string[];
  audioPath: string;
  timestamp: number;
  userId: string;
  userEmail: string;
}

export const saveMeetingAnalysis = async (data: MeetingAnalysis): Promise<string> => {
  const meetingsRef = collection(db, 'meeting_analysis');
  const docRef = await addDoc(meetingsRef, {
    ...data,
    timestamp: Date.now()
  });
  return docRef.id;
};

export const getUserMeetings = async (userId: string) => {
  const meetingsRef = collection(db, 'meeting_analysis');
  const q = query(
    meetingsRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}; 