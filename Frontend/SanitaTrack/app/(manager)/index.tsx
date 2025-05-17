import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { Box, Text, ScrollView, HStack, Pressable, Button, Icon } from '@gluestack-ui/themed';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import { fetchTasks } from '@/api/apiService'; // Function to fetch data from the backend
import { i18n } from '@/hooks/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface Task {
  taskId: string;
  managerId: string;
  employeeId: string;
  title: string;
  description: string;
  startTime: Date; // ISO format, e.g., '2025-05-11T14:30:00'
  endTime: Date;   // ISO format
  time: string; // e.g., '14:30'
  done: boolean;
}

const ManagerHomepage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const { language, changeLanguage } = useLanguage();

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Remove user token from AsyncStorage
      router.replace('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasksFromDatabase();
    setRefreshing(false);
  };

  // Filter tasks by the selected date
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime).toISOString().split('T')[0];  // 'YYYY-MM-DD' format
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      return taskDate === selectedDateStr;  // Show tasks if the dates match
    });
  }, [tasks, selectedDate]);

  // This function will be triggered when a day is selected
  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString));

  // Function to fetch tasks from the backend
  const fetchTasksFromDatabase = async () => {
    try {
      const response = await fetchTasks(); // Fetch tasks from the backend
      setTasks(response); // Set tasks to state
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasksFromDatabase(); // Fetch tasks when the component mounts
  }, []);

  const renderDetail = (rowData: Task) => {
    // Ensure startTime and endTime are being properly parsed as Date objects
    const startTime = rowData.startTime ? new Date(rowData.startTime) : new Date();
    const endTime = rowData.endTime ? new Date(rowData.endTime) : new Date();

    // Format start and end time into a 2-digit time format
    const formattedStart = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedEnd = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate the difference between start and end times in milliseconds
    const totalTimeInMillis = endTime.getTime() - startTime.getTime();
    const totalTimeInMinutes = totalTimeInMillis / 60000; // Convert milliseconds to minutes

    // Convert total time to hours and minutes
    const hours = Math.floor(totalTimeInMinutes / 60);
    const minutes = Math.round(totalTimeInMinutes % 60);
    const formattedTotalTime = `${hours}h ${minutes}m`;
    console.log("rowdata : ", rowData);

    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.title}</Text>
        </HStack>

        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>
        <Text fontSize="$sm" color={Colors.black} fontWeight="$bold">{formattedStart} - {formattedEnd}</Text>
        <Text fontSize="$sm" color={Colors.black}>{i18n.t('totalTime')}: {formattedTotalTime}</Text>

        {rowData.done ? (
          <Text mt="$2" color={Colors.text}>{i18n.t('completed')}</Text>
        ) : null}
      </Box>
    );
  };

  return (
    <Box flex={1} p="$4" bg={Colors.background}>
      <HStack justifyContent="space-between" mt="$7">
        <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading} mb="$4">{i18n.t('welcome')}</Text>

        <HStack alignItems='center' justifyContent="space-between" space="md">
          <Pressable onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}>
            <Text fontWeight="$bold" color={Colors.text}>
              {language === 'en' ? 'TR' : 'EN'}
            </Text>
          </Pressable>

          <Button flex={1} bg={Colors.heading} borderRadius="$lg" onPress={() => logout()}>
            <HStack alignItems="center" justifyContent="center" space="xs">
              <Icon as={LogOut} color={Colors.white} size="md" />
            </HStack>
          </Button>
        </HStack>
      </HStack>

      <ScrollView
        flex={1}
        mb="$2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.text]}
            tintColor={Colors.text}
          />
        }
      >
        <Box p="$3" pl={0} borderRadius="$2xl" mb="$4">
          <Calendar
            current={selectedDate.toISOString().split('T')[0]}
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate.toISOString().split('T')[0]]: {
                selected: true,
                selectedColor: Colors.text,
                selectedTextColor: Colors.white,
              }
            }}
            theme={{
              backgroundColor: Colors.white,
              calendarBackground: Colors.white,
              selectedDayBackgroundColor: Colors.text,
              selectedDayTextColor: Colors.white,
              todayTextColor: Colors.error,
              dayTextColor: Colors.heading,
              textDisabledColor: Colors.gray,
              arrowColor: Colors.text,
              monthTextColor: Colors.heading,
              indicatorColor: Colors.text,
              textSectionTitleColor: Colors.gray,
            }}
          />
        </Box>

        <Box p="$3" pl={0} borderRadius="$2xl" mb="$4">
          <Timeline
            data={filteredTasks.map(task => ({
              time: `${new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              title: task.title,
              description: task.description,
              startTime: task.startTime,
              endTime: task.endTime,
              taskId: task.taskId,
              done: task.done,
            }))}

            circleSize={20}
            circleColor="#000"
            lineColor="#6C63FF"
            timeStyle={{
              textAlign: 'center',
              color: '#333',
              padding: 5,
              fontSize: 12
            }}
            descriptionStyle={{ color: '#555' }}
            renderDetail={renderDetail}
            separator={true}
            showTime={true}
            innerCircle={'dot'}
          />
        </Box>
      </ScrollView>
    </Box>
  );
};

export default ManagerHomepage;
