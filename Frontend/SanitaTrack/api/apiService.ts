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

export const fetchTasks = async () => {
  const response = await axiosInstance.get(`/tasks`);
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data; // Should be an array of users
};

export const addRoom = async (roomName: string, roomFloor: string, teamId: string) => {
  const response = await axiosInstance.post('/rooms', {
    roomName,
    roomFloor,
    teamId,
  });
  return response.data;
};

export const deleteRoom = async (teamId: string, roomName: string) => {
  const response = await axiosInstance.post('/rooms/delete', { teamId, roomName });
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