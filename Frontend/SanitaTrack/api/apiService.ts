import axiosInstance from './axiosInstance';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import mime from 'mime';

export const login = async (phoneNumber: string, password: string) => {
  const response = await axiosInstance.post('/users/login', { phoneNumber, password });
  return response.data;
};

export const fetchRooms = async () => {
  const response = await axiosInstance.get('/rooms');
  return response.data;
};

export const fetchTeam = async (employeeId: string) => {
  const response = await axiosInstance.get(`/teams/by-employee/${employeeId}`);
  return response.data;
};

export const removeTeamMember = async (managerId: string, employeeId: string) => {
  const response = await axiosInstance.post('/teams/remove-member', {
    managerId,
    employeeId,
  });
  return response.data;
};

export const fetchTasks = async () => {
  const response = await axiosInstance.get(`/tasks`);
  return response.data;
};

export const createTask = async (task: {
  taskId: string;
  managerId: string;
  employeeId: string;
  title: string;
  description: string;
  startTime: Date; // Use ISO string
  endTime: Date;   // Use ISO string
  imageUrl: string;
  questionnaireOne: string;
  questionnaireTwo: string;
  questionnaireThree: string;
  questionnaireFour: string;
  questionnaireFive: string;
  done: boolean;
}) => {
  const response = await axiosInstance.post('/tasks', task);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  updatedTask: {
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
  }
) => {
  const response = await axiosInstance.put(`/tasks/update/${taskId}`, updatedTask);
  return response.data;
};

export const deleteTask = async (taskId: string,) => {
  const response = await axiosInstance.post('/tasks/delete', { taskId });
  return response.data;
};

export const markTaskAsDone = async (taskId: string) => {
  const url = `/tasks/${taskId}/complete`;
  console.log('Request URL:', url); // Log URL here
  const response = await axiosInstance.put(url);
  return response.data;
};

// Get the status of a task
export const getTaskStatus = async (taskId: string) => {
  const response = await axiosInstance.get(`/tasks/${taskId}/status`);
  return response.data; // This should return "Red", "Green", or "Orange"
};

export const fetchAllUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data; // Should be an array of users
};

export const fetchTeamByManager = async (managerId: string) => {
  const response = await axiosInstance.get(`/teams/${managerId}`);
  return response.data;
};

export const addRoom = async (roomId: string, roomName: string, roomFloor: string, teamId: string) => {
  const response = await axiosInstance.post('/rooms', {
    roomId,
    roomName,
    roomFloor,
    teamId,
  });
  return response.data;
};

export const deleteRoom = async (roomId: string) => {
  const response = await axiosInstance.post('/rooms/delete', { roomId });
  return response.data;
};

export const registerUser = async (user: {
  userId: string;
  name: string;
  surname: string;
  phoneNumber: string;
  password: string;
  isManager: boolean;
  lang: string;
}) => {
  const response = await axiosInstance.post('/users', user);
  return response.data;
};

export const createTeam = async (team: {
  teamName: string;
  managerId: string;
  employeeId: string[];
}) => {
  const response = await axiosInstance.post('/teams', team);
  return response.data;
};

// Create feedbacks
export const createFeedback = async (data: any) => {
  const response = await axiosInstance.post(`/feedbacks`, data);
  return response.data;
};

// Get feedbacks by task ID
export const fetchFeedbacks = async () => {
  const response = await axiosInstance.get(`/feedbacks`);
  return response.data;
};

export const uploadImage = async (fileUri: string) => {
  const mimeType = mime.getType(fileUri) || 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: 'upload.jpg',
    type: mimeType,
  } as any);

  const response = await axiosInstance.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('Raw upload response:', response.data); // Debug log

  // If the response is just a message like "File uploaded : filename.jpg"
  const message = response.data as string;
  const filename = message.split(':').pop()?.trim();

  // Construct full URL manually if needed
  const baseUrl = `https://cleanhivebucket.s3.eu-north-1.amazonaws.com/${filename}`; // Replace with your actual base path
  return {
    url: `${baseUrl}${filename}`,
  };
};

export const downloadImage = async (fileUrl: string) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    const fileName = fileUrl.split('/').pop() ?? 'downloaded-image.jpg';
    const fileUri = FileSystem.documentDirectory! + fileName;

    const downloadResumable = FileSystem.createDownloadResumable(fileUrl, fileUri);
    const result = await downloadResumable.downloadAsync();

    if (!result) {
      alert('Failed to download file');
      return;
    }

    await MediaLibrary.saveToLibraryAsync(result.uri);
    alert('Image downloaded to gallery!');
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed!');
  }
};

