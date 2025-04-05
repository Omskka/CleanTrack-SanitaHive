import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Pressable,
  ScrollView,
  HStack,
} from '@gluestack-ui/themed';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';

interface Task {
  startTime: string;
  finishTime: string;
  title: string;
  description: string;
  room: string;
  completed: boolean;
  workerName: string;
  workerSurname: string;
  taskId: string;
}

const ManagerHomepage = () => {
  const [language, setLanguage] = useState<string>(getCurrentLanguage());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);

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
        workerName: 'John',
        workerSurname: 'Doe',
        taskId: '1'
      },
      {
        startTime: '11:00',
        finishTime: '12:00',
        title: i18n.t('roomCleaning', { roomNumber: '205' }),
        description: i18n.t('bathroomCleaning'),
        room: '205',
        completed: true,
        workerName: 'Jane',
        workerSurname: 'Smith',
        taskId: '2'
      },
      {
        startTime: '15:00',
        finishTime: '16:00',
        title: i18n.t('kitchenCleaning', { roomNumber: '312' }),
        description: i18n.t('kitchenCleaning'),
        room: '312',
        completed: false,
        workerName: 'Emily',
        workerSurname: 'Johnson',
        taskId: '3'
      }
    ];

    setTasks(mockTasks);
  }, [language]);

  const renderDetail = (rowData: Task) => {
    const isCompleted = rowData.completed;

    return (
      <Box bg={Colors.white} p="$4" borderRadius="$2xl" mb="$3" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.5} shadowRadius={4} elevation={2}>
        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$md" fontWeight="$bold" color={Colors.heading}>{rowData.title}</Text>
          <Text fontSize="$sm" color={Colors.text}>{i18n.t('room')}: {rowData.room}</Text>
        </HStack>
        <Text fontSize="$sm" color={Colors.text} mb="$3">{rowData.description}</Text>

        <HStack justifyContent="space-between" mb="$2">
          <Text fontSize="$sm" color={Colors.black}>{i18n.t('worker')}: {rowData.workerName} {rowData.workerSurname}</Text>
        </HStack>
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
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </Box>
  );
};

export default ManagerHomepage;
