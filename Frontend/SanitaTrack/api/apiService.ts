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
  return {
    url: `${filename}`,
  };
};

// Download image and save to gallery
export const downloadImage = async (fileName: string) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    // Backend URL for downloading file
    const backendUrl = `http://10.0.2.2:8080/api/v1/file/download/${fileName}`;
    // Fetch file as blob using axios
    const response = await axiosInstance.get(backendUrl, {
      responseType: 'blob',
    });

    // Convert blob to base64 (expo-file-system needs base64 or a file URI)
    const reader = new FileReader();

    const base64Data: string = await new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new Error('Problem parsing blob to base64.'));
      };
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(response.data);
    });

    // Remove "data:<mime>;base64," prefix to get pure base64
    const base64Str = base64Data.split(',')[1];

    // Save base64 file to local file system
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, base64Str, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Save to gallery
    await MediaLibrary.saveToLibraryAsync(fileUri);
    alert('Image downloaded to gallery!');
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed!');
  }
};
