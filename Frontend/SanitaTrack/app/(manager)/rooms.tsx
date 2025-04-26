import React, { useEffect, useState } from 'react';
import { Modal, View, FlatList } from 'react-native';
import {
  Box,
  HStack,
  Heading,
  Input,
  InputField,
  Button,
  Text,
  Icon,
  InputSlot,
} from '@gluestack-ui/themed';
import { Search, Plus, Trash } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRooms, addRoom, deleteRoom } from '@/api/apiService';

interface Room {
  id: number;
  roomName: string;
  roomFloor: string;
  teamId: string;
}

export default function RoomsScreen() {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomFloor, setRoomFloor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem('userToken');
        if (storedUserID) {
          setUserID(storedUserID);
        }
      } catch (error) {
        console.error('Error fetching userID from AsyncStorage:', error);
      }
    };

    fetchUserID();
  }, []);

  useEffect(() => {
    if (!userID) return;

    handleFetchRooms();
  }, [userID]);

  const handleFetchRooms = async () => {
    setLoading(true);
    try {
      const roomsData = await fetchRooms();
      const filteredRooms = roomsData.filter((room: Room) => room.teamId === userID);
      setRooms(filteredRooms);
      setError('');
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setError(error.message || i18n.t('failedToFetchRooms'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddRoom = async () => {
    if (!roomName.trim() || !roomFloor.trim()) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }
  
    setLoading(true);
    setError('');
    try {
      await addRoom(roomName.trim(), roomFloor.trim(), userID);
      alert('Room Created Successfully!');
      setModalVisible(false);
      setRoomName('');
      setRoomFloor('');
      handleFetchRooms(); // refresh room list
    } catch (error: any) {
      console.error('Error creating room:', error);
      setError(error.message || i18n.t('failedToCreateRoom'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteRoom = async (teamId: string, roomName: string) => {
    setLoading(true);
    try {
      await deleteRoom(teamId, roomName);
      alert('Room deleted successfully!');
      setRooms((prevRooms) =>
        prevRooms.filter((room) => !(room.roomName === roomName && room.teamId === teamId))
      );
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.message || i18n.t('failedToDeleteRoom'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header */}
      <Box px="$4" py="$6" bg={Colors.white}>
        <Heading size="lg" color={Colors.heading}>Rooms</Heading>

        <HStack space="sm" mt="$4" alignItems="center">
          <Input flex={1}>
            <InputSlot pl="$3">
              <Icon as={Search} size="lg" color={Colors.text} />
            </InputSlot>
            <InputField
              fontSize="$sm"
              placeholder={i18n.t('searchRoomPlaceholder')}
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>
        </HStack>
      </Box>

      {/* Add Room Button */}
      <Box px="$4" py="$4" bg={Colors.white}>
        <Button bg={Colors.text} rounded="$lg" onPress={() => setModalVisible(true)}>
          <Icon as={Plus} color={Colors.white} mr="$2" />
          <Text color={Colors.white} fontWeight="bold">{i18n.t('addRoomButton')}</Text>
        </Button>
      </Box>

      {/* Room List */}
      <Box px="$4" py="$4" bg={Colors.white}>
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Box
              key={item.id} // optional if using keyExtractor, but helps in case of non-FlatList items
              mb="$2"
              bg={Colors.white}
              p="$4"
              rounded="$md"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <View>
                <Text fontWeight="bold">{item.roomName}</Text>
                <Text>{`Floor: ${item.roomFloor}`}</Text>
              </View>
              <Button
                bg={Colors.error}
                rounded="$lg"
                onPress={() => handleDeleteRoom(item.teamId, item.roomName)}
              >
                <Text color={Colors.white}>{('delete')}</Text>
              </Button>
            </Box>
          )}
        />
      </Box>

      {/* Modal for Adding Room */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Box flex={1} justifyContent="center" alignItems="center" bg="rgba(0,0,0,0.5)">
          <Box bg={Colors.white} p="$6" rounded="$lg" width="80%">
            <Heading size="md">{('Enter Room Information')}</Heading>

            {/* Room Name Input */}
            <Input mt="$4">
              <InputField
                placeholder={i18n.t('roomName')}
                value={roomName}
                onChangeText={setRoomName}
              />
            </Input>

            {/* Room Number Input */}
            <Input mt="$2">
              <InputField
                placeholder={('Floor Number')}
                value={roomFloor}
                onChangeText={setRoomFloor}
                keyboardType="numeric"
              />
            </Input>

            {/* Error message */}
            {error ? (
              <Text mt="$2" color="red">{error}</Text>
            ) : null}

            <HStack mt="$4" justifyContent="space-between">
              <Button bg={Colors.gray} onPress={() => setModalVisible(false)}>
                <Text color={Colors.white}>{i18n.t('cancel')}</Text>
              </Button>
              <Button bg={Colors.text} onPress={handleAddRoom} isDisabled={loading}>
                <Text color={Colors.white}>{loading ? i18n.t('loading') : i18n.t('save')}</Text>
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
