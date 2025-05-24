import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
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
  TextareaInput,
  Heading,
  ScrollView
} from '@gluestack-ui/themed';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import { Calendar as CalendarIcon, Edit, Plus, Trash, ChevronDown, Scroll } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import UUID from 'react-native-uuid';
import { i18n } from '@/hooks/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock API functions (to be replaced with actual API calls)
import { fetchTasks, fetchRooms, fetchAllUsers, createTask, updateTask, deleteTask, fetchTeamByManager } from '@/api/apiService';

// Task, Room, and User interfaces for type safety
interface Task {
  taskId: string;
  managerId: string;
  employeeId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  submissionTime: Date;
  imageUrl: string;
  questionnaireOne: string;
  questionnaireTwo: string;
  questionnaireThree: string;
  questionnaireFour: string;
  questionnaireFive: string;
  done: boolean;
  member?: User;
}

interface Room {
  roomId: number;
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
  // State for currently selected date in the calendar
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // State for all tasks for the selected date
  const [tasks, setTasks] = useState<Task[]>([]);
  // State for current manager's user ID
  const [userID, setUserID] = useState('');
  // State to show/hide the calendar
  const [calendarVisible, setCalendarVisible] = useState<boolean>(true);
  // State to show/hide the task modal (create/edit)
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  // State to show/hide the delete confirmation modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  // State to determine if creating a new task or editing
  const [isCreating, setIsCreating] = useState<boolean>(false);
  // State for all rooms fetched from backend
  const [rooms, setRooms] = useState<Room[]>([]);
  // State for all team members fetched from backend
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  // State for loading spinner
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState<boolean>(false);
  // State for error messages
  const [error, setError] = useState<string>('');
  // Get current language from context (triggers re-render on language change)
  const { language } = useLanguage();

  // States for task form fields
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskRoom, setTaskRoom] = useState<string>('');
  const [taskEmployee, setTaskEmployee] = useState<string>('');
  const [taskStartTime, setTaskStartTime] = useState<Date>(new Date());
  const [taskEndTime, setTaskEndTime] = useState<Date>(new Date(Date.now() + 60 * 60 * 1000));

  // States for DateTimePicker
  const [showStartTimePicker, setShowStartTimePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);
  const [startTimeMode, setStartTimeMode] = useState<'date' | 'time'>('date');
  const [endTimeMode, setEndTimeMode] = useState<'date' | 'time'>('date');

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

  // Fetch tasks, rooms, and team members when userID changes
  useEffect(() => {
    if (userID) {
      fetchTasksData();
      fetchRoomsData();
      fetchTeamMembersData();
    }
  }, [userID]);

  // Fetch tasks again when selected date changes
  useEffect(() => {
    if (userID) {
      fetchTasksData();
    }
  }, [selectedDate]);

  // Fetch tasks from backend and filter by manager and date
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
      setRefreshing(false);
    }
  };

  // Fetch all rooms from backend
  const fetchRoomsData = async () => {
    try {
      const roomsData = await fetchRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Fetch all team members for this manager from backend
  const fetchTeamMembersData = async () => {
    try {
      console.log('Fetching team members for userID:', userID);

      // 1. Get all users
      const allUsers = await fetchAllUsers();
      console.log('All users fetched:', allUsers);

      // 2. Fetch team to get employee IDs
      const team = await fetchTeamByManager(userID);
      console.log('Team data:', team);

      // 3. Ensure employeeId is an array
      const employeeIds = Array.isArray(team.employeeId)
        ? team.employeeId
        : team.employeeId
          ? [team.employeeId]
          : [];

      console.log('Employee IDs:', employeeIds);

      // 4. Filter users to get team members
      const members = allUsers.filter((user: User) => employeeIds.includes(user.userId));
      console.log('Filtered team members:', members);

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasksData();
    fetchRoomsData();
    fetchTeamMembersData();
  }, [userID, selectedDate]);

  // Handler for selecting a day in the calendar
  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.dateString));
  };

  // Show modal for creating or editing a task
  const handleShowModal = (task?: Task) => {
    // Don't allow editing for completed tasks
    if (task && task.done) {
      return;
    }

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

  // Close the create/edit modal and clear errors
  const handleCloseModal = () => {
    setModalVisible(false);
    setError('');
  };

  // Save a new or edited task to the backend
  const handleSaveTask = async () => {
    // Validate required fields
    if (!taskDescription || !taskRoom || !taskEmployee) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }

    // Validate time logic
    if (taskEndTime <= taskStartTime) {
      setError(i18n.t('endTimeMustBeAfterStart'));
      return;
    }

    setIsLoading(true);
    try {
      // Prepare task data
      const taskID = isCreating ? UUID.v4() : (currentTask?.taskId || UUID.v4());
      const taskData = {
        taskId: taskID,
        managerId: userID,
        employeeId: taskEmployee,
        title: taskRoom, // Using room name as title
        description: taskDescription,
        startTime: taskStartTime,
        endTime: taskEndTime,
        submissionTime: new Date(),
        time: taskStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: '',
        questionnaireOne: '',
        questionnaireTwo: '',
        questionnaireThree: '',
        questionnaireFour: '',
        questionnaireFive: '',
        done: currentTask?.done || false
      };

      // Create or update task
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

  // Show delete confirmation modal for a task
  const handleShowDeleteModal = (task: Task) => {
    // Don't allow deleting completed tasks
    if (task.done) {
      return;
    }
    setCurrentTask(task);
    setIsDeleteModalVisible(true);
  };

  // Delete a task from the backend
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

  // Handle changes from the start time picker
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

  // Handle changes from the end time picker
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

  // Show the start time picker modal
  const showStartTimePickerModal = (mode: 'date' | 'time') => {
    setStartTimeMode(mode);
    setShowStartTimePicker(true);
  };

  // Show the end time picker modal
  const showEndTimePickerModal = (mode: 'date' | 'time') => {
    setEndTimeMode(mode);
    setShowEndTimePicker(true);
  };

  // Render details for each task in the timeline
  const renderDetail = (rowData: Task) => {
    // Calculate total time
    const startTime = new Date(rowData.startTime);
    const endTime = new Date(rowData.endTime);
    const totalTimeInMillis = endTime.getTime() - startTime.getTime();
    const totalTimeInMinutes = totalTimeInMillis / 60000;
    const hours = Math.floor(totalTimeInMinutes / 60);
    const minutes = Math.round(totalTimeInMinutes % 60);
    const formattedTotalTime = `${hours}h ${minutes}m`;

    // Format time strings
    const formattedStart = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedEnd = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.title}</Text>
        </HStack>

        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>

        {/* Display employee name */}
        {rowData.member && (
          <Text fontSize="$sm" color={Colors.text} mb="$3">
            {i18n.t('assignedTo')}: {
              (() => {
                return `${rowData.member.name} ${rowData.member.surname}`;
              })()
            }
          </Text>
        )}

        <Text fontSize="$sm" color={Colors.black} fontWeight="$bold">
          {formattedStart} - {formattedEnd}
        </Text>

        <Text fontSize="$sm" color={Colors.black} mb="$3">
          {i18n.t('totalTime')}: {formattedTotalTime}
        </Text>

        {/* Show completed status if task is done */}
        {rowData.done ? (
          <Text mt="$2" color={Colors.text} fontWeight="$bold">{i18n.t('completed')}</Text>
        ) : (
          <HStack justifyContent="flex-end" space="md">
            <Button bg={Colors.text} onPress={() => handleShowModal(rowData)}>
              <Icon as={Edit} color={Colors.white} size="sm" />
              <Text color={Colors.white} ml="$1">{i18n.t('edit')}</Text>
            </Button>

            <Button bg={Colors.error} onPress={() => handleShowDeleteModal(rowData)}>
              <Icon as={Trash} color={Colors.white} size="sm" />
            </Button>
          </HStack>
        )}
      </Box>
    );
  };

  // Format date and time for display in input fields
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header */}
      <Box p="$4" pt="$9" bg={Colors.white}>
        <Heading size="lg" color={Colors.heading}>{i18n.t('taskManager')}</Heading>
      </Box>

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

        {/* Timeline takes the remaining space */}
        <Box flex={1} borderRadius="$2xl" mb="$4">
          <Timeline
            data={tasks.map(task => ({
              time: new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: task.title,
              description: task.description,
              startTime: task.startTime,
              endTime: task.endTime,
              employeeId: task.employeeId,
              taskId: task.taskId,
              done: task.done, // Make sure to include the done property
              member: teamMembers.find(x => x.userId == task.employeeId),
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
          {tasks.length === 0 && !isLoading && !refreshing && (
            <Box alignItems="center" py="$6">
              <Text color={Colors.gray}>{i18n.t('noTasksFound')}</Text>
            </Box>
          )}

          {/* Show loading message if refreshing or loading */}
          {(isLoading || refreshing) && tasks.length === 0 && (
            <Box alignItems="center" py="$6">
              <Text color={Colors.gray}>{i18n.t('loading')}</Text>
            </Box>
          )}
        </Box>
      </ScrollView>

      {/* Footer - Similar to RoomsScreen */}
      {/* Footer Actions - Similar to RoomsScreen */}
      <Box bg={Colors.white} px="$4" py="$4">
        <HStack space="md" justifyContent="space-between">
          {/* Button to open modal for creating a new task */}
          <Button flex={1} bg={Colors.text} borderRadius="$lg" onPress={() => handleShowModal()}>
            <HStack alignItems="center" justifyContent="center" space="sm">
              <Icon as={Plus} color={Colors.white} size="sm" />
              <Text color={Colors.white}>{i18n.t('createTask')}</Text>
            </HStack>
          </Button>

          {/* Button to toggle calendar visibility */}
          <Button flex={1} bg={Colors.text} borderRadius="$lg" onPress={() => setCalendarVisible(!calendarVisible)}>
            <HStack alignItems="center" justifyContent="center" space="sm">
              <Icon as={CalendarIcon} color={Colors.white} size="sm" />
              <Text color={Colors.white}>{calendarVisible ? i18n.t('hideCalendar') : i18n.t('selectDate')}</Text>
            </HStack>
          </Button>
        </HStack>
      </Box>

      {/* Task Edit/Create Modal */}
      <Modal isOpen={modalVisible} onClose={handleCloseModal} avoidKeyboard>
        <Modal.Backdrop />
        <Modal.Content maxWidth="90%">
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontWeight="$bold" fontSize="$lg">
              {isCreating ? i18n.t('createTask') : i18n.t('editTask')}
            </Text>
          </Modal.Header>

          <Modal.Body>
            {error ? <Text color={Colors.error} mb="$2">{error}</Text> : null}

            {/* Room selection */}
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
                      <SelectItem key={room.roomId} label={room.roomName} value={room.roomName} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </FormControl>

            {/* Employee selection */}
            <FormControl mb="$4">
              <FormControlLabel>
                <FormControlLabelText>{i18n.t('assignTo')}</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={taskEmployee}
                onValueChange={value => setTaskEmployee(value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput
                    placeholder={i18n.t('selectEmployee')}
                  />
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

            {/* Task description */}
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

            {/* Start time picker */}
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

            {/* End time picker */}
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

            {/* DateTimePickers for start and end time */}
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

          {/* Modal footer with cancel/save buttons */}
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