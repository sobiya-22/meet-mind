import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import useAuth from './hooks/useAuth';
import Constants from 'expo-constants';

const { IP_ADDRESS, BACKEND_PORT } = Constants.expoConfig?.extra || {};

// Updated Task interface to match the new API response format
interface Task {
  title: string;
  dueDate: string | null;
}

interface Meeting {
  id: string;
  title: string;
  timestamp: number;
  participants: string[];
  source: string;
  transcript: string;
  summary: string;
  tasks: Task[]; // Updated to match the new task format
  minutes: string[];
}

export default function MeetingDetailsScreen() {
  const { user } = useAuth();
  const { itemid } = useLocalSearchParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    // if (!user?.uid) {
    //   setError("User authentication required");
    //   setLoading(false);
    //   return;
    // }
    const fetchMeetingDetails = async () => {
      try {
        // Adding error handling for the fetch operation
        console.log('id:', itemid);
        // console.log("User from auth:", user.uid);

        const response = await fetch(`http://${IP_ADDRESS}:${BACKEND_PORT}/api/meet/meetings/${itemid}`, {
          method: 'GET',
          headers: {
            // 'x-user-id': user.uid,
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        // console.log('API Response:', data);
        setMeeting(data);

      } catch (err) {
        console.error("Error fetching meeting details:", err);
        setError(`Failed to load meeting: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [itemid]);

  // Updated to render the task with title and due date
  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <MaterialIcons name="assignment" size={20} color="#023c8a" />
        <Text style={styles.taskTitle}>{item.title}</Text>
      </View>
      {item.dueDate && (
        <View style={styles.taskDueDateContainer}>
          <MaterialIcons name="event" size={16} color="#023c8a" />
          <Text style={styles.taskDueDate}>Due: {item.dueDate}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#023c8a" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Error</Text>
        </View>
        <View style={styles.centeredContainer}>
          <MaterialIcons name="error-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              // Re-run the effect by updating a dependency
              // This is a simple way to retry the fetch
              setMeeting(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!meeting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Not Found</Text>
        </View>
        <View style={styles.centeredContainer}>
          <Text>Meeting not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Meeting Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.meetingInfo}>
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <Text style={styles.meetingDateTime}>
            {new Date(meeting.timestamp).toLocaleDateString()} • {new Date(meeting.timestamp).toLocaleTimeString()}
          </Text>
          <Text style={styles.meetingType}>
            {meeting.source === 'live' ? 'Live Meeting' : 'Recording'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          {meeting.participants && meeting.participants.length > 0 ? (
            meeting.participants.map((name, index) => (
              <View key={index} style={styles.participantItem}>
                <MaterialIcons name="person" size={20} color="#023c8a" />
                <Text style={styles.participantName}>{name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTasksText}>No participants listed.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          <Text style={styles.sectionContent}>{meeting.transcript}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Minutes</Text>
          {meeting.minutes && meeting.minutes.length > 0 ? (
            meeting.minutes.map((minute, idx) => (
              <Text key={idx} style={styles.sectionContent}>🔶 {minute}</Text>
            ))
          ) : (
            <Text style={styles.noTasksText}>No minutes available.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.sectionContent}>{meeting.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          {meeting.tasks && meeting.tasks.length > 0 ? (
            <FlatList
              data={meeting.tasks}
              renderItem={renderTaskItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noTasksText}>No tasks assigned for this meeting.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  meetingInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  meetingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#023c8a',
  },
  meetingDateTime: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  meetingType: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#023c8a',
    marginBottom: 15,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  participantName: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  taskDueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 30,
  },
  taskDueDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#023c8a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noTasksText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  }
});