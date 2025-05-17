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
  TextareaInput
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


import { fetchAllUsers, fetchTasks, fetchTeam, markTaskAsDone } from '@/api/apiService';

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
  const [productUsage, setProductUsage] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [safety, setSafety] = useState<string[]>([]);
  const [satisfaction, setSatisfaction] = useState<string[]>([]);
  const [roomCondition, setRoomCondition] = useState<string>('');
  const [otherDescription, setOtherDescription] = useState('');
  const [yesDescription, setYesDescription] = useState('');

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const { language, changeLanguage } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userID, setUserID] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImages>({});
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString));

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Remove user token from AsyncStorage
      router.replace('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reset modal form fields
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

  const isFormValid = () => {
    if (!productUsage[0] || challenges.length === 0 || !safety[0] || !roomCondition || !satisfaction[0] ||
      !currentTaskId || !uploadedImages[currentTaskId] || uploadedImages[currentTaskId].length < 1 ||
      (challenges.includes('other') && !otherDescription.trim())) {
      alert(i18n.t('fillRequiredFields'));
      return false;
    }
    return true;
  };

  const removeImage = (taskId: string, imageUri: string) => {
    const updatedImages = { ...uploadedImages };
    updatedImages[taskId] = updatedImages[taskId].filter((uri: string) => uri !== imageUri); // Silinen fotoğrafın URI'sini listeden çıkarıyoruz
    setUploadedImages(updatedImages);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasksFromDatabase();
    setRefreshing(false);
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
        alert(i18n.t('userIdUnavailable'));
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

  const fetchTasksFromDatabase = async () => {
    try {
      const response = await fetchTasks(); // Fetch tasks from the backend
      const merged = mergeTasks(response, tasks); // Merge with existing tasks
      setTasks(merged);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchTasksFromDatabase();
    }
  }, [userID]);

  // Submit task
  const submitTask = async (taskId: string) => {
    try {
      await markTaskAsDone(taskId); // Mark the task as done in backend
      setTasks(tasks.map(task =>
        task.taskId === taskId ? { ...task, done: true } : task
      ));
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

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

        {rowData.done ? (
          <Text mt="$2" color={Colors.text}>{i18n.t('completed')}</Text>
        ) : (
          <>
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
                    <Icon as={CheckIcon} color={Colors.error} size="sm" />
                  </Pressable>
                </Box>
              ))}
            </HStack>

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
    <Box flex={1} p="$2" bg={Colors.background}>
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

      <HStack space="xs" justifyContent="space-between" mb="$4">
        <Button flex={1} bg={Colors.heading} borderRadius="$lg" onPress={() => callPhone()}>
          <HStack alignItems="center" justifyContent="center" space="xs">
            <Icon as={Phone} color={Colors.white} size="sm" />
            <Text color={Colors.white}>{i18n.t('contactManager')}</Text>
          </HStack>
        </Button>

        <Button flex={1} variant="outline" bg={Colors.heading} borderRadius="$lg" onPress={() => setCalendarVisible(!calendarVisible)}>
          <HStack alignItems="center" justifyContent="center" space="xs">
            <Icon as={CalendarIcon} color={Colors.white} size="sm" />
            <Text color={Colors.white}>{calendarVisible ? i18n.t('hideCalendar') : i18n.t('selectDate')}</Text>
          </HStack>
        </Button>
      </HStack>

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
            <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading}>{i18n.t('taskFeedback')}</Text>
          </Modal.Header>
          <Modal.Body>
            <VStack space="md">
              <Text fontWeight="$bold" ml="$2" mt="$1" color={Colors.text}>1. {i18n.t('productUsageQuestion')}</Text>
              <RadioGroup value={productUsage[0] || ''} onChange={(value: string) => setProductUsage([value])}>
                <Radio value="less" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('lessThanExpected')}</RadioLabel>
                </Radio>
                <Radio value="expected" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('asExpected')}</RadioLabel>
                </Radio>
                <Radio value="more" size="md">
                  <RadioIndicator>
                    <RadioIcon as={CircleIcon} />
                  </RadioIndicator>
                  <RadioLabel ml="$1">{i18n.t('moreThanExpected')}</RadioLabel>
                </Radio>
              </RadioGroup>

              <Text fontWeight="$bold" ml="$2" mt="$1" color={Colors.text}>2. {i18n.t('challengeQuestion')}</Text>
              <VStack space="md">
                {[
                  { value: 'equipment', label: i18n.t('lackOfEquipment') },
                  { value: 'instructions', label: i18n.t('incompleteInstructions') },
                  { value: 'shortage', label: i18n.t('shortageOfProducts') },
                  { value: 'time', label: i18n.t('timeConstraints') },
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
              {challenges.includes('other') && (
                <Textarea mt="$2">
                  <TextareaInput
                    placeholder={i18n.t('describeOther')}
                    value={otherDescription}
                    onChangeText={setOtherDescription}
                  />
                </Textarea>
              )}

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
              {safety[0] === 'yes' && (
                <Textarea mt="$2">
                  <TextareaInput
                    placeholder={i18n.t('describeSafety')}
                    value={yesDescription}
                    onChangeText={setYesDescription}
                  />
                </Textarea>
              )}

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

              <Text color={Colors.text} fontWeight="$bold" mt="$1" ml="$2">6. {i18n.t('uploadImage')}</Text>
              <Button
                bg={Colors.tint}
                onPress={() => {
                  if (currentTaskId) takePicture(currentTaskId);
                }}
              >
                <Text color={Colors.text}>{i18n.t('uploadImage')}</Text>
              </Button>

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

          <Modal.Footer>
            <Button
              onPress={async () => {
                if (!isFormValid()) return;

                if (currentTaskId) {
                  await submitTask(currentTaskId);
                  setModalVisible(false);
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

