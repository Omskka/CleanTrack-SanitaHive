import React, { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  VStack,
  Pressable,
} from '@gluestack-ui/themed';
import { Search, Plus, ChevronDown, ChevronRight } from 'lucide-react-native';
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

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

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
      const uniqueCategories = Array.from(new Set((filteredRooms as Room[]).map(r => r.roomFloor)));
      setCategories(uniqueCategories);
      setError('');
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setError(error.message || i18n.t('failedToFetchRooms'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    const finalCategory = isAddingCategory ? newCategory.trim() : selectedCategory;
    if (!roomName.trim() || !finalCategory) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await addRoom(roomName.trim(), finalCategory, userID);
      alert('Room Created Successfully!');
      setModalVisible(false);
      setRoomName('');
      setRoomFloor('');
      setSelectedCategory('');
      setNewCategory('');
      setIsAddingCategory(false);
      handleFetchRooms();
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
      setRooms((prev) =>
        prev.filter((room) => !(room.roomName === roomName && room.teamId === teamId))
      );
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.message || i18n.t('failedToDeleteRoom'));
    } finally {
      setLoading(false);
    }
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter rooms based on search text
  const filteredRooms = rooms.filter(room => 
    room.roomName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get filtered categories (categories with at least one room that matches the search)
  const filteredCategories = categories.filter(category => 
    filteredRooms.some(room => room.roomFloor === category)
  );

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

      {/* Room List with Dropdown-style Categories */}
      <Box flex={1} px="$4" py="$4" bg={Colors.background}>
        <VStack space="md">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const isExpanded = expandedCategories[category];
              const roomsInCategory = filteredRooms.filter((room) => room.roomFloor === category);

              return (
                <Box key={category} bg={Colors.white} rounded="$lg" overflow="hidden" shadow="sm">
                  {/* Category Header - Styled as dropdown */}
                  <Pressable
                    onPress={() => toggleCategory(category)}
                    px="$4"
                    py="$3"
                    bg={Colors.white}
                    borderBottomWidth={isExpanded ? 1 : 0}
                    borderBottomColor={Colors.gray}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="bold" fontSize="$md">{category}</Text>
                      <Icon as={isExpanded ? ChevronDown : ChevronRight} size="sm" color={Colors.text} />
                    </HStack>
                  </Pressable>

                  {/* Room Items - Shown when expanded */}
                  {isExpanded && (
                    <VStack divider={<Box h="$px" bg={Colors.gray} />}>
                      {roomsInCategory.map((item) => (
                        <Box
                          key={item.id}
                          py="$3"
                          px="$4"
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text>{item.roomName}</Text>
                          <Button
                            size="sm"
                            bg={Colors.error}
                            rounded="$lg"
                            onPress={() => handleDeleteRoom(item.teamId, item.roomName)}
                          >
                            <Text color={Colors.white} fontSize="$xs">{i18n.t('delete')}</Text>
                          </Button>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>
              );
            })
          ) : (
            <Box p="$4" alignItems="center">
              <Text color={Colors.text}>
                {searchText ? i18n.t('noRoomsMatchSearch') : i18n.t('noRoomsAvailable')}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>

{/* Modal for Adding Room */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Box flex={1} justifyContent="center" alignItems="center" bg="rgba(0,0,0,0.5)">
          <Box bg={Colors.white} p="$6" rounded="$lg" width="80%">
            <Heading size="md">{i18n.t('enterRoomInformation')}</Heading>

            {/* Category Picker */}
            <Box mt="$4">
              <HStack alignItems="center" space="sm">
                <Box flex={1} borderWidth={1} borderColor={Colors.gray} borderRadius="$md">
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                  >
                    <Picker.Item label={i18n.t('chooseCategory')} value="" />
                    {categories.map((cat) => (
                      <Picker.Item key={cat} label={cat} value={cat} />
                    ))}
                  </Picker>
                </Box>
                <Button onPress={() => setIsAddingCategory(!isAddingCategory)} bg={Colors.text}>
                  <Icon as={Plus} color={Colors.white} />
                </Button>
              </HStack>
            </Box>

            {/* Add New Category Input */}
            {isAddingCategory && (
              <Input mt="$2">
                <InputField
                  placeholder={i18n.t('enterNewCategory')}
                  value={newCategory}
                  onChangeText={setNewCategory}
                />
              </Input>
            )}

            {/* Room Name Input */}
            <Input mt="$4">
              <InputField
                placeholder={i18n.t('roomName')}
                value={roomName}
                onChangeText={setRoomName}
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
                <Text color={Colors.white}>
                  {loading ? i18n.t('loading') : i18n.t('save')}
                </Text>
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}