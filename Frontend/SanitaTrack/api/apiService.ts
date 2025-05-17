import axiosInstance from './axiosInstance';

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
    imageUrl: string;
    questionnaireOne: string;
    questionnaireTwo: string;
    questionnaireThree: string;
    questionnaireFour: string;
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

export const createFeedback = async (data: any) => {
  const response = await axiosInstance.post(`/feedbacks`, data);
  return response.data;
};