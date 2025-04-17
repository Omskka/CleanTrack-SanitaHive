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

    fetchRooms();
  }, [userID]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:8080/api/v1/rooms');
      const data = await response.json();

      if (response.ok) {
        const filteredRooms = data.filter((room: Room) => room.teamId === userID);
        setRooms(filteredRooms);
      } else {
        console.error('Failed to fetch rooms:', data);
        setError(i18n.t('failedToFetchRooms'));
      }
    } catch (error) {
      console.error('Error during fetching rooms:', error);
      setError(i18n.t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async () => {
    if (!roomName.trim() || !roomFloor.trim()) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      roomName: roomName.trim(),
      roomFloor: roomFloor.trim(),
      teamId: userID,
    };

    try {
      const response = await fetch('http://10.0.2.2:8080/api/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Room Created Successfully!');
        setModalVisible(false);
        setRoomName('');
        setRoomFloor('');
        fetchRooms();
      } else {
        console.error('Failed to create room:', data);
        setError(data.message || i18n.t('failedToCreateRoom'));
      }
    } catch (error) {
      console.error('Error during room creation:', error);
      setError(i18n.t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (teamId: string, roomName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:8080/api/v1/rooms/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId, roomName }),
      });

      if (response.ok) {
        console.log('Room deleted successfully!');
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.roomName !== roomName || room.teamId !== teamId)
        );
        alert('Room deleted successfully!');
      } else {
        const data = await response.json();
        console.error('Failed to delete room:', data);
        setError(data.message || i18n.t('failedToDeleteRoom'));
      }
    } catch (error) {
      console.error('Error during room deletion:', error);
      setError(i18n.t('networkError'));
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
                onPress={() => deleteRoom(item.teamId, item.roomName)}
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
              <Button bg={Colors.text} onPress={addRoom} isDisabled={loading}>
                <Text color={Colors.white}>{loading ? i18n.t('loading') : i18n.t('save')}</Text>
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
