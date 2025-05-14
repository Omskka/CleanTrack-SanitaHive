import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Pressable,
  ScrollView,
  Button,
  VStack,
  HStack,
  Input,
  InputField,
  Icon,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  Modal,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Textarea,
  TextareaInput
} from '@gluestack-ui/themed';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import { Calendar as CalendarIcon, Edit, Plus, Trash, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import UUID from 'react-native-uuid';
import { i18n, getCurrentLanguage } from '@/hooks/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, TouchableOpacity } from 'react-native';

// Mock API functions (to be replaced with actual API calls)
import { fetchTasks, fetchRooms, fetchAllUsers, createTask, updateTask, deleteTask } from '@/api/apiService';

interface Task {
  taskId: string;
  managerId: string;
  employeeId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  time: string;
  imageUrl: string;
  questionnaireOne: string;
  questionnaireTwo: string;
  questionnaireThree: string;
  questionnaireFour: string;
  isDone: boolean;
}

interface Room {
  id: number;
  roomName: string;
  roomFloor: string;
  teamId: string;
}

interface User {
  userId: string;
  name: string;
  surname: string;
  phoneNumber: string;
}

const TaskManagerScreen = () => {
  const [language, setLanguage] = useState<string>(getCurrentLanguage());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userID, setUserID] = useState('');
  const [calendarVisible, setCalendarVisible] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // For editing / creating tasks
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskRoom, setTaskRoom] = useState<string>('');
  const [taskEmployee, setTaskEmployee] = useState<string>('');
  const [taskStartTime, setTaskStartTime] = useState<Date>(new Date());
  const [taskEndTime, setTaskEndTime] = useState<Date>(new Date(Date.now() + 60 * 60 * 1000));

  // For DateTimePicker
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
  const [startTimeMode, setStartTimeMode] = useState<'date' | 'time'>('date');
  const [endTimeMode, setEndTimeMode] = useState<'date' | 'time'>('date');

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

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

  useEffect(() => {
    if (userID) {
      fetchTasksData();
      fetchRoomsData();
      fetchTeamMembersData();
    }
  }, [userID]);

  useEffect(() => {
    if (userID) {
      fetchTasksData();
    }
  }, [selectedDate]);

  const fetchTasksData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchTasks();
      // Filter tasks by manager ID and selected date
      const filteredTasks = response.filter((task: Task) => {
        const taskDate = new Date(task.startTime).toISOString().split('T')[0];
        const selected = selectedDate.toISOString().split('T')[0];
        return task.managerId === userID && taskDate === selected;
      });

      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(i18n.t('failedToFetchTasks'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomsData = async () => {
    try {
      const roomsData = await fetchRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchTeamMembersData = async () => {
    try {
      console.log('Fetching team members for userID:', userID);
      // Get all users
      const allUsers = await fetchAllUsers();
      console.log('All users fetched:', allUsers);

      // Fetch team to get employee IDs
      const teamRes = await fetch(`http://10.0.2.2:8080/api/v1/teams/${userID}`);
      if (!teamRes.ok) {
        console.error('Team fetch response not OK:', await teamRes.text());
        throw new Error('Failed to fetch team');
      }

      const team = await teamRes.json();
      console.log('Team data:', team);

      // Ensure employeeId is an array
      const employeeIds = Array.isArray(team.employeeId) ? team.employeeId :
        (team.employeeId ? [team.employeeId] : []);
      console.log('Employee IDs:', employeeIds);

      // Filter users to get team members
      const members = allUsers.filter((user: User) => employeeIds.includes(user.userId));
      console.log('Filtered team members:', members);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.dateString));
  };

  const handleShowModal = (task?: Task) => {
    if (task) {
      // Edit existing task
      setCurrentTask(task);
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskStartTime(new Date(task.startTime));
      setTaskEndTime(new Date(task.endTime));
      setTaskEmployee(task.employeeId);
      setTaskRoom(task.title); // Assuming title is used for room name
      setIsCreating(false);
    } else {
      // Create new task
      setCurrentTask(null);
      setTaskTitle('');
      setTaskDescription('');
      setTaskStartTime(new Date(selectedDate));
      setTaskEndTime(new Date(selectedDate.getTime() + 60 * 60 * 1000));
      setTaskEmployee('');
      setTaskRoom('');
      setIsCreating(true);
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setError('');
  };

  const handleSaveTask = async () => {
    if (!taskDescription || !taskRoom || !taskEmployee) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }

    if (taskEndTime <= taskStartTime) {
      setError(i18n.t('endTimeMustBeAfterStart'));
      return;
    }

    setIsLoading(true);
    try {
      const taskID = UUID.v4();
      const taskData = {
        taskId: taskID,
        managerId: userID,
        employeeId: taskEmployee,
        title: taskRoom, // Using room name as title
        description: taskDescription,
        startTime: taskStartTime,
        endTime: taskEndTime,
        time: taskStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: '',
        questionnaireOne: '',
        questionnaireTwo: '',
        questionnaireThree: '',
        questionnaireFour: '',
        isDone: currentTask?.isDone || false
      };

      if (isCreating) {
        await createTask(taskData);
      } else if (currentTask) {
        await updateTask(currentTask.taskId, taskData);
      }

      handleCloseModal();
      fetchTasksData();
    } catch (error) {
      console.error('Error saving task:', error);
      setError(i18n.t('failedToSaveTask'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDeleteModal = (task: Task) => {
    setCurrentTask(task);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;

    setIsLoading(true);
    try {
      await deleteTask(currentTask.taskId);
      setIsDeleteModalVisible(false);
      fetchTasksData();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(i18n.t('failedToDeleteTask'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTaskStartTime(selectedDate);

      // If end time is now before start time, adjust it
      if (taskEndTime <= selectedDate) {
        setTaskEndTime(new Date(selectedDate.getTime() + 60 * 60 * 1000));
      }
    }

    if (Platform.OS === 'android' && startTimeMode === 'date') {
      setStartTimeMode('time');
      setShowStartTimePicker(true);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTaskEndTime(selectedDate);
    }

    if (Platform.OS === 'android' && endTimeMode === 'date') {
      setEndTimeMode('time');
      setShowEndTimePicker(true);
    }
  };

  const showStartTimePickerModal = (mode: 'date' | 'time') => {
    setStartTimeMode(mode);
    setShowStartTimePicker(true);
  };

  const showEndTimePickerModal = (mode: 'date' | 'time') => {
    setEndTimeMode(mode);
    setShowEndTimePicker(true);
  };

  const renderDetail = (rowData: Task) => {
    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.title}</Text>
        </HStack>

        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>

        {/* Display employee name */}
        {teamMembers.find(member => member.userId === rowData.employeeId) && (
          <Text fontSize="$sm" color={Colors.text} mb="$3">
            {i18n.t('assignedTo')}: {
              (() => {
                const member = teamMembers.find(m => m.userId === rowData.employeeId);
                return member ? `${member.name} ${member.surname}` : 'Unknown';
              })()
            }
          </Text>
        )}

        <Text fontSize="$sm" color={Colors.black} fontWeight="$bold">
          {new Date(rowData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
          {new Date(rowData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {/* Calculate and display total time */}
        {(() => {
          const totalTimeInMillis = new Date(rowData.endTime).getTime() - new Date(rowData.startTime).getTime();
          const totalTimeInMinutes = totalTimeInMillis / 60000;
          const hours = Math.floor(totalTimeInMinutes / 60);
          const minutes = Math.round(totalTimeInMinutes % 60);
          return (
            <Text fontSize="$sm" color={Colors.black} mb="$3">
              {i18n.t('totalTime')}: {hours}h {minutes}m
            </Text>
          );
        })()}

        <HStack justifyContent="flex-end" space="md">
          <Button bg={Colors.text} onPress={() => handleShowModal(rowData)}>
            <Icon as={Edit} color={Colors.white} size="sm" />
            <Text color={Colors.white} ml="$1">{i18n.t('edit')}</Text>
          </Button>

          <Button bg={Colors.error} onPress={() => handleShowDeleteModal(rowData)}>
            <Icon as={Trash} color={Colors.white} size="sm" />
          </Button>
        </HStack>
      </Box>
    );
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box flex={1} p="$2" bg={Colors.background}>
      <VStack mt="$7">
        <Pressable position="absolute" top={16} right={16} zIndex={10} onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}>
          <Text fontWeight="$bold" color={Colors.text}>{language === 'en' ? 'TR' : 'EN'}</Text>
        </Pressable>

        <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading} mb="$4">{i18n.t('taskManager')}</Text>
      </VStack>

      <ScrollView flex={1} mb="$2">
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

        <Box p="$3" pl={0} borderRadius="$2xl" mb="$4">
          <Timeline
            data={tasks.map(task => ({
              time: new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: task.title,
              description: task.description,
              startTime: task.startTime,
              endTime: task.endTime,
              employeeId: task.employeeId,
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

          {tasks.length === 0 && !isLoading && (
            <Box alignItems="center" py="$6">
              <Text color={Colors.gray}>{i18n.t('noTasksFound')}</Text>
            </Box>
          )}

          {isLoading && (
            <Box alignItems="center" py="$6">
              <Text color={Colors.gray}>{i18n.t('loading')}</Text>
            </Box>
          )}
        </Box>
      </ScrollView>

      <HStack space="md" justifyContent="space-between" mb="$4">
        <Button flex={1} bg={Colors.heading} borderRadius="$lg" onPress={() => handleShowModal()}>
          <HStack alignItems="center" justifyContent="center" space="sm">
            <Icon as={Plus} color={Colors.white} size="sm" />
            <Text color={Colors.white}>{i18n.t('createTask')}</Text>
          </HStack>
        </Button>

        <Button flex={1} variant="outline" bg={Colors.heading} borderRadius="$lg" onPress={() => setCalendarVisible(!calendarVisible)}>
          <HStack alignItems="center" justifyContent="center" space="sm">
            <Icon as={CalendarIcon} color={Colors.white} size="sm" />
            <Text color={Colors.white}>{calendarVisible ? i18n.t('hideCalendar') : i18n.t('selectDate')}</Text>
          </HStack>
        </Button>
      </HStack>

      {/* Task Edit/Create Modal */}
      <Modal isOpen={modalVisible} onClose={handleCloseModal} avoidKeyboard>
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontWeight="$bold" fontSize="$lg">
              {isCreating ? i18n.t('createTask') : i18n.t('editTask')}
            </Text>
          </Modal.Header>

          <Modal.Body>
            {error ? <Text color={Colors.error} mb="$2">{error}</Text> : null}

            <FormControl mb="$4">
              <FormControlLabel>
                <FormControlLabelText>{i18n.t('selectRoom')}</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={taskRoom}
                onValueChange={value => setTaskRoom(value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder={i18n.t('selectRoom')} />
                  <SelectIcon>
                    <Icon as={ChevronDown} />
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} label={room.roomName} value={room.roomName} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            <FormControl mb="$4">
              <FormControlLabel>
                <FormControlLabelText>{i18n.t('assignTo')}</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={taskEmployee}
                onValueChange={value => setTaskEmployee(value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder={i18n.t('selectEmployee')} />
                  <SelectIcon>
                    <Icon as={ChevronDown} />
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {teamMembers.map((member) => (
                      <SelectItem
                        key={`employee-${member.userId}`}
                        label={`${member.name} ${member.surname}`}
                        value={member.userId}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            <FormControl mb="$4">
              <FormControlLabel>
                <FormControlLabelText>{i18n.t('description')}</FormControlLabelText>
              </FormControlLabel>
              <Textarea>
                <TextareaInput
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  placeholder={i18n.t('enterDescription')}
                />
              </Textarea>
            </FormControl>

            <FormControl mb="$4">
              <FormControlLabel>
                <FormControlLabelText>{i18n.t('startTime')}</FormControlLabelText>
              </FormControlLabel>
              <TouchableOpacity onPress={() => showStartTimePickerModal('date')}>
                <Input isDisabled={true}>
                  <InputField value={formatDateForDisplay(taskStartTime)} />
                </Input>
              </TouchableOpacity>
            </FormControl>

            <FormControl mb="$4">
              <FormControlLabel>
                <FormControlLabelText>{i18n.t('endTime')}</FormControlLabelText>
              </FormControlLabel>
              <TouchableOpacity onPress={() => showEndTimePickerModal('date')}>
                <Input isDisabled={true}>
                  <InputField value={formatDateForDisplay(taskEndTime)} />
                </Input>
              </TouchableOpacity>
            </FormControl>

            {showStartTimePicker && (
              <DateTimePicker
                value={taskStartTime}
                mode={startTimeMode}
                is24Hour={true}
                display="default"
                onChange={handleStartTimeChange}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={taskEndTime}
                mode={endTimeMode}
                is24Hour={true}
                display="default"
                onChange={handleEndTimeChange}
              />
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline" mr="$3" onPress={handleCloseModal}>
              <Text>{i18n.t('cancel')}</Text>
            </Button>
            <Button bg={Colors.text} onPress={handleSaveTask} isDisabled={isLoading}>
              <Text color={Colors.white}>
                {isLoading ? i18n.t('saving') : i18n.t('save')}
              </Text>
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalVisible} onClose={() => setIsDeleteModalVisible(false)}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontWeight="$bold">{i18n.t('confirmDelete')}</Text>
          </Modal.Header>

          <Modal.Body>
            <Text>{i18n.t('deleteTaskConfirmation')}</Text>
            {currentTask && (
              <Text fontWeight="$bold" mt="$2">{currentTask.title}</Text>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline" mr="$3" onPress={() => setIsDeleteModalVisible(false)}>
              <Text>{i18n.t('cancel')}</Text>
            </Button>
            <Button bg={Colors.error} onPress={handleDeleteTask} isDisabled={isLoading}>
              <Text color={Colors.white}>
                {isLoading ? i18n.t('deleting') : i18n.t('delete')}
              </Text>
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default TaskManagerScreen;