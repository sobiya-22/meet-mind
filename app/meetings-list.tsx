import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import useAuth from './hooks/useAuth';
import { router } from 'expo-router';
import Constants from 'expo-constants';

const { IP_ADDRESS, PORT } = Constants.expoConfig?.extra || {};


interface Meeting {
  id: string;
  title: string;
  timestamp: number;
  participants: string[];
  duration: string;
  source: string;
  transcript: string;
  summary: string;
  tasks: string[];
  minutes: string[];
  audioPath: string;
  userId: string;
  userEmail: string;
}

export default function MeetingsList() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (user) {
        try {
          const res = await fetch(`http://${IP_ADDRESS}:${PORT}/meetings?userId=${user.uid}`);
          const data = await res.json();
          setMeetings(data);
        } catch (error) {
          console.error('Error fetching meetings:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchMeetings();
  }, [user]);
  
  const renderMeetingItem = ({ item }: { item: Meeting }) => (
    <TouchableOpacity 
      style={styles.meetingItem}
      onPress={() => router.push(`/meeting-details?id=${item.id}`)}
    >
      <Text style={styles.meetingTitle}>{item.title}</Text>
      <View style={styles.meetingDetails}>
        <Text style={styles.meetingDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
        <Text style={styles.meetingParticipants}>
          {item.participants.length} participants • {item.duration}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading meetings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={meetings}
        renderItem={renderMeetingItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meetings found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meetingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meetingDate: {
    color: '#666',
  },
  meetingParticipants: {
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});