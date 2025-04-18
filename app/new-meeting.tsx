import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import useAuth from './hooks/useAuth';
import Constants from 'expo-constants';

const { IP_ADDRESS, BACKEND_PORT } = Constants.expoConfig?.extra || {};


export default function NewMeetingScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [date, setDate] = useState(new Date());
  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { user } = useAuth();
  const handleClose = () => {
    router.back();
  };


  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };
  const startRecording = async () => {
    if (!meetingLink || !title) {
      Alert.alert('Error', 'Please enter both meeting link and title');
      return;
    }

    setIsRecording(true);
    try {
      const response = await fetch(`http://${IP_ADDRESS}:${BACKEND_PORT}/api/meet/record`, {
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

  const handleJoinNow = async () => {
    startRecording();
    await fetch(`http://${IP_ADDRESS}:${BACKEND_PORT}/api/meet/add-meeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.uid,
        meetingTitle: title,
        meetingDescription: description,
        meetingLink: meetingLink,
        meetingType: 'live',
        meetingDateTime: date.toISOString(),
      }),
    });
    Alert.alert('Meeting joined successfully');
    handleClose();
  };

  const handleScheduleMeeting = async () => {
    await fetch(`http://${IP_ADDRESS}:${BACKEND_PORT}/api/meet/add-meeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.uid,
        meetingTitle: title,
        meetingDescription: description,
        meetingLink: meetingLink,
        meetingType: 'scheduled',
        meetingDateTime: date.toISOString(),
      }),
    });
    Alert.alert('Meeting scheduled successfully');
    handleClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>New Meeting</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meeting Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter meeting title"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meeting Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter meeting description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meeting Link</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Google Meet or Zoom meeting link"
                  value={meetingLink}
                  onChangeText={setMeetingLink}
                  keyboardType="url"
                />
              </View>

              <View style={styles.scheduleOptions}>
                <TouchableOpacity
                  style={[styles.scheduleOption, !isScheduled && styles.selectedOption]}
                  onPress={() => setIsScheduled(false)}
                >
                  <MaterialIcons name="play-circle" size={24} color={!isScheduled ? "#023c8a" : "#666"} />
                  <Text style={[styles.optionText, !isScheduled && styles.selectedText]}>Join Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scheduleOption, isScheduled && styles.selectedOption]}
                  onPress={() => setIsScheduled(true)}
                >
                  <MaterialIcons name="schedule" size={24} color={isScheduled ? "#023c8a" : "#666"} />
                  <Text style={[styles.optionText, isScheduled && styles.selectedText]}>Schedule Later</Text>
                </TouchableOpacity>
              </View>

              {isScheduled && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date and Time</Text>
                  <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
                    <Text style={styles.dateText}>
                      {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                    </Text>
                    <MaterialIcons name="calendar-today" size={24} color="#023c8a" />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="datetime"
                    date={date}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.actionButton, isRecording && styles.buttonDisabled]}
                onPress={isScheduled ? handleScheduleMeeting : handleJoinNow}
                disabled={isRecording}
              >
                <Text style={styles.actionButtonText}>
                  {isRecording ? 'Recording...' : (isScheduled ? 'Schedule Meeting' : 'Join Now')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  scheduleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scheduleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  selectedOption: {
    borderColor: '#023c8a',
    backgroundColor: '#dbe9fb',
  },
  optionText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  selectedText: {
    color: '#023c8a',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#023c8a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 