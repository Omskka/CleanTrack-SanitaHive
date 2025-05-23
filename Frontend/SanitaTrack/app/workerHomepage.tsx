import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Text,
  Pressable,
  ScrollView,
  Button,
  VStack,
  HStack,
  Image,
  Icon,
  Modal,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  RadioIcon,
  CircleIcon,
  Checkbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
  CheckIcon,
  Textarea,
  TextareaInput,
  Heading
} from '@gluestack-ui/themed';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import { Phone, Calendar as CalendarIcon, X, LogOut } from 'lucide-react-native';
import { Linking, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useLanguage } from '@/app/contexts/LanguageContext';
import * as FileSystem from 'expo-file-system';

import { fetchAllUsers, fetchTasks, fetchTeam, getTaskStatus, markTaskAsDone, updateTask, uploadImage } from '@/api/apiService';

// Task and User interfaces for type safety
interface Task {
  taskId: string; // corresponds to `id: ObjectId`
  managerId: string;
  employeeId: string;
  title: string;
  description: string;
  startTime: Date; // ISO format, e.g., '2025-05-11T14:30:00'
  endTime: Date;   // ISO format
  submissionTime: Date;   // ISO format
  time: string; // e.g., '14:30'
  imageUrl: string;
  questionnaireOne: string;
  questionnaireTwo: string;
  questionnaireThree: string;
  questionnaireFour: string;
  questionnaireFive: string;
  done: boolean;
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
  // State variables for feedback form fields
  const [productUsage, setProductUsage] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [safety, setSafety] = useState<string[]>([]);
  const [satisfaction, setSatisfaction] = useState<string[]>([]);
  const [roomCondition, setRoomCondition] = useState<string>('');
  const [otherDescription, setOtherDescription] = useState('');
  const [yesDescription, setYesDescription] = useState('');

  // State variables for UI and data
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [modalVisible, setModalVisible] = useState(false); // Feedback modal visibility
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null); // Task being submitted
  const { language, changeLanguage } = useLanguage(); // Language context
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Selected date in calendar
  const [tasks, setTasks] = useState<Task[]>([]); // All tasks
  const [userID, setUserID] = useState(''); // Current user ID
  const [uploadedImages, setUploadedImages] = useState<UploadedImages>({}); // Uploaded images per task
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false); // Calendar visibility
  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString)); // Calendar day select

  // Logout function: removes user token and redirects to login
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Remove user token from AsyncStorage
      router.replace('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reset modal form fields to initial state
  const resetForm = () => {
    setProductUsage(['']);
    setChallenges([]);
    setOtherDescription('');
    setSafety(['']);
    setYesDescription('');
    setRoomCondition('');
    setSatisfaction(['']);
    setCurrentTaskId(null);
    setUploadedImages({});
  };

  // Validate feedback form before submission
  const isFormValid = () => {
    if (!productUsage[0] || challenges.length === 0 || !safety[0] || !roomCondition || !satisfaction[0] ||
      !currentTaskId || !uploadedImages[currentTaskId] || uploadedImages[currentTaskId].length < 1 ||
      (challenges.includes('other') && !otherDescription.trim())) {
      alert(i18n.t('fillRequiredFields'));
      return false;
    }
    return true;
  };

  // Remove an uploaded image from a task
  const removeImage = (taskId: string, imageUri: string) => {
    const updatedImages = { ...uploadedImages };
    updatedImages[taskId] = updatedImages[taskId].filter((uri: string) => uri !== imageUri);
    setUploadedImages(updatedImages);
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasksFromDatabase();
    setRefreshing(false);
  };

  // Fetch user ID from AsyncStorage on mount
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

  // Call manager function: finds manager's phone and initiates a call
  const callPhone = async () => {
    try {
      console.log("UserID :", userID);

      if (!userID) {
        console.error("❌ userID is not set yet.");
        alert(i18n.t('userIdUnavailable'));
        return;
      }

      // Step 1: Fetch the user's team

      // Clean userId for comparison
      const cleanedUserID = userID.replace(/^"(.*)"$/, '$1').trim();
      const team = await fetchTeam(cleanedUserID);

      console.log("Team:", team);

      const managerUserID = team.managerId;
      console.log("Manager UserID:", managerUserID);
      if (!managerUserID) {
        console.error("❌ Manager UserID is not available.");
        alert(i18n.t('managerIdUnavailable'));
        return;
      }

      // Step 2: Fetch all users and find the manager
      const allUsers = await fetchAllUsers();
      const manager = allUsers.find((user: User) => user.userId === managerUserID);

      if (!manager) {
        console.error("❌ Manager not found in user list.");
        alert(i18n.t('managerNotFound'));
        return;
      }

      const phoneNumber = manager.phoneNumber;
      console.log("📞 Calling phone number:", phoneNumber);

      // Step 3: Call the manager
      Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.error("❌ Error calling manager:", error);
      alert(i18n.t('callFailed'));
    }
  };

  const cleanedUserId = userID.replace(/^"+|"+$/g, '').trim();

  // Filter tasks for the selected date and current user
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.startTime).toISOString().split('T')[0];
      const selected = selectedDate.toISOString().split('T')[0];

      const employeeId = String(task.employeeId).trim();
      const matchesDate = taskDate === selected;
      const matchesUser = employeeId === cleanedUserId;

      return matchesDate && matchesUser;
    });
  }, [tasks, selectedDate, cleanedUserId]);

  // Take a picture and add it to uploaded images for a task
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

  // Merge new tasks with existing tasks, preserving done status
  const mergeTasks = (newTasks: Task[], existingTasks: Task[]): Task[] => {
    const existingTaskMap = new Map(existingTasks.map(task => [task.taskId, task]));

    return newTasks.map(task => {
      const existing = existingTaskMap.get(task.taskId);
      if (existing) {
        return {
          ...task,
          done: existing.done || task.done, // if the existing task is done, keep it as done
        };
      }
      return task; // new task
    });
  };

  // Fetch tasks from backend and update state
  const fetchTasksFromDatabase = async () => {
    try {
      const response = await fetchTasks(); // Fetch tasks from the backend
      const merged = mergeTasks(response, tasks); // Merge with existing tasks
      setTasks(merged);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch tasks when userID changes
  useEffect(() => {
    if (userID) {
      fetchTasksFromDatabase();
    }
  }, [userID]);

  // Submit feedback for a task
  const submitTask = async (
    taskId: string,
    updatedData: {
      submissionTime: Date;
      questionnaireOne: string;
      questionnaireTwo: string;
      questionnaireThree: string;
      questionnaireFour: string;
      questionnaireFive: string;
      imageUrl?: string; // make optional
    }
  ) => {
    try {
      const existingTask = tasks.find(task => task.taskId === taskId);
      if (!existingTask) throw new Error("Task not found in local state");

      // Use fallback imageUrl if not provided
      const imageUrlToUse = updatedData.imageUrl || existingTask.imageUrl || '';
      console.log('Using imageUrl for update:', imageUrlToUse);
      const updatedTask = {
        ...existingTask,
        ...updatedData,
        imageUrl: imageUrlToUse, // ensure imageUrl always preserved
        done: true,
      };

      const updated = await updateTask(taskId, updatedTask);
      setTasks(tasks.map(task =>
        task.taskId === taskId ? updated : task
      ));
    } catch (err) {
      console.error('Failed to update task with questionnaire:', err);
    }
  };

  // Render details for each task in the timeline
  const renderDetail = (rowData: Task) => {
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

    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        {/* Task title and room */}
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.title}</Text>
        </HStack>
        {/* Task description and time */}
        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>
        <Text fontSize="$sm" color={Colors.black} fontWeight="$bold">{formattedStart} - {formattedEnd}</Text>
        <Text fontSize="$sm" color={Colors.black}>{i18n.t('totalTime')}: {formattedTotalTime}</Text>

        {/* If task is done, show completed text, else show image upload and submit button */}
        {rowData.done ? (
          <Text mt="$2" color={Colors.text}>{i18n.t('completed')}</Text>
        ) : (
          <>
            {/* Uploaded images preview */}
            <HStack flexWrap="wrap" mb="$3">
              {uploadedImages[rowData.taskId]?.map((uri, index) => (
                <Box key={index} position="relative">
                  <Image
                    source={{ uri }}
                    alt={`img-${index}`}
                    width={80}
                    height={80}
                    borderRadius={8}
                    mr="$2"
                    mb="$2"
                  />
                  {/* Delete Button */}
                  <Pressable
                    position="absolute"
                    top={-5}
                    right={-5}
                    onPress={() => removeImage(rowData.taskId, uri)}
                  >
                    <Icon as={X} color={Colors.error} size="sm" />
                  </Pressable>
                </Box>
              ))}
            </HStack>
            {/* Submit feedback button */}
            <HStack justifyContent="flex-end" space="md">
              <Button
                bg={Colors.text}
                onPress={() => {
                  setCurrentTaskId(rowData.taskId);
                  setModalVisible(true);
                }}
                size="sm"
                isDisabled={rowData.done}
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
    <Box flex={1} bg={Colors.background}>
      {/* Header with welcome, language switch, and logout */}
      <Box px="$4" py="$4" bg={Colors.white}>
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg" color={Colors.heading}>{i18n.t('welcome')}</Heading>
          {/* Language switch button */}
          <HStack alignItems='center' space="md">
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

      {/* Footer with contact manager and calendar toggle */}
      <Box bg={Colors.white} px="$4" py="$4">
        <HStack space="md" justifyContent="space-between">
          {/* Contact manager button */}
          <Button flex={1} bg={Colors.text} borderRadius="$lg" onPress={() => callPhone()}>
            <HStack alignItems="center" justifyContent="center" space="sm">
              <Icon as={Phone} color={Colors.white} size="sm" />
              <Text color={Colors.white}>{i18n.t('contactManager')}</Text>
            </HStack>
          </Button>
          {/* Calendar toggle button */}
          <Button flex={1} bg={Colors.text} borderRadius="$lg" onPress={() => setCalendarVisible(!calendarVisible)}>
            <HStack alignItems="center" justifyContent="center" space="sm">
              <Icon as={CalendarIcon} color={Colors.white} size="sm" />
              <Text color={Colors.white}>{calendarVisible ? i18n.t('hideCalendar') : i18n.t('selectDate')}</Text>
            </HStack>
          </Button>
        </HStack>
      </Box>

      {/* Feedback Modal for submitting task feedback */}
      <Modal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <Modal.Backdrop />
        <Modal.Content maxWidth="$96" height="85%">
          <Modal.CloseButton />
          <Modal.Header alignItems="center" justifyContent="center">
            {/* Modal header with feedback title */}
            <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading}>{i18n.t('taskFeedback')}</Text>
          </Modal.Header>
          <Modal.Body>
            <VStack space="md">
              {/* 1. Product Usage Question */}
              <Text fontWeight="$bold" ml="$2" mt="$1" color={Colors.text}>1. {i18n.t('productUsageQuestion')}</Text>
              <RadioGroup value={productUsage[0] || ''} onChange={(value: string) => setProductUsage([value])}>
                <Radio value="less" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('less')}</RadioLabel>
                </Radio>
                <Radio value="expected" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('expected')}</RadioLabel>
                </Radio>
                <Radio value="more" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('more')}</RadioLabel>
                </Radio>
              </RadioGroup>

              {/* 2. Challenge Question */}
              <Text fontWeight="$bold" ml="$2" mt="$1" color={Colors.text}>2. {i18n.t('challengeQuestion')}</Text>
              <VStack space="md">
                {[
                  { value: 'equipment', label: i18n.t('equipment') },
                  { value: 'instructions', label: i18n.t('instructions') },
                  { value: 'shortage', label: i18n.t('shortage') },
                  { value: 'time', label: i18n.t('time') },
                  { value: 'other', label: i18n.t('other') },
                ].map(option => (
                  <Checkbox
                    key={option.value}
                    value={option.value}
                    size="md"
                    isChecked={challenges.includes(option.value)}
                    onChange={() => {
                      setChallenges(prev =>
                        prev.includes(option.value)
                          ? prev.filter(v => v !== option.value)
                          : [...prev, option.value]
                      );
                    }}
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon as={CheckIcon} />
                    </CheckboxIndicator>
                    <CheckboxLabel ml="$1">{option.label}</CheckboxLabel>
                  </Checkbox>
                ))}
              </VStack>

              {/* If 'other' is selected, show a textarea for description */}
              {challenges.includes('other') && (
                <Textarea mt="$2">
                  <TextareaInput
                    placeholder={i18n.t('describeOther')}
                    value={otherDescription}
                    onChangeText={setOtherDescription}
                  />
                </Textarea>
              )}


              {/* 3. Safety Question */}
              <Text fontWeight="$bold" ml="$2" mt="$1" color={Colors.text}>3. {i18n.t('safetyQuestion')}</Text>
              <RadioGroup value={safety[0] || ''} onChange={(value: string) => setSafety([value])}>
                <Radio value="yes" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('yes')}</RadioLabel>
                </Radio>
                <Radio value="no" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('no')}</RadioLabel>
                </Radio>
              </RadioGroup>
              {/* If 'yes' is selected, show a textarea for description */}
              {safety[0] === 'yes' && (
                <Textarea mt="$2">
                  <TextareaInput
                    placeholder={i18n.t('describeSafety')}
                    value={yesDescription}
                    onChangeText={setYesDescription}
                  />
                </Textarea>
              )}

              {/* 4. Room Condition */}
              <Text fontWeight="$bold" ml="$2" mt="$1" color={Colors.text}>4. {i18n.t('roomCondition')}</Text>
              <RadioGroup value={roomCondition} onChange={(value: string) => setRoomCondition(value)}>
                <Radio value="excellent" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('excellent')}</RadioLabel>
                </Radio>

                <Radio value="good" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('good')}</RadioLabel>
                </Radio>

                <Radio value="fair" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('fair')}</RadioLabel>
                </Radio>

                <Radio value="poor" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('poor')}</RadioLabel>
                </Radio>

                <Radio value="unacceptable" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('unacceptable')}</RadioLabel>
                </Radio>
              </RadioGroup>

              {/* 5. Overall Satisfaction */}
              <Text fontWeight="$bold" ml="$2" mt="$1" color={Colors.text}>5. {i18n.t('overallSatisfaction')}</Text>
              <RadioGroup value={satisfaction[0] || ''} onChange={(value: string) => setSatisfaction([value])}>
                <Radio value="verySatisfied" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('verySatisfied')}</RadioLabel>
                </Radio>
                <Radio value="satisfied" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('satisfied')}</RadioLabel>
                </Radio>
                <Radio value="neutral" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('neutral')}</RadioLabel>
                </Radio>
                <Radio value="dissatisfied" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('dissatisfied')}</RadioLabel>
                </Radio>
                <Radio value="veryDissatisfied" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('veryDissatisfied')}</RadioLabel>
                </Radio>
              </RadioGroup>

              {/* 6. Upload Image */}
              <Text color={Colors.text} fontWeight="$bold" mt="$1" ml="$2">6. {i18n.t('uploadImage')}</Text>
              <Button
                bg={Colors.tint}
                onPress={() => {
                  if (currentTaskId) takePicture(currentTaskId);
                }}
              >
                <Text color={Colors.text}>{i18n.t('uploadImage')}</Text>
              </Button>

              {/* Uploaded images preview in modal */}
              <HStack flexWrap="wrap" mt="$3">
                {currentTaskId &&
                  uploadedImages[currentTaskId]?.map((uri, index) => (
                    <Box key={index} position="relative">
                      <Image
                        source={{ uri }}
                        alt={`img-${index}`}
                        width={80}
                        height={80}
                        borderRadius={8}
                        mr="$2"
                        mb="$2"
                      />
                      {/* Delete Button */}
                      <Pressable
                        position="absolute"
                        top={-5}
                        right={-5}
                        onPress={() => removeImage(currentTaskId, uri)}
                      >
                        <Icon as={X} color={Colors.error} size="sm" />
                      </Pressable>
                    </Box>
                  ))}
              </HStack>
            </VStack>
          </Modal.Body>

          {/* Modal footer with submit button */}
          <Modal.Footer>
            <Button
              onPress={async () => {
                if (!isFormValid()) return;
                if (currentTaskId) {
                  try {
                    const localUri = uploadedImages[currentTaskId]?.[0];
                    let imageUrl = '';

                    if (localUri && localUri.startsWith('file://')) {
                      const uploadedImageData = await uploadImage(localUri);
                      imageUrl = uploadedImageData.url;
                      console.log('Uploaded image data:', uploadedImageData);
                    } else {
                      imageUrl = localUri || '';
                    }

                    await submitTask(currentTaskId, {
                      submissionTime: new Date(),
                      questionnaireOne: productUsage[0] || '',
                      questionnaireTwo: challenges.length > 0
                        ? challenges.join(', ') + (challenges.includes('other') && otherDescription ? `: ${otherDescription}` : '')
                        : '',
                      questionnaireThree: safety[0] || '',
                      questionnaireFour: roomCondition,
                      questionnaireFive: satisfaction[0] || '',
                      imageUrl: imageUrl,
                    });

                    setModalVisible(false);
                  } catch (err) {
                    console.error('Failed to upload image and submit task:', err);
                  }
                }
              }}
              bg={Colors.text}
            >
              <Text color={Colors.white}>{i18n.t('submit')}</Text>
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default WorkerHomepage;