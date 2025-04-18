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

interface Task {
  date: string; // YYYY-MM-DD format
  startTime: string;
  finishTime: string;
  title: string;
  description: string;
  room: string;
  completed: boolean;
  taskId: string;
  totalTime: string;
}

interface UploadedImages {
  [taskId: string]: string[];
}

const callPhone = (phoneNumber: string) => {
  Linking.openURL(`tel:${phoneNumber}`);
};

const WorkerHomepage = () => {
  const [language, setLanguage] = useState<string>(getCurrentLanguage());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImages>({});
  const [calendarVisible, setCalendarVisible] = useState<boolean>(true);
  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString));
  const managerPhoneNumber = '905551112233';
  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  useEffect(() => {
    const mockTasks: Task[] = [
      {
        date: '2025-04-01',
        startTime: '09:00',
        finishTime: '10:30',
        totalTime: '1 hour 30 minutes',
        title: i18n.t('roomCleaning', { roomNumber: '101' }),
        description: i18n.t('cleaningDescription'),
        room: '101',
        completed: false,
        taskId: '1'
      },
      {
        date: '2025-04-02',
        startTime: '11:00',
        finishTime: '12:00',
        totalTime: '1 hour',
        title: i18n.t('roomCleaning', { roomNumber: '205' }),
        description: i18n.t('bathroomCleaning'),
        room: '205',
        completed: false,
        taskId: '2'
      },
      {
        date: '2025-04-02',
        startTime: '15:00',
        finishTime: '17:00',
        totalTime: '2 hours',
        title: i18n.t('kitchenCleaning', { roomNumber: '312' }),
        description: i18n.t('kitchenCleaning'),
        room: '312',
        completed: false,
        taskId: '3'
      }
    ];

    setTasks(mockTasks);
  }, [language]);

  const filteredTasks = tasks.filter(
    task => task.date === selectedDate.toISOString().split('T')[0]
  );

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

  const submitTask = (taskId: string) => {
    if (!uploadedImages[taskId]?.length) {
      alert(i18n.t('uploadAtLeastOneImage'));
      return;
    }

    setTasks(tasks.map(task =>
      task.taskId === taskId ? { ...task, completed: true } : task
    ));
  };

  const renderDetail = (rowData: Task) => {
    const isCompleted = rowData.completed || (uploadedImages[rowData.taskId]?.length > 0);

    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.room}</Text>
        </HStack>

        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>
        <Text fontSize="$sm" color={Colors.black} fontWeight="$bold">{rowData.startTime} - {rowData.finishTime}</Text>
        <Text fontSize="$sm" color={Colors.black}>{i18n.t('totalTime')}: {rowData.totalTime}</Text>

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
                isDisabled={!uploadedImages[rowData.taskId]?.length}
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
              ...task,
              time: `${task.startTime}`
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
        <Button flex={1} bg={Colors.heading} borderRadius="$lg" onPress={() => callPhone(managerPhoneNumber)}>
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
