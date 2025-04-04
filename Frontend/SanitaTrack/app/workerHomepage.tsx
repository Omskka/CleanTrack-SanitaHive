import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import { Calendar, DateData } from 'react-native-calendars';
import { launchCamera, CameraOptions, ImagePickerResponse } from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors } from '../constants/Colors';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';

interface Task {
  time: string;
  title: string;
  description: string;
  room: string;
  completed: boolean;
  taskId: string;
}

interface UploadedImages {
  [taskId: string]: string[];
}

const WorkerHomepage = () => {
  const [language, setLanguage] = useState<string>(getCurrentLanguage());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImages>({});

  // Dil değiştirme
  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  // Takvim fonksiyonları
  const onDayPress = (day: DateData) => setSelectedDate(new Date(day.dateString));
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  // Örnek task verileri
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        time: '09:00',
        title: i18n.t('roomCleaning', { roomNumber: '101' }),
        description: i18n.t('cleaningDescription'),
        room: '101',
        completed: false,
        taskId: '1'
      },
      {
        time: '11:00',
        title: i18n.t('roomCleaning', { roomNumber: '205' }),
        description: i18n.t('bathroomCleaning'),
        room: '205',
        completed: false,
        taskId: '2'
      },
      {
        time: '15:00',
        title: i18n.t('roomCleaning', { roomNumber: '312' }),
        description: i18n.t('bathroomCleaning'),
        room: '312',
        completed: false,
        taskId: '3'
      }
    ];

    setTasks(mockTasks);
  }, [language]);

  // Fotoğraf çekme
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

  // Task gönderme
  const submitTask = (taskId: string) => {
    if (!uploadedImages[taskId]?.length) {
      alert(i18n.t('uploadAtLeastOneImage'));
      return;
    }

    setTasks(tasks.map(task =>
      task.taskId === taskId ? { ...task, completed: true } : task
    ));
  };

  // Timeline öğesi render
  const renderDetail = (rowData: Task) => {
    const isCompleted = rowData.completed || (uploadedImages[rowData.taskId]?.length > 0);

    return (
      <View style={styles.taskContainer}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: Colors.heading }]}>{rowData.title}</Text>
          <Text style={[styles.roomText, { color: Colors.text }]}>
            {i18n.t('room')}: {rowData.room}
          </Text>
        </View>

        <Text style={[styles.taskDescription, { color: Colors.text }]}>{rowData.description}</Text>

        {isCompleted ? (
          <Text style={{ color: Colors.text }}>{i18n.t('completed')}</Text>
        ) : (
          <>
            <View style={styles.imagesContainer}>
              {uploadedImages[rowData.taskId]?.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.image} />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.tint }]}
              onPress={() => takePicture(rowData.taskId)}
            >
              <Text style={[styles.buttonText, { color: Colors.text }]}>
                {i18n.t('uploadImage')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: uploadedImages[rowData.taskId]?.length
                    ? Colors.text
                    : Colors.gray
                }
              ]}
              onPress={() => submitTask(rowData.taskId)}
              disabled={isCompleted || !uploadedImages[rowData.taskId]?.length}
            >
              <Text style={styles.buttonText}>{i18n.t('submit')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Dil Değiştirme Butonu */}
      <Pressable
        style={styles.languageButton}
        onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}
      >
        <Text style={[styles.languageText, { color: Colors.text }]}>
          {language === 'en' ? 'TR' : 'EN'}
        </Text>
      </Pressable>

      {/* Başlık */}
      <Text style={[styles.welcomeText, { color: Colors.heading }]}>
        {i18n.t('welcome')}
      </Text>

      {/* Timeline Bölümü */}
      <ScrollView style={styles.timelineContainer}>
        <Timeline
          data={tasks}
          circleSize={20}
          circleColor={Colors.text}
          lineColor={Colors.tint}
          timeStyle={{
            textAlign: 'center',
            color: Colors.heading,
            padding: 5,
            fontSize: 12
          }}
          descriptionStyle={{ color: Colors.text }}
          renderDetail={renderDetail}
          separator={true}
          showTime={true}
          innerCircle={'dot'}
        />
      </ScrollView>

      {/* Takvim Bölümü */}
      <View style={styles.calendarContainer}>
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
            arrowColor: Colors.heading,
          }}
        />
      </View>

      {/* Yönetici Butonu */}
      <TouchableOpacity
        style={[styles.managerButton, { backgroundColor: Colors.heading }]}
      >
        <Text style={styles.managerButtonText}>{i18n.t('contactManager')}</Text>
      </TouchableOpacity>

      {/* Tarih Seçici */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  languageButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2
  },
  languageText: {
    fontWeight: 'bold'
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  timelineContainer: {
    flex: 1,
    marginBottom: 16
  },
  calendarContainer: {
    marginBottom: 70
  },
  taskContainer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  roomText: {
    fontSize: 14
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 12
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4
  },
  button: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 8
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.white
  },
  managerButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderStyle: 'solid',
    borderColor: Colors.heading,
    borderRadius: 8
  },
  managerButtonText: {
    textAlign: 'center',
    color: Colors.white
  }
});

export default WorkerHomepage;
