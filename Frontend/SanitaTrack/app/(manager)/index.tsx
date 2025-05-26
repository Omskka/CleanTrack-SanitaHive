import React, { useState, useEffect, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  Pressable,
  Button,
  Icon,
  Heading
} from '@gluestack-ui/themed';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import { fetchTasks, fetchTeamByManager, fetchAllUsers } from '@/api/apiService'; // Function to fetch data from the backend
import { i18n } from '@/hooks/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LogOut, Calendar as CalendarIcon } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';

// Task interface for type safety
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
  member?: User;
}

interface User {
  userId: string;
  name: string;
  surname: string;
  phoneNumber: string;
}

const ManagerHomepage = () => {
  // State for current manager's user ID
  const [userID, setUserID] = useState('');
  // State for all team members fetched from backend
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  // State for currently selected date in the calendar
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // State for all tasks fetched from the backend
  const [tasks, setTasks] = useState<Task[]>([]);
  // State to show/hide the calendar
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  // Language context for i18n
  const { language, changeLanguage } = useLanguage();

  // Fetch team members when userID changes
  useEffect(() => {
    if (userID) {
      fetchTeamMembersData();
    }
  }, [userID]);

  // Fetch manager user ID from AsyncStorage on mount
  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem('userToken');
        if (storedUserID) {
          // Parse the userToken if it's stored as a JSON string
          try {
            const parsedUserID = JSON.parse(storedUserID);
            setUserID(parsedUserID);
            console.log('User ID set:', parsedUserID);
          } catch (e) {
            // If parsing fails, use the raw string
            setUserID(storedUserID);
            console.log('User ID set (raw):', storedUserID);
          }
        } else {
          console.warn('No userToken found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching userID from AsyncStorage:', error);
      }
    };

    fetchUserID();
  }, []);

  // Fetch all team members for this manager from backend
  const fetchTeamMembersData = async () => {
    try {
      // 1. Get all users
      const allUsers = await fetchAllUsers();

      // 2. Fetch team to get employee IDs
      const team = await fetchTeamByManager(userID);

      // 3. Ensure employeeId is an array
      const employeeIds = Array.isArray(team.employeeId)
        ? team.employeeId
        : team.employeeId
          ? [team.employeeId]
          : [];

      // 4. Filter users to get team members
      const members = allUsers.filter((user: User) => employeeIds.includes(user.userId));

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Logout function: removes user token and redirects to login
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Remove user token from AsyncStorage
      router.replace('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasksFromDatabase();
    setRefreshing(false);
  };

  // tasks: all fetched tasks
  // selectedDate and userID are dependencies
  const filteredTasks = useMemo(() => {
    const selected = selectedDate.toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime).toISOString().split('T')[0];
      return task.managerId === userID && taskDate === selected;
    });
  }, [tasks, selectedDate, userID]);

  // This function will be triggered when a day is selected in the calendar
  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString));

  // Function to fetch tasks from the backend and update state
  const fetchTasksFromDatabase = async () => {
    try {
      const response = await fetchTasks(); // Fetch tasks from the backend
      setTasks(response); // Set tasks to state
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasksFromDatabase();
  }, []);

  // Render details for each task in the timeline
  const renderDetail = (rowData: Task) => {
    // Parse start and end times
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

    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.title}</Text>
        </HStack>

        <Text fontSize="$sm" color={Colors.text}>{rowData.description}</Text>

        {/* Display employee name */}
        {rowData.member && (
          <Text fontSize="$sm" fontWeight="$bold" color={Colors.text} mb="$3">
            {i18n.t('assignedTo')}: {rowData.member.name} {rowData.member.surname}
          </Text>
        )}

        <Text fontSize="$sm" color={Colors.black} fontWeight="$bold">{formattedStart} - {formattedEnd}</Text>
        <Text fontSize="$sm" color={Colors.black}>{i18n.t('totalTime')}: {formattedTotalTime}</Text>

        {/* Show completed status if task is done */}
        {rowData.done ? (
          <Text mt="$2" color={Colors.text} fontWeight="$bold">{i18n.t('completed')}</Text>
        ) : null}
      </Box>
    );
  };

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header - shows welcome, language switch, and logout */}
      <Box p="$4" pt="$9" bg={Colors.white}>
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg" color={Colors.heading}>{i18n.t('welcome')}</Heading>

          <HStack alignItems='center' space="md">
            {/* Language switch button */}
            <Pressable onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}>
              <Text fontWeight="$bold" color={Colors.text}>
                {language === 'en' ? 'TR' : 'EN'}
              </Text>
            </Pressable>

            {/* Logout button */}
            <Button bg={Colors.heading} borderRadius="$lg" onPress={() => logout()}>
              <Icon as={LogOut} color={Colors.white} size="md" />
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Main content scrollable area */}
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
        {/* Calendar section at the top when visible */}
        {calendarVisible && (
          <Box bg={Colors.white} p="$2" mb="$4">
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
        )}

        {/* Timeline section for tasks */}
        <Box flex={1} borderRadius="$2xl" mb="$4">
          <Timeline
            data={filteredTasks.map(task => ({
              time: `${new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              title: task.title,
              description: task.description,
              startTime: task.startTime,
              endTime: task.endTime,
              taskId: task.taskId,
              done: task.done,
              member: teamMembers.find(x => x.userId == task.employeeId),
            }))}
            circleSize={20}
            circleColor="#5a855f"
            lineColor={Colors.heading}
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
            style={{ flex: 1, marginTop: 20, marginRight: 20 }}
          />

          {/* Show message if no tasks found */}
          {filteredTasks.length === 0 && !refreshing && (
            <Box alignItems="center" py="$6">
              <Text color={Colors.gray}>{i18n.t('noTasksFound')}</Text>
            </Box>
          )}

          {/* Show loading message if refreshing */}
          {refreshing && filteredTasks.length === 0 && (
            <Box alignItems="center" py="$6">
              <Text color={Colors.gray}>{i18n.t('loading')}</Text>
            </Box>
          )}
        </Box>
      </ScrollView>

      {/* Footer with calendar toggle button */}
      <Box bg={Colors.white} px="$4" py="$4">
        <HStack space="md" justifyContent="space-between">
          <Button flex={1} bg={Colors.text} borderRadius="$lg" onPress={() => setCalendarVisible(!calendarVisible)}>
            <HStack alignItems="center" justifyContent="center" space="sm">
              <Icon as={CalendarIcon} color={Colors.white} size="sm" />
              <Text color={Colors.white}>{calendarVisible ? i18n.t('hideCalendar') : i18n.t('selectDate')}</Text>
            </HStack>
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default ManagerHomepage;