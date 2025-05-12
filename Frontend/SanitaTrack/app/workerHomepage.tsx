import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Pressable,
  ScrollView,
  Button,
  VStack,
  HStack,
  Image,
  Icon
} from '@gluestack-ui/themed';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import { Phone, Calendar as CalendarIcon } from 'lucide-react-native';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllUsers, fetchTasks, fetchTeam, login, markTaskAsDone } from '@/api/apiService';

interface Task {
  taskId: string; // corresponds to `id: ObjectId`
  managerId: string;
  employeeId: string;
  title: string;
  description: string;
  startTime: Date; // ISO format, e.g., '2025-05-11T14:30:00'
  endTime: Date;   // ISO format
  time: string; // e.g., '14:30'
  imageUrl: string;
  questionnaireOne: string;
  questionnaireTwo: string;
  questionnaireThree: string;
  questionnaireFour: string;
  isDone: boolean;
};

interface User {
  userId: string;
  name: string;
  surname: string;
  phoneNumber: string;
}

interface UploadedImages {
  [taskId: string]: string[];
}


const WorkerHomepage = () => {
  const [language, setLanguage] = useState<string>(getCurrentLanguage());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userID, setUserID] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImages>({});
  const [calendarVisible, setCalendarVisible] = useState<boolean>(true);
  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString));
  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };


  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem('userToken');
        if (storedUserID) {
          setUserID(storedUserID);
        }
      } catch (error) {
        console.error('Error fetching userID from AsyncStorage:', error);
      }
    };

    fetchUserID();
  }, []);

  // Call manager function
  const callPhone = async () => {
    try {
      console.log("UserID :", userID);

      if (!userID) {
        console.error("❌ userID is not set yet.");
        alert("User ID is not available. Please try again later.");
        return;
      }

      // Step 1: Fetch the user's team
      const cleanedUserID = userID.replace(/^"(.*)"$/, '$1').trim();
      const team = await fetchTeam(cleanedUserID);

      console.log("Team:", team);

      const managerUserID = team.managerId;
      console.log("Manager UserID:", managerUserID);
      if (!managerUserID) {
        console.error("❌ Manager UserID is not available.");
        alert("Manager UserID is not available. Please try again later.");
        return;
      }

      // Step 2: Fetch all users and find the manager
      const allUsers = await fetchAllUsers();
      const manager = allUsers.find((user: User) => user.userId === managerUserID);

      if (!manager) {
        console.error("❌ Manager not found in user list.");
        alert("Manager not found. Please try again later.");
        return;
      }

      const phoneNumber = manager.phoneNumber;
      console.log("📞 Calling phone number:", phoneNumber);

      // Step 3: Call the manager
      Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.error("❌ Error calling manager:", error);
      alert("Failed to initiate call. Please try again later.");
    }
  };

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.startTime).toISOString().split('T')[0];
    const selected = selectedDate.toISOString().split('T')[0];
    return taskDate === selected;
  });

  const takePicture = async (taskId: string) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert(i18n.t('cameraPermissionRequired'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
      base64: false,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const newImages = { ...uploadedImages };
      if (!newImages[taskId]) newImages[taskId] = [];

      if (newImages[taskId].length < 5) {
        newImages[taskId].push(result.assets[0].uri);
        setUploadedImages(newImages);
      } else {
        alert(i18n.t('maxImagesReached'));
      }
    }
  };

  const fetchTasksFromDatabase = async () => {
    try {

      // Example API call – replace this with your real function
      const response = await fetchTasks();
      console.log("Fetched tasks:", response);

      setTasks(response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchTasksFromDatabase();
    }
  }, [userID]);


  const submitTask = async (taskId: string) => {
    /* if (!uploadedImages[taskId]?.length) {
      alert(i18n.t('uploadAtLeastOneImage'));
      return;
    } */

    try {
      console.log('taskId passed:', taskId); // Check the taskId value here

      await markTaskAsDone(taskId); // ✅ update on backend
      setTasks(tasks.map(task =>
        task.taskId === taskId ? { ...task, completed: true } : task
      ));
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const renderDetail = (rowData: Task) => {
    const isCompleted = rowData.isDone || (uploadedImages[rowData.taskId]?.length > 0);

    // Ensure startTime and endTime are being properly parsed as Date objects
    const startTime = rowData.startTime ? new Date(rowData.startTime) : new Date();
    const endTime = rowData.endTime ? new Date(rowData.endTime) : new Date();

    // Format start and end time into a 2-digit time format
    const formattedStart = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedEnd = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate the difference between start and end times in milliseconds
    const totalTimeInMillis = endTime.getTime() - startTime.getTime();

    // Convert milliseconds to minutes
    const totalTimeInMinutes = totalTimeInMillis / 60000;

    // Convert total time to hours and minutes
    const hours = Math.floor(totalTimeInMinutes / 60);
    const minutes = Math.round(totalTimeInMinutes % 60);
    const formattedTotalTime = `${hours}h ${minutes}m`;

    // Debugging logs
    console.log('Start Time:', rowData.startTime, 'Formatted Start:', formattedStart);
    console.log('End Time:', rowData.endTime, 'Formatted End:', formattedEnd);
    console.log('Total Time (in minutes):', totalTimeInMinutes);

    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.title}</Text>
        </HStack>

        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>
        <Text fontSize="$sm" color={Colors.black} fontWeight="$bold">{formattedStart} - {formattedEnd}</Text>
        <Text fontSize="$sm" color={Colors.black}>{i18n.t('totalTime')}: {formattedTotalTime}</Text>

        {isCompleted ? (
          <Text color={Colors.text}>{i18n.t('completed')}</Text>
        ) : (
          <>
            <HStack flexWrap="wrap" mb="$3">
              {uploadedImages[rowData.taskId]?.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  alt={`img-${index}`}
                  width={80}
                  height={80}
                  borderRadius={8}
                  mr="$2"
                  mb="$2"
                />
              ))}
            </HStack>

            <HStack justifyContent="flex-end" space="md">
              <Button bg={Colors.tint} onPress={() => takePicture(rowData.taskId)} size="sm">
                <Text color={Colors.text}>{i18n.t('uploadImage')}</Text>
              </Button>

              <Button
                bg={uploadedImages[rowData.taskId]?.length ? Colors.text : Colors.gray}
                //isDisabled={!uploadedImages[rowData.taskId]?.length}
                onPress={() => submitTask(rowData.taskId)}
                size="sm"
              >
                <Text color={Colors.white}>{i18n.t('submit')}</Text>
              </Button>
            </HStack>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box flex={1} p="$2" bg={Colors.background}>
      <VStack mt="$7">
        <Pressable position="absolute" top={16} right={16} zIndex={10} onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}>
          <Text fontWeight="$bold" color={Colors.text}>{language === 'en' ? 'TR' : 'EN'}</Text>
        </Pressable>

        <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading} mb="$4">{i18n.t('welcome')}</Text>
      </VStack>

      <ScrollView flex={1} mb="$2">
        <Box p="$3" pl={0} borderRadius="$2xl" mb="$4">
          <Timeline
            data={filteredTasks.map(task => ({
              time: `${new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              title: task.title,
              description: task.description,
              startTime: task.startTime,
              endTime: task.endTime,
              taskId: task.taskId,
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

        {calendarVisible && (
          <Box bg={Colors.white} borderRadius="$2xl" p="$2" mb="$4">
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
      </ScrollView>

      <HStack space="md" justifyContent="space-between" mb="$4">
        <Button flex={1} bg={Colors.heading} borderRadius="$lg" onPress={() => callPhone()}>
          <HStack alignItems="center" justifyContent="center" space="sm">
            <Icon as={Phone} color={Colors.white} size="sm" />
            <Text color={Colors.white}>{i18n.t('contactManager')}</Text>
          </HStack>
        </Button>

        <Button flex={1} variant="outline" bg={Colors.heading} borderRadius="$lg" onPress={() => setCalendarVisible(!calendarVisible)}>
          <HStack alignItems="center" justifyContent="center" space="sm">
            <Icon as={CalendarIcon} color={Colors.white} size="sm" />
            <Text color={Colors.white}>{calendarVisible ? i18n.t('hideCalendar') : i18n.t('selectDate')}</Text>
          </HStack>
        </Button>
      </HStack>
    </Box>
  );
};

export default WorkerHomepage;

