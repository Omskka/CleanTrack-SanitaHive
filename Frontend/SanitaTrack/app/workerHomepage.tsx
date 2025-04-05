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
import { launchCamera, CameraOptions, ImagePickerResponse } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import { Phone, Calendar as CalendarIcon } from 'lucide-react-native';
import { Linking } from 'react-native';

interface Task {
  startTime: string;
  finishTime: string;
  title: string;
  description: string;
  room: string;
  completed: boolean;
  taskId: string;
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
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImages>({});
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);

  const managerPhoneNumber = '905551112233';

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString));
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  useEffect(() => {
    const mockTasks: Task[] = [
      {
        startTime: '09:00',
        finishTime: '10:00',
        title: i18n.t('roomCleaning', { roomNumber: '101' }),
        description: i18n.t('cleaningDescription'),
        room: '101',
        completed: false,
        taskId: '1'
      },
      {
        startTime: '11:00',
        finishTime: '12:00',
        title: i18n.t('roomCleaning', { roomNumber: '205' }),
        description: i18n.t('bathroomCleaning'),
        room: '205',
        completed: false,
        taskId: '2'
      },
      {
        startTime: '15:00',
        finishTime: '16:00',
        title: i18n.t('kitchenCleaning', { roomNumber: '312' }),
        description: i18n.t('kitchenCleaning'),
        room: '312',
        completed: false,
        taskId: '3'
      }
    ];

    setTasks(mockTasks);
  }, [language]);

  const takePicture = async (taskId: string) => {
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      saveToPhotos: false,
      includeBase64: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.log(i18n.t('cameraError'), response.errorMessage);
        return;
      }

      if (response.assets?.[0]?.uri) {
        const newImages = { ...uploadedImages };
        if (!newImages[taskId]) newImages[taskId] = [];

        if (newImages[taskId].length < 5) {
          newImages[taskId].push(response.assets[0].uri);
          setUploadedImages(newImages);
        } else {
          alert(i18n.t('maxImagesReached'));
        }
      }
    });
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
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" mb="$3" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.room}</Text>
        </HStack>
        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>

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
    <Box flex={1} p="$4" bg={Colors.background}>
      <Pressable position="absolute" top={16} right={16} zIndex={10} onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}>
        <Text fontWeight="$bold" color={Colors.text}>{language === 'en' ? 'TR' : 'EN'}</Text>
      </Pressable>

      <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading} mb="$4">{i18n.t('welcome')}</Text>

      <ScrollView flex={1} mb="$2">
        <Box p="$3" pl={0} borderRadius="$2xl" mb="$4">
          <Timeline
            data={tasks.map(task => ({
              ...task,
              time: `${task.startTime} - ${task.finishTime}`
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
                  selectedColor: Colors.text
                }
              }}
              theme={{
                backgroundColor: Colors.white,
                calendarBackground: Colors.white,
                selectedDayBackgroundColor: Colors.text,
                todayTextColor: Colors.heading,
                dayTextColor: Colors.text,
                textDisabledColor: Colors.gray,
                arrowColor: Colors.heading
              }}
            />
          </Box>
        )}
      </ScrollView>

      <HStack space="md" justifyContent="space-between">
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

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </Box>
  );
};

export default WorkerHomepage;
