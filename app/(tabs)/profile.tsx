import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import { logout } from '../../utils/firebase';
import { router } from 'expo-router';
import Constants from 'expo-constants';

const { BACKEND_URL } = Constants.expoConfig?.extra || {};

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const [stats, setStats] = React.useState({ meetings: 0, transcriptions: 0, tasks: 0, uncompletedTasks: 0 });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/${user?.uid}/stats`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    if (user?.uid) fetchStats();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#023c8a" />
      </View>
    );
  }

  // Default user details if no user is available
  const userName = user?.displayName || 'John Doe';
  const userEmail = user?.email || 'john.doe@example.com';
  const avatarUrl = user?.photoURL || require('../../assets/images/default-avatar.png');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image
            source={
              typeof avatarUrl === 'string'
                ? { uri: avatarUrl }
                : avatarUrl
            }
            style={styles.avatar}
          />

          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.meetings}</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.transcriptions}</Text>
            <Text style={styles.statLabel}>Transcriptions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.uncompletedTasks}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="notifications" size={24} color="#023c8a" />
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="language" size={24} color="#023c8a" />
            <Text style={styles.settingText}>Language</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="security" size={24} color="#023c8a" />
            <Text style={styles.settingText}>Security</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="format-color-text" size={24} color="#023c8a" />
            <Text style={styles.settingText}>Transcription Format</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="storage" size={24} color="#023c8a" />
            <Text style={styles.settingText}>Storage Settings</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="auto-awesome" size={24} color="#023c8a" />
            <Text style={styles.settingText}>AI Preferences</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="help" size={24} color="#023c8a" />
            <Text style={styles.settingText}>Help Center</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="feedback" size={24} color="#023c8a" />
            <Text style={styles.settingText}>Send Feedback</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="info" size={24} color="#023c8a" />
            <Text style={styles.settingText}>About</Text>
            <MaterialIcons name="chevron-right" size={24} color="#023c8a" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    // borderWidth:1,
    // borderColor:'#023c8a',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  editProfileButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileText: {
    color: '#023c8a',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#023c8a',
  },
  statLabel: {
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
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
