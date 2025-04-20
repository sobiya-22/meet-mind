import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Animated } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useAuth from './hooks/useAuth';
import Constants from 'expo-constants';

const { BACKEND_URL } = Constants.expoConfig?.extra || {};


export default function AnalyzeRecordingScreen() {
  const { user } = useAuth();
  const [recordingLink, setRecordingLink] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadType, setUploadType] = useState<'link' | 'file'>('link');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'audio/*',
          'video/*',
          'application/octet-stream',
          'application/mp4',
          'application/x-m4a',
          'audio/mp4',
          'audio/mpeg',
          'audio/wav',
          'audio/x-wav',
          'audio/aac',
          'audio/mp3',
          'video/mp4',
          'video/quicktime',
          'video/x-msvideo',
          'video/x-ms-wmv'
        ],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Selected file:', file);
        setSelectedFile(file);
        
        // Show success message
        Alert.alert(
          'File Selected',
          `Successfully selected: ${file.name}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Error picking file:', err);
      Alert.alert(
        'Error',
        'Failed to select file. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  const handleClose = () => {
    router.back();
  };
  const handleToggle = (type: 'link' | 'file') => {
    // Fade out current content
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setUploadType(type);
      // Slide the toggle button
      Animated.timing(slideAnim, {
        toValue: type === 'link' ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Fade in new content
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAnalyze = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to analyze recordings');
      return;
    }

    if (!meetingTitle) {
      Alert.alert('Error', 'Please enter a meeting title');
      return;
    }

    if (uploadType === 'link' && !recordingLink) {
      Alert.alert('Error', 'Please enter a recording link');
      return;
    }

    if (uploadType === 'file' && !selectedFile) {
      Alert.alert('Error', 'Please select a recording file');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('meetingTitle', meetingTitle);

      if (uploadType === 'link') {
        formData.append('recordingLink', recordingLink);
      } else if (selectedFile) {
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/octet-stream',
          name: selectedFile.name
        } as any);
      }

      const response = await fetch(`${BACKEND_URL}/api/meet/analyze`, { 
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-id': user.uid,
          'x-user-email': user.email || ''
        },
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      console.log('Analysis result:', data);

      Alert.alert(
        'Success',
        'Recording analysis completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/(tabs)/meetings',
              params: { 
                highlightMeeting: 'new',
                meetingTitle: meetingTitle,
                meetingLink: uploadType === 'link' ? recordingLink : selectedFile?.uri,
                status: 'completed'
              }
            })
          }
        ]
      );
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze recording. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true} onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Analyze Recording</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meeting Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter meeting title"
                value={meetingTitle}
                onChangeText={setMeetingTitle}
              />
            </View>

            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleLabel, uploadType === 'link' && styles.toggleLabelActive]}>Drive Link</Text>
              <TouchableOpacity
                style={styles.toggleSwitch}
                onPress={() => handleToggle(uploadType === 'link' ? 'file' : 'link')}
              >
                <Animated.View 
                  style={[
                    styles.toggleButton,
                    {
                      transform: [{
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [2, 22]
                        })
                      }]
                    }
                  ]} 
                />
              </TouchableOpacity>
              <Text style={[styles.toggleLabel, uploadType === 'file' && styles.toggleLabelActive]}>Upload File</Text>
            </View>

            <Animated.View style={{ opacity: fadeAnim }}>
              {uploadType === 'link' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Recording Link</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Google Drive link"
                    value={recordingLink}
                    onChangeText={setRecordingLink}
                  />
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Upload Recording</Text>
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={pickFile}
                  >
                    <MaterialIcons name="upload-file" size={24} color="#023c8a" />
                    <Text style={styles.uploadButtonText}>
                      {selectedFile ? selectedFile.name : 'Select Recording File'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>

            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color="#023c8a" />
                <Text style={styles.analyzingText}>Analyzing recording...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.analyzeButton, (!recordingLink && !selectedFile) && styles.disabledButton]}
                onPress={handleAnalyze}
              >
                <Text style={styles.analyzeButtonText}>Analyze Recording</Text>
              </TouchableOpacity>
            )}
          </View>
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
    height: '65%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 15,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
  },
  toggleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#023c8a',
    position: 'absolute',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  toggleLabelActive: {
    color: '#023c8a',
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbe9fb',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#023c8a',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: 10,
    color: '#007AFF',
    fontSize: 16,
  },
  analyzeButton: {
    backgroundColor: '#023c8a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analyzingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  analyzingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});
