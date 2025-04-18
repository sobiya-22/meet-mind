import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import useAuth from '../hooks/useAuth';
import moment from 'moment';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';

const { IP_ADDRESS, BACKEND_PORT } = Constants.expoConfig?.extra || {};

export default function HomeScreen() {
  // Load custom font
  const [fontsLoaded, fontError] = useFonts({
    MeetMindFont: require('../../assets/fonts/Nunito-Bold.ttf'),
  });
  const { user, loading } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  // Show loading state if fonts are not loaded or auth is loading
  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{fontError ? 'Error loading fonts' : 'Loading...'}</Text>
      </View>
    );
  }
  

  useEffect(() => {
    if (user) {
      loadRecentActivity();
      loadUpcomingMeetings();
    }
  }, [user]);

  // Debug font loading
  useEffect(() => {
    if (fontsLoaded) {
      console.log('Font MeetMindFont loaded successfully');
    }
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontsLoaded, fontError]);

  const loadUpcomingMeetings = async () => {
    try {
      const response = await fetch(`http://${IP_ADDRESS}:${BACKEND_PORT}/api/meet/upcoming-meetings/${user?.uid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const upcoming = data.meetings
        .map((meeting: any) => ({
          ...meeting,
          jsDateTime: new Date(meeting.dateTime.seconds * 1000),
        }))
        .filter((meeting: any) => meeting.jsDateTime > new Date());

      setMeetings(upcoming);
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      console.log('User ID:', user?.uid);
      const response = await fetch(`http://${IP_ADDRESS}:${BACKEND_PORT}/api/meet/recent-activity/${user?.uid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecentActivity(data.activity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back,{' '}
            <Text style={styles.username}>{user?.displayName || 'User'}</Text>!
          </Text>
          <Text style={styles.subtitle}>Your AI meeting assistant is ready</Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Link href="/new-meeting" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="video-call" size={30} color="#023c8a" />
                <Text style={styles.actionText}>Join Meeting</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/meetings" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="event" size={30} color="#023c8a" />
                <Text style={styles.actionText}>All Meetings</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(tabs)/meetings" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="analytics" size={30} color="#023c8a" />
                <Text style={styles.actionText}>Meeting Analysis</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/analyze-recording" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="play-circle" size={30} color="#023c8a" />
                <Text style={styles.actionText}>Analyze Record Link</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={styles.upcomingMeetings}>
          <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
          {meetings.map((meeting) => (
            <View key={meeting.id} style={styles.meetingCard}>
              <View style={styles.meetingHeader}>
                <MaterialIcons name="event" size={24} color="#023c8a" />
                <Text style={styles.meetingTitle}>{meeting.meetingTitle}</Text>
              </View>
              <Text style={styles.meetingTime}>
                {moment(meeting.jsDateTime).format('dddd, MMMM D YYYY, h:mm A')}
              </Text>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => router.push(`/meeting-details?id=${meeting.id}`)}
              >
                <Text style={styles.joinButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length === 0 ? (
            <Text style={{ color: '#999' }}>No recent activity</Text>
          ) : (
            recentActivity.map((item) => (
              <View key={item.id} style={styles.activityCard}>
                <MaterialIcons name="history" size={24} color="#023c8a" />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityTime}>{item.source} analyzed</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  header: { padding: 20 },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontFamily: "MeetMindFont",
    color: '#023c8a',
    // fontWeight: 'bold', // Match the font weight to Nunito-Bold
  },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  quickActions: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
  },
  upcomingMeetings: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  meetingCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  meetingTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  joinButton: {
    backgroundColor: '#023c8a',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentActivity: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  activityContent: {
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    color: '#333',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});