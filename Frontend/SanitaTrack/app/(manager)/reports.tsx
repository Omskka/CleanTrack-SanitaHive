import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Input,
  InputField,
  InputSlot,
  Icon,
  Heading,
  ScrollView,
  Pressable,
  Divider,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@gluestack-ui/themed';
import { Search, ChevronDown, ChevronUp, Calendar, Filter } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RefreshControl } from 'react-native';
import { useLanguage } from '@/app/contexts/LanguageContext';

// Import API services (replace with your actual API services)
import { fetchTasks, fetchFeedbacks, fetchRooms, fetchAllUsers, getTaskStatus } from '@/api/apiService';

// Define interfaces
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
  questionnaireFive: string;
  done: boolean;
  submissionTime?: Date;
  status?: 'normal' | 'urgent' | 'critical';
}

interface Feedback {
  feedbackId: string;
  roomId: string;
  rating: number;
  category: string;
  description: string;
  submissionTime: Date;
}

interface Room {
  roomId: string;
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

const ReportsScreen = () => {
  const [userID, setUserID] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'normal', 'urgent', 'critical'
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all', '1', '2', '3', '4', '5'

  // Detail modal states
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Expandable states
  const [expandedTasks, setExpandedTasks] = useState(true);
  const [expandedFeedbacks, setExpandedFeedbacks] = useState(true);

  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem('userToken');
        if (storedUserID) {
          try {
            const parsedUserID = JSON.parse(storedUserID);
            setUserID(parsedUserID);
          } catch (e) {
            setUserID(storedUserID);
          }
        }
      } catch (error) {
        console.error('Error fetching userID from AsyncStorage:', error);
      }
    };

    fetchUserID();
  }, []);

  useEffect(() => {
    if (userID) {
      fetchData();
    }
  }, [userID]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [tasksData, feedbacksData, roomsData, usersData] = await Promise.all([
        fetchTasks(),
        fetchFeedbacks(),
        fetchRooms(),
        fetchAllUsers()
      ]);

      // Process tasks data - only include completed tasks for the report
      const completedTasks = tasksData.filter((task: Task) => task.done && task.managerId === userID);
      console.log("feedbacks", feedbacksData);


      // Fetch status for each task using getTaskStatus API
      const tasksWithStatusPromises = completedTasks.map(async (task: Task) => {
        try {
          // Call the getTaskStatus API to get the task's status
          const statusData = await getTaskStatus(task.taskId);
          console.log("statusData", statusData);

          return {
            ...task,
            submissionTime: tasksData.find((t: Task) => t.taskId === task.taskId)?.submissionTime,  // Use the submission time from the tasksData
            status: statusData.status // Use the status from the API response
          };
        } catch (error) {
          console.error(`Error fetching status for task ${task.taskId}:`, error);
          // If there's an error fetching the status, default to 'normal'
          return {
            ...task,
            submissionTime: new Date(task.endTime),
            status: 'normal' as 'normal' | 'urgent' | 'critical'
          };
        }
      });

      // Resolve all promises
      const tasksWithStatus = await Promise.all(tasksWithStatusPromises);

      // Sort tasks by submission time (newest first)
      const sortedTasks = tasksWithStatus.sort((a: Task, b: Task) => {
        return new Date(b.submissionTime!).getTime() - new Date(a.submissionTime!).getTime();
      });

      setTasks(sortedTasks);
      setFeedbacks(feedbacksData);
      setRooms(roomsData);
      setUsers(usersData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || i18n.t('failedToFetchData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [userID]);

  // Filter tasks based on search text, date filter, and status filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description.toLowerCase().includes(searchText.toLowerCase());

    // Date filtering
    let matchesDate = true;
    const submissionDate = new Date(task.submissionTime!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      matchesDate = submissionDate >= today && submissionDate <= todayEnd;
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      matchesDate = submissionDate >= weekStart && submissionDate <= weekEnd;
    } else if (dateFilter === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      matchesDate = submissionDate >= monthStart && submissionDate <= monthEnd;
    }

    // Status filtering
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Filter feedbacks based on search text, date filter, and rating filter
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch =
      feedback.description.toLowerCase().includes(searchText.toLowerCase()) ||
      feedback.category.toLowerCase().includes(searchText.toLowerCase());

    // Date filtering
    let matchesDate = true;
    const submissionDate = new Date(feedback.submissionTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      matchesDate = submissionDate >= today && submissionDate <= todayEnd;
    } else if (dateFilter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      matchesDate = submissionDate >= weekStart && submissionDate <= weekEnd;
    } else if (dateFilter === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      matchesDate = submissionDate >= monthStart && submissionDate <= monthEnd;
    }

    // Rating filtering
    const matchesRating = ratingFilter === 'all' || feedback.rating === parseInt(ratingFilter);

    return matchesSearch && matchesDate && matchesRating;
  });

  // Helper function to get room name by ID
  const getRoomNameById = (roomId: string) => {
    const room = rooms.find(room => room.roomId === roomId);
    return room ? room.roomName : i18n.t('unknownRoom');
  };

  // Helper function to get user name by ID
  const getUserNameById = (userId: string) => {
    const user = users.find(user => user.userId === userId);
    return user ? `${user.name} ${user.surname}` : i18n.t('unknownUser');
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = Colors.text;

    if (status === 'urgent') {
      bgColor = '#FF9800';
    } else if (status === 'critical') {
      bgColor = Colors.error;
    }

    return (
      <Badge bg={bgColor} borderRadius="$md" px="$2" py="$1">
        <Text color={Colors.white} fontSize="$xs">
          {status.toUpperCase()}
        </Text>
      </Badge>
    );
  };

  // Rating component
  const RatingDisplay = ({ rating }: { rating: number }) => {
    let bgColor = Colors.text;

    if (rating <= 2) {
      bgColor = Colors.error;
    } else if (rating <= 3) {
      bgColor = '#FF9800';
    } else if (rating <= 4) {
      bgColor = '#4CAF50';
    } else {
      bgColor = '#3F51B5';
    }

    return (
      <Badge bg={bgColor} borderRadius="$md" px="$2" py="$1">
        <Text color={Colors.white} fontSize="$xs">
          {rating}/5
        </Text>
      </Badge>
    );
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header */}
      <Box px="$4" py="$4" bg={Colors.white}>
        <Heading size="lg" color={Colors.heading}>{i18n.t('reports')}</Heading>
        <HStack space="sm" mt="$4" alignItems="center">
          <Input flex={1}>
            <InputSlot pl="$3">
              <Icon as={Search} size="lg" color={Colors.text} />
            </InputSlot>
            <InputField
              fontSize="$sm"
              placeholder={i18n.t('searchReports')}
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>
          <Button
            bg={Colors.text}
            rounded="$lg"
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon as={Filter} color={Colors.white} />
          </Button>
        </HStack>
      </Box>

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
        {/* Task Submissions Section */}
        <Box px="$4" py="$4">
          <Pressable
            onPress={() => setExpandedTasks(!expandedTasks)}
            mb="$2"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md" color={Colors.heading}>
                {i18n.t('taskSubmissions')} ({filteredTasks.length})
              </Heading>
              <Icon
                as={expandedTasks ? ChevronUp : ChevronDown}
                size="sm"
                color={Colors.text}
              />
            </HStack>
          </Pressable>

          {expandedTasks && (
            <VStack space="md">
              {loading && filteredTasks.length === 0 ? (
                <Box py="$4" alignItems="center">
                  <Text color={Colors.gray}>{i18n.t('loading')}</Text>
                </Box>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <Pressable
                    key={task.taskId}
                    onPress={() => {
                      setSelectedTask(task);
                      setTaskModalVisible(true);
                    }}
                  >
                    <Box
                      bg={Colors.white}
                      p="$4"
                      borderRadius="$lg"
                      borderLeftWidth={4}
                      borderLeftColor={
                        task.status === 'critical'
                          ? Colors.error
                          : task.status === 'urgent'
                            ? '#FF9800'
                            : Colors.text
                      }
                    >
                      <HStack justifyContent="space-between" alignItems="center" mb="$2">
                        <Text fontWeight="$bold" fontSize="$md" flex={1}>
                          {task.title}
                        </Text>
                        <StatusBadge status={task.status || 'normal'} />
                      </HStack>

                      <Text numberOfLines={2} mb="$2" color={Colors.text}>
                        {task.description}
                      </Text>

                      <HStack justifyContent="space-between" mt="$2">
                        <Text fontSize="$xs" color={Colors.gray}>
                          {i18n.t('submittedBy')}: {getUserNameById(task.employeeId)}
                        </Text>
                        <Text fontSize="$xs" color={Colors.gray}>
                          {formatDate(task.submissionTime!)}
                        </Text>
                      </HStack>
                    </Box>
                  </Pressable>
                ))
              ) : (
                <Box py="$4" alignItems="center">
                  <Text color={Colors.gray}>{i18n.t('noTaskSubmissions')}</Text>
                </Box>
              )}
            </VStack>
          )}
        </Box>

        <Divider mx="$4" />

        {/* Feedback Section */}
        <Box px="$4" py="$4">
          <Pressable
            onPress={() => setExpandedFeedbacks(!expandedFeedbacks)}
            mb="$2"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="md" color={Colors.heading}>
                {i18n.t('userFeedbacks')} ({filteredFeedbacks.length})
              </Heading>
              <Icon
                as={expandedFeedbacks ? ChevronUp : ChevronDown}
                size="sm"
                color={Colors.text}
              />
            </HStack>
          </Pressable>

          {expandedFeedbacks && (
            <VStack space="md">
              {loading && filteredFeedbacks.length === 0 ? (
                <Box py="$4" alignItems="center">
                  <Text color={Colors.gray}>{i18n.t('loading')}</Text>
                </Box>
              ) : filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <Pressable
                    key={feedback.feedbackId}
                    onPress={() => {
                      setSelectedFeedback(feedback);
                      setFeedbackModalVisible(true);
                    }}
                  >
                    <Box
                      bg={Colors.white}
                      p="$4"
                      borderRadius="$lg"
                      borderLeftWidth={4}
                      borderLeftColor={
                        feedback.rating <= 2
                          ? Colors.error
                          : feedback.rating <= 3
                            ? '#FF9800'
                            : feedback.rating <= 4
                              ? '#4CAF50'
                              : '#3F51B5'
                      }
                    >
                      <HStack justifyContent="space-between" alignItems="center" mb="$2">
                        <Text fontWeight="$bold" fontSize="$md" flex={1}>
                          {getRoomNameById(feedback.roomId)} - {feedback.category}
                        </Text>
                        <RatingDisplay rating={feedback.rating} />
                      </HStack>

                      <Text numberOfLines={2} mb="$2" color={Colors.text}>
                        {feedback.description}
                      </Text>

                      <HStack justifyContent="flex-end" mt="$2">
                        <Text fontSize="$xs" color={Colors.gray}>
                          {formatDate(feedback.submissionTime)}
                        </Text>
                      </HStack>
                    </Box>
                  </Pressable>
                ))
              ) : (
                <Box py="$4" alignItems="center">
                  <Text color={Colors.gray}>{i18n.t('noFeedbacks')}</Text>
                </Box>
              )}
            </VStack>
          )}
        </Box>
      </ScrollView>

      {/* Filter Modal */}
      <Modal isOpen={filterModalVisible} onClose={() => setFilterModalVisible(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">{i18n.t('filterReports')}</Heading>
          </ModalHeader>

          <ModalBody>
            <VStack space="md">
              {/* Date Filter */}
              <Box>
                <Text fontWeight="$medium" mb="$2">{i18n.t('dateFilter')}</Text>
                <Select
                  selectedValue={dateFilter}
                  onValueChange={(value) => setDateFilter(value)}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder={i18n.t('selectDateFilter')} />
                    <SelectIcon>
                      <Icon as={ChevronDown} />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label={i18n.t('all')} value="all" />
                      <SelectItem label={i18n.t('today')} value="today" />
                      <SelectItem label={i18n.t('thisWeek')} value="week" />
                      <SelectItem label={i18n.t('thisMonth')} value="month" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </Box>

              {/* Status Filter */}
              <Box>
                <Text fontWeight="$medium" mb="$2">{i18n.t('statusFilter')}</Text>
                <Select
                  selectedValue={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder={i18n.t('selectStatusFilter')} />
                    <SelectIcon>
                      <Icon as={ChevronDown} />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label={i18n.t('all')} value="all" />
                      <SelectItem label={i18n.t('normal')} value="normal" />
                      <SelectItem label={i18n.t('urgent')} value="urgent" />
                      <SelectItem label={i18n.t('critical')} value="critical" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </Box>

              {/* Rating Filter */}
              <Box>
                <Text fontWeight="$medium" mb="$2">{i18n.t('ratingFilter')}</Text>
                <Select
                  selectedValue={ratingFilter}
                  onValueChange={(value) => setRatingFilter(value)}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder={i18n.t('selectRatingFilter')} />
                    <SelectIcon>
                      <Icon as={ChevronDown} />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label={i18n.t('all')} value="all" />
                      <SelectItem label="1 ★" value="1" />
                      <SelectItem label="2 ★★" value="2" />
                      <SelectItem label="3 ★★★" value="3" />
                      <SelectItem label="4 ★★★★" value="4" />
                      <SelectItem label="5 ★★★★★" value="5" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr="$3"
              onPress={() => {
                setDateFilter('all');
                setStatusFilter('all');
                setRatingFilter('all');
              }}
            >
              <Text>{i18n.t('resetFilters')}</Text>
            </Button>
            <Button
              bg={Colors.text}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text color={Colors.white}>{i18n.t('applyFilters')}</Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Task Detail Modal */}
      <Modal isOpen={taskModalVisible} onClose={() => setTaskModalVisible(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">{i18n.t('taskDetails')}</Heading>
          </ModalHeader>

          <ModalBody>
            {selectedTask && (
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="$bold" fontSize="$lg">{selectedTask.title}</Text>
                  <StatusBadge status={selectedTask.status || 'normal'} />
                </HStack>

                <Divider />

                <VStack space="sm">
                  <Text fontWeight="$medium">{i18n.t('description')}</Text>
                  <Text>{selectedTask.description}</Text>
                </VStack>

                <VStack space="sm">
                  <Text fontWeight="$medium">{i18n.t('assignedTo')}</Text>
                  <Text>{getUserNameById(selectedTask.employeeId)}</Text>
                </VStack>

                <HStack justifyContent="space-between">
                  <VStack space="sm">
                    <Text fontWeight="$medium">{i18n.t('startTime')}</Text>
                    <Text>{formatDate(selectedTask.startTime)}</Text>
                  </VStack>

                  <VStack space="sm">
                    <Text fontWeight="$medium">{i18n.t('endTime')}</Text>
                    <Text>{formatDate(selectedTask.endTime)}</Text>
                  </VStack>
                </HStack>

                <VStack space="sm">
                  <Text fontWeight="$medium">{i18n.t('submissionTime')}</Text>
                  <Text>{formatDate(selectedTask.submissionTime!)}</Text>
                </VStack>

                {/* Questionnaire responses - Just placeholders for now */}
                {selectedTask.questionnaireOne && (
                  <VStack space="sm">
                    <Text fontWeight="$medium">{i18n.t('questionnaire')}</Text>
                    <VStack space="xs">
                      <Text>Q1: {selectedTask.questionnaireOne}</Text>
                      {selectedTask.questionnaireTwo && <Text>Q2: {selectedTask.questionnaireTwo}</Text>}
                      {selectedTask.questionnaireThree && <Text>Q3: {selectedTask.questionnaireThree}</Text>}
                      {selectedTask.questionnaireFour && <Text>Q4: {selectedTask.questionnaireFour}</Text>}
                      {selectedTask.questionnaireFive && <Text>Q5: {selectedTask.questionnaireFive}</Text>}
                    </VStack>
                  </VStack>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              bg={Colors.text}
              onPress={() => setTaskModalVisible(false)}
            >
              <Text color={Colors.white}>{i18n.t('close')}</Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Feedback Detail Modal */}
      <Modal isOpen={feedbackModalVisible} onClose={() => setFeedbackModalVisible(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">{i18n.t('feedbackDetails')}</Heading>
          </ModalHeader>

          <ModalBody>
            {selectedFeedback && (
              <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="$bold" fontSize="$lg">
                    {getRoomNameById(selectedFeedback.roomId)}
                  </Text>
                  <RatingDisplay rating={selectedFeedback.rating} />
                </HStack>

                <Divider />

                <VStack space="sm">
                  <Text fontWeight="$medium">{i18n.t('category')}</Text>
                  <Text>{selectedFeedback.category}</Text>
                </VStack>

                <VStack space="sm">
                  <Text fontWeight="$medium">{i18n.t('feedback')}</Text>
                  <Text>{selectedFeedback.description}</Text>
                </VStack>

                <VStack space="sm">
                  <Text fontWeight="$medium">{i18n.t('submissionTime')}</Text>
                  <Text>{formatDate(selectedFeedback.submissionTime)}</Text>
                </VStack>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              bg={Colors.text}
              onPress={() => setFeedbackModalVisible(false)}
            >
              <Text color={Colors.white}>{i18n.t('close')}</Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ReportsScreen;