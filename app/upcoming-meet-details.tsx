import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import Constants from 'expo-constants';

const { IP_ADDRESS, BACKEND_PORT } = Constants.expoConfig?.extra || {};

export default function UpcomingMeetDetails({ visible, meetingId, onClose }: { visible: any, meetingId: any, onClose: any }) {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && meetingId) {
      fetchMeetingDetails();
    } else {
      setMeeting(null); // Reset meeting data when modal is closed
      setError(null);
    }
  }, [visible, meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://${IP_ADDRESS}:${BACKEND_PORT}/api/meet/upcoming-meet-details/${meetingId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Format timestamps if they exist (already ISO strings from backend)
      const formattedMeeting = {
        ...data,
        formattedDateTime: data.dateTime ? moment(data.dateTime).format('DD MMMM YYYY, h:mm A') : 'Not specified',
        formattedCreatedAt: data.createdAt ? moment(data.createdAt).format('DD MMMM YYYY, h:mm A') : 'Not available',
      };

      setMeeting(formattedMeeting);
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      setError('Failed to load meeting details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Meeting Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading meeting details...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchMeetingDetails}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : meeting ? (
            <ScrollView style={styles.detailsScrollView}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Meeting Title</Text>
                <Text style={styles.detailValue}>{meeting.meetingTitle || 'Untitled Meeting'}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{meeting.formattedDateTime}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Meeting Type</Text>
                <Text style={styles.detailValue}>
                  {meeting.meetingType ? meeting.meetingType.charAt(0).toUpperCase() + meeting.meetingType.slice(1) : 'Not specified'}
                </Text>
              </View>

              {meeting.meetingDescription && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{meeting.meetingDescription}</Text>
                </View>
              )}

              {meeting.meetingLink && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Meeting Link</Text>
                  <Text style={styles.detailValue}>{meeting.meetingLink}</Text>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Created At</Text>
                <Text style={styles.detailValue}>{meeting.formattedCreatedAt}</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.joinMeetingButton}>
                  <Text style={styles.joinMeetingButtonText}>Join Meeting</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noDataContainer}>
              <Text>No meeting data available</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    // paddingBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#023c8a',
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#023c8a',
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsScrollView: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 0,
  },
  joinMeetingButton: {
    backgroundColor: '#023c8a',
    padding: 15,
    borderRadius: 10,
      alignItems: 'center',
    // marginTop:20,
  },
  joinMeetingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});