import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Animated, Linking, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import useAuth from '../hooks/useAuth';
import Constants from 'expo-constants';

const { IP_ADDRESS, PORT } = Constants.expoConfig?.extra || {};

// Updated interfaces to match the actual API responses
interface CompletedMeeting {
  id: string;
  title: string;
  timestamp: number;
  participants: string[];
  source: string;
  audioPath: string;
  transcript: string;
  summary: string;
  tasks: string[];
  minutes: string[];
  userEmail: string;
  userId: string;
}

interface UpcomingMeeting {
  id: string;
  meetingTitle: string;
  meetingDescription: string;
  meetingLink: string;
  meetingType: string;
  dateTime: {
    seconds: number;
    nanoseconds: number;
  };
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  userId: string;
}

// Union type for display
type DisplayMeeting = {
  id: string;
  title: string;
  timestamp: number;
  isUpcoming: boolean;
  link: string;
  description?: string;
  participants: string[];
  type: string;
};

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<DisplayMeeting[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'completed'>('upcoming');
  const [highlightedMeeting, setHighlightedMeeting] = useState<string | null>(null);
  const [highlightAnimation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Only run this effect if user exists
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMeetings = async () => {
      try {
        setLoading(true);
        if (!user.uid) {
          console.error('User not authenticated or missing UID');
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        
        console.log('Fetching', selectedFilter, 'meetings for user:', user.uid);
        

        const endpoint = selectedFilter === 'completed' 
          ? `http://${IP_ADDRESS}:${PORT}/api/meet/${user.uid}/completed-meetings` 
          : `http://${IP_ADDRESS}:${PORT}/api/meet/${user.uid}/all-upcoming-meetings`;
        
        const response = await fetch(endpoint, {
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${selectedFilter} meetings: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform the data based on the meeting type
        let transformedMeetings: DisplayMeeting[] = [];
        
        if (selectedFilter === 'completed') {
          // Handle completed meetings format
          const meetingsData = Array.isArray(data) ? data : [];
          console.log(`Received ${meetingsData.length} completed meetings`);
          
          transformedMeetings = meetingsData.map((meeting: CompletedMeeting) => ({
            id: meeting.id,
            title: meeting.title,
            timestamp: meeting.timestamp,
            isUpcoming: false,
            link: meeting.audioPath,
            participants: meeting.participants || [],
            type: 'recording'
          }));
        } else {
          // Handle upcoming meetings format - which appears to be { meetings: [...] }
          const meetingsData = data.meetings ? data.meetings : [];
          console.log(`Received ${meetingsData.length} upcoming meetings`);
          
          transformedMeetings = meetingsData.map((meeting: UpcomingMeeting) => ({
            id: meeting.id,
            title: meeting.meetingTitle,
            timestamp: meeting.dateTime.seconds * 1000, // Convert to milliseconds
            isUpcoming: true,
            link: meeting.meetingLink,
            description: meeting.meetingDescription,
            participants: [], // Server doesn't provide participants for upcoming
            type: meeting.meetingType
          }));
        }
        
        setMeetings(transformedMeetings);
        setError('');
      } catch (err) {
        console.error(`Error fetching ${selectedFilter} meetings:`, err);
        setError((err as Error).message);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
  }, [user?.uid, selectedFilter]); 

  // Second useEffect - handles highlighting new meetings
  useEffect(() => {
    if (params.highlightMeeting === 'new' && params.meetingTitle) {
      const newMeeting: DisplayMeeting = {
        id: String(Date.now()),
        title: params.meetingTitle as string,
        timestamp: Date.now(),
        isUpcoming: false,
        link: params.meetingLink as string || '',
        participants: [],
        type: 'recording'
      };

      setMeetings(prev => [newMeeting, ...prev]);
      setHighlightedMeeting(newMeeting.id);
      setSelectedFilter('completed');

      Animated.sequence([
        Animated.timing(highlightAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnimation, {
          toValue: 0,
          duration: 500,
          delay: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => setHighlightedMeeting(null));
    }
  }, [params.highlightMeeting, params.meetingTitle, params.meetingLink, user?.email, user?.uid]);

  // Handle joining and recording a meeting
  const handleJoinMeeting = async (meeting: DisplayMeeting) => {
    if (isRecording) return; // Prevent multiple calls
    
    const meetingLink = meeting.link;
    const title = meeting.title;
    
    if (!meetingLink || !title) {
      Alert.alert('Error', 'Meeting link or title is missing');
      return;
    }
    
    setIsRecording(true);
    try {
      const response = await fetch(`http://${IP_ADDRESS}:${PORT}/api/meet/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetLink: meetingLink,
          meetingTitle: title
        }),
      });
      
      const data = await response.json();
      console.log('data:', data);
      if (response.ok) {
        Alert.alert('Success', 'Recording started successfully');
        
        // Navigate to meeting details with the recording data
        router.push({
          pathname: '/meeting-details',
          params: {
            meetingTitle: data.meetingTitle,
            date: data.date,
            time: data.time,
            participants: JSON.stringify(data.participants),
            duration: data.duration,
            recordingPath: data.recordingPath
          }
        });
      } else {
        Alert.alert('Error', data.error || 'Failed to start recording');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setIsRecording(false);
    }
  };

  const renderMeetingItem = ({ item }: { item: DisplayMeeting }) => {
    const isHighlighted = highlightedMeeting === item.id;
    const animatedStyle = isHighlighted
      ? {
          backgroundColor: highlightAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['#023c8a', '#e6f2ff'],
          }),
        }
      : {};

    // Format date and time from timestamp
    const date = new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const time = new Date(item.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
      <Animated.View style={[styles.meetingCard, animatedStyle]}>
        <View style={styles.meetingHeader}>
          <MaterialIcons
            name={item.isUpcoming ? 'event' : 'check-circle'}
            size={24}
            color={item.isUpcoming ? '#023c8a' : '#4CAF50'}
          />
          <View style={styles.meetingInfo}>
            <Text style={styles.meetingTitle}>{item.title}</Text>
            <Text style={styles.meetingDateTime}>{date} • {time}</Text>
            <Text style={styles.meetingType}>
              {item.isUpcoming 
                ? `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Meeting` 
                : 'Recording'}
            </Text>
            {item.description && (
              <Text style={styles.meetingDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.meetingFooter}>
          <View style={styles.participantsContainer}>
            <MaterialIcons name="people" size={16} color="#023c8a" />
            <Text style={styles.participantsText}>
              {item.participants.length} participants
            </Text>
          </View>
          {item.isUpcoming ? (
            <TouchableOpacity 
              style={[styles.joinButton, isRecording && styles.disabledButton]} 
              onPress={() => handleJoinMeeting(item)}
              disabled={isRecording}
            >
              <Text style={styles.joinButtonText}>
                {isRecording ? 'Joining...' : 'Join'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Link href={`/meeting-details?itemid=${item.id}`} asChild>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </Animated.View>
    );
  };

  // Filter toggle handler
  const handleFilterToggle = (filter: 'upcoming' | 'completed') => {
    if (selectedFilter !== filter) {
      setSelectedFilter(filter);
      setLoading(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meetings</Text>
        <Link href="/new-meeting" asChild>
          <TouchableOpacity style={styles.newMeetingButton}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.filterContainer}>
        {['upcoming', 'completed'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, selectedFilter === status && styles.selectedFilter]}
            onPress={() => handleFilterToggle(status as 'upcoming' | 'completed')}
          >
            <Text style={[styles.filterText, selectedFilter === status && styles.selectedFilterText]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#023c8a" />
          <Text style={styles.loadingText}>Loading {selectedFilter} meetings...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={40} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => handleFilterToggle(selectedFilter)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={meetings}
          renderItem={renderMeetingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name={selectedFilter === 'upcoming' ? 'event-busy' : 'speaker-notes-off'} size={60} color="#ddd" />
              <Text style={styles.emptyText}>No {selectedFilter} meetings found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  newMeetingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#023c8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedFilter: {
    backgroundColor: '#023c8a',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#023c8a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  meetingCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  meetingInfo: {
    marginLeft: 15,
    flex: 1,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  meetingDateTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  meetingType: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  meetingDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  meetingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#023c8a',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#104da0', // Lighter blue to indicate disabled state
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewButton: {
    backgroundColor: '#023c8a',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 5,
  },
});