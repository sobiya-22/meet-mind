import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import Constants from 'expo-constants';

const { IP_ADDRESS, PORT } = Constants.expoConfig?.extra || {};



interface Task {
  id: string;
  title: string;
  completed: boolean;
  meetingTitle: string;
  meetingDate: string;
  dueDate: string;
}

export default function TranscriptionScreen() {
  const { user } = useAuth();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noTasksMessage, setNoTasksMessage] = useState<string>('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const meetingsResponse = await fetch(`http://${IP_ADDRESS}:${PORT}/api/meet/my-meetings`, {
          method: 'GET',
          headers: {
            'x-user-id': user?.uid || '',
          } as HeadersInit,
        });
        
        const meetingsData = await meetingsResponse.json();
        
        if (!Array.isArray(meetingsData) || meetingsData.length === 0) {
          setTaskList([]);
          setNoTasksMessage('No meetings found');
          setLoading(false);
          return;
        }
  
        // Transform meeting tasks into the format we need
        const allTasks: Task[] = [];
        
        meetingsData.forEach(meeting => {
          if (meeting.tasks && Array.isArray(meeting.tasks)) {
            const meetingDate = new Date(meeting.timestamp).toLocaleDateString();
            
            meeting.tasks.forEach((task: any, index: number) => {
              allTasks.push({
                id: `${meeting.id}-task-${index}`,
                title: task.title,
                completed: task.completed || false, // Use the completion status from the database
                meetingTitle: meeting.title || 'Untitled Meeting',
                meetingDate: meetingDate,
                dueDate: task.dueDate || 'No due date',
              });
            });
          }
        });
  
        if (allTasks.length > 0) {
          setTaskList(allTasks);
          setNoTasksMessage('');
        } else {
          setTaskList([]);
          setNoTasksMessage('No tasks found');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
  
    fetchTasks();
  }, [user?.uid]);

  const toggleTask = async (taskId: string) => {
    try {
      // Update local state first for responsive UI
      setTaskList(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
  
      // Find the task that was toggled
      const updatedTask = taskList.find(task => task.id === taskId);
      
      if (!updatedTask) {
        throw new Error('Task not found');
      }
      
      // Extract the meetingId from the taskId (format: meetingId-task-index)
      const meetingId = taskId.split('-task-')[0];
      
      // Make API request to update task status
      await fetch(`http://${IP_ADDRESS}:${PORT}/api/meet/tasks/${meetingId}/${encodeURIComponent(updatedTask.title)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || '',
        } as HeadersInit,
        body: JSON.stringify({ completed: !updatedTask.completed }),
      });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert the change if the API call fails
      setTaskList(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[styles.taskCard, item.completed && styles.completedTask]}
      onPress={() => toggleTask(item.id)}
    >
      <View style={styles.taskHeader}>
        <MaterialIcons
          name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={item.completed ? '#4CAF50' : '#666'}
        />
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          <Text style={styles.meetingInfo}>
            From: {item.meetingTitle} ({item.meetingDate || '-'})
          </Text>
        </View>
      </View>
      <View style={styles.taskFooter}>
        <View style={styles.dueDateContainer}>
          <MaterialIcons name="event" size={16} color="#023c8a" />
          <Text style={styles.dueDate}>Due: {item.dueDate || '-'}</Text>
        </View>
        {item.completed && (
          <Text style={styles.completedLabel}>Completed</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centeredContainer]}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centeredContainer]}>
        <MaterialIcons name="error" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError('');
            // Re-trigger the useEffect
            setTaskList([]);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>

      {noTasksMessage ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="assignment" size={64} color="#CCCCCC" />
          <Text style={styles.noTasksMessage}>{noTasksMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={taskList.sort((a, b) => {
            // Sort by completion status first
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            
            // Then sort by due date
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            
            // Check if either date is invalid
            const isValidDateA = !isNaN(dateA.getTime());
            const isValidDateB = !isNaN(dateB.getTime());
            
            if (!isValidDateA && !isValidDateB) return 0;
            if (!isValidDateA) return 1;
            if (!isValidDateB) return -1;
            
            return dateA.getTime() - dateB.getTime();
          })}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    // borderBlockEndColor:''
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom for better scrolling
  },
  taskCard: {
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
  completedTask: {
    backgroundColor: '#f0f8f0',
    opacity: 0.8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  taskInfo: {
    marginLeft: 15,
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#023c8a',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  meetingInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  completedLabel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTasksMessage: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});