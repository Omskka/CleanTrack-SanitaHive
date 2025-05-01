import React, { useState, useEffect } from 'react';
import {
  Box, Text, Pressable, ScrollView, Button,
  VStack, HStack, Input, InputField, Modal, FormControl
} from '@gluestack-ui/themed';
import { Calendar, DateData } from 'react-native-calendars';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import { Pencil, PlusCircle } from 'lucide-react-native';

interface Task {
  date: string;
  startTime: string;
  finishTime: string;
  title: string;
  description: string;
  room: string;
  completed: boolean;
  taskId: string;
  totalTime: string;
}

const TaskEditingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const mockTasks: Task[] = [
      {
        date: todayStr,
        startTime: '09:00',
        finishTime: '10:30',
        title: 'Clean Hallway',
        description: 'Dust and mop the hallway',
        room: 'Hallway',
        completed: false,
        taskId: '1',
        totalTime: '1 hour 30 minutes',
      },
      {
        date: todayStr,
        startTime: '11:00',
        finishTime: '12:00',
        title: 'Clean Kitchen',
        description: 'Wipe counters and floor',
        room: 'Kitchen',
        completed: false,
        taskId: '2',
        totalTime: '1 hour 0 minutes',
      }
    ];
    setTasks(mockTasks);
  }, []);

  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.dateString));
  };

  const openTaskModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
    } else {
      setEditingTask({
        date: selectedDate.toISOString().split('T')[0],
        startTime: '',
        finishTime: '',
        room: '',
        title: '',
        description: '',
        completed: false,
        taskId: Math.random().toString(),
        totalTime: '',
      });
    }
    setModalVisible(true);
  };

  const handleSaveTask = () => {
    if (!editingTask) return;
    const updatedTasks = [...tasks];
    const index = updatedTasks.findIndex(t => t.taskId === editingTask.taskId);
    const newTask: Task = {
      ...editingTask,
      totalTime: calculateTotalTime(editingTask.startTime!, editingTask.finishTime!),
    } as Task;

    if (index !== -1) {
      updatedTasks[index] = newTask;
    } else {
      updatedTasks.push(newTask);
    }

    setTasks(updatedTasks);
    setModalVisible(false);
  };

  const calculateTotalTime = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
  };

  const filteredTasks = tasks.filter(
    task => task.date === selectedDate.toISOString().split('T')[0]
  );

  return (
    <Box flex={1} p="$4" bg={Colors.background}>
      <Text fontSize="$2xl" fontWeight="$bold" mb="$4">
        {i18n.t('editTasks')}
      </Text>

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
      />

      <Pressable onPress={() => openTaskModal()} mt="$4" alignSelf="flex-start">
        <HStack alignItems="center" space="sm">
          <PlusCircle color={Colors.heading} />
          <Text color={Colors.text}>{i18n.t('addTask')}</Text>
        </HStack>
      </Pressable>

      <VStack space="md" mt="$4">
        {filteredTasks.map(task => (
          <Box key={task.taskId} p="$4" bg={Colors.white} borderRadius="$2xl" shadowColor={Colors.black} shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.2} shadowRadius={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <VStack>
                <Text fontWeight="$bold">{task.title}</Text>
                <Text fontSize="$sm">{task.room} • {task.startTime} - {task.finishTime}</Text>
                <Text fontSize="$xs" color={Colors.gray}>{task.description}</Text>
              </VStack>
              <Pressable onPress={() => openTaskModal(task)}>
                <Pencil size={18} color={Colors.text} />
              </Pressable>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <Modal.Content>
          <Modal.Header>{editingTask?.taskId ? i18n.t('editTask') : i18n.t('addTask')}</Modal.Header>
          <Modal.Body>
            <VStack space="md">
              <FormControl>
                <FormControl.Label>{i18n.t('room')}</FormControl.Label>
                <Input>
                  <InputField
                    placeholder={i18n.t('roomName')}
                    value={editingTask?.room || ''}
                    onChangeText={(text: string) => setEditingTask({ ...editingTask!, room: text })}
                  />
                </Input>
              </FormControl>

              <FormControl>
                <FormControl.Label>{i18n.t('title')}</FormControl.Label>
                <Input>
                  <InputField
                    placeholder={i18n.t('title')}
                    value={editingTask?.title || ''}
                    onChangeText={(text: string) => setEditingTask({ ...editingTask!, title: text })}
                  />
                </Input>
              </FormControl>

              <FormControl>
                <FormControl.Label>{i18n.t('description')}</FormControl.Label>
                <Input>
                  <InputField
                    placeholder={i18n.t('description')}
                    value={editingTask?.description || ''}
                    onChangeText={(text: string) => setEditingTask({ ...editingTask!, description: text })}
                  />
                </Input>
              </FormControl>

              <FormControl>
                <FormControl.Label>{i18n.t('startTime')}</FormControl.Label>
                <Input>
                  <InputField
                    placeholder="e.g., 09:00"
                    value={editingTask?.startTime || ''}
                    onChangeText={(text: string) => setEditingTask({ ...editingTask!, startTime: text })}
                  />
                </Input>
              </FormControl>

              <FormControl>
                <FormControl.Label>{i18n.t('finishTime')}</FormControl.Label>
                <Input>
                  <InputField
                    placeholder="e.g., 11:30"
                    value={editingTask?.finishTime || ''}
                    onChangeText={(text: string) => setEditingTask({ ...editingTask!, finishTime: text })}
                  />
                </Input>
              </FormControl>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={handleSaveTask}>
              <Text color={Colors.white}>{i18n.t('save')}</Text>
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default TaskEditingPage;
