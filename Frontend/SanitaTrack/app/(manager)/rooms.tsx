import React, { useEffect, useState, useRef } from 'react';
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
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  Pressable,
  VStack,
  Divider,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  SelectIcon,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@gluestack-ui/themed';

import { Search, Plus, ChevronDown, ChevronUp, Trash, Share2 } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import UUID from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRooms, addRoom, deleteRoom } from '@/api/apiService';
import QRCode from 'react-native-qrcode-svg';
import { Platform, View, StyleSheet } from 'react-native';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

interface Room {
  roomId: string;
  id: number;
  roomName: string;
  roomFloor: string;
  teamId: string;
}

export default function RoomsScreen() {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
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

  // QR code sharing state
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [currentRoomName, setCurrentRoomName] = useState('');
  const qrCodeRef = useRef(null);

  // Define styles
  const styles = StyleSheet.create({
    qrContainer: {
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 8,
    },
    viewShot: {
      backgroundColor: 'white',
    },
    qrContent: {
      padding: 16,
      backgroundColor: 'white',
      alignItems: 'center',
      borderRadius: 8,
    },
    qrText: {
      marginTop: 12,
      fontSize: 14,
      textAlign: 'center',
    }
  });

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
      const filteredRooms: Room[] = roomsData.filter((room: Room) => room.teamId === userID);
      setRooms(filteredRooms);

      // Ensure categories are stored as strings
      const uniqueCategories = Array.from(
        new Set(filteredRooms.map(r => String(r.roomFloor)))
      );
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
      const roomID = UUID.v4();
      await addRoom(roomID, roomName.trim(), finalCategory, userID);
      alert(i18n.t('roomCreated'));
      setModalVisible(false);
      setRoomId(roomID);
      setRoomName('');
      setRoomFloor('');
      setSelectedCategory('');
      setNewCategory('');
      setIsAddingCategory(false);
      handleFetchRooms(); // Refresh the rooms list
    } catch (error: any) {
      console.error('Error creating room:', error);
      setError(error.message || i18n.t('failedToCreateRoom'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setLoading(true);
    try {
      await deleteRoom(roomId); // now only sends roomId
      alert('Room deleted successfully!');
      setRooms((prev) => prev.filter((room) => room.roomId !== roomId)); // filter by roomId
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.message || i18n.t('failedToDeleteRoom'));
    } finally {
      setLoading(false);
    }
  };

  const handleShareRoom = (roomId: string, roomName: string) => {
    setQrValue(`https://localhost:8081/feedback/${roomId}`);
    setCurrentRoomName(roomName);
    setQrModalVisible(true);
  };

  // Function to check if sharing is available (for iOS)
  const checkSharingAvailability = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return await Sharing.isAvailableAsync();
    }
    return false;
  };

  // Function to share QR code using ViewShot and expo-share
  const shareQRCode = async () => {
    if (!qrCodeRef.current) {
      alert('QR Code not ready for sharing');
      return;
    }

    try {
      // First check if sharing is available
      const isSharingAvailable = await checkSharingAvailability();
      if (!isSharingAvailable) {
        alert('Sharing is not available on this device');
        return;
      }

      // Capture the QR code as an image
      const uri = await qrCodeRef.current.capture();
      console.log('Captured QR code URI:', uri);

      // Use expo-sharing to share the captured image
      await Sharing.shareAsync(uri, {
        dialogTitle: `QR Code for ${currentRoomName}`,
        mimeType: 'image/png',
        UTI: 'public.png' // Uniform Type Identifier for iOS
      });
    } catch (error: any) {
      console.error('Error sharing QR code image:', error);
      alert(`Failed to share QR code image: ${error.message}`);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Filter rooms based on search text
  const filteredRooms = searchText
    ? rooms.filter(room =>
      room.roomName.toLowerCase().includes(searchText.toLowerCase()) ||
      room.roomFloor.toLowerCase().includes(searchText.toLowerCase())
    )
    : rooms;

  // Get filtered categories based on search or all categories
  const filteredCategories = searchText
    ? Array.from(new Set(filteredRooms.map(room => String(room.roomFloor))))
    : categories;

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

      {/* Room List with Expandable Cards */}
      <VStack px="$4" py="$4" space="md">
        {filteredCategories.map((category) => {
          const categoryKey = String(category); // Ensure the category is a string
          const isExpanded = expandedCategories[categoryKey];
          const roomsInCategory = filteredRooms.filter(
            (room) => String(room.roomFloor) === categoryKey
          );

          return (
            <Box
              key={categoryKey} // Use the string version as the key
              mb="$2"
              borderWidth={1}
              borderColor={Colors.gray}
              borderRadius="$lg"
              overflow="hidden"
              bg={Colors.white}
            >
              <Pressable onPress={() => toggleCategory(categoryKey)}>
                <Box p="$3">
                  <HStack justifyContent="space-between" alignItems="center" w="100%">
                    <Text fontWeight="bold" fontSize="$md">{category}</Text>
                    <Icon
                      as={isExpanded ? ChevronUp : ChevronDown}
                      size="sm"
                      color={Colors.text}
                    />
                  </HStack>
                </Box>
              </Pressable>

              {isExpanded && (
                <Box px="$3" pb="$3">
                  <VStack space="sm">
                    <Divider />
                    {roomsInCategory.length > 0 ? (
                      roomsInCategory.map((item) => (
                        <HStack
                          key={`room-${item.roomId}`}
                          justifyContent="space-between"
                          alignItems="center"
                          py="$2"
                        >
                          <Text fontWeight="$medium">{item.roomName}</Text>
                          <HStack space="sm">
                            <Button
                              size="sm"
                              bg={Colors.text}
                              rounded="$lg"
                              onPress={() => handleShareRoom(item.roomId, item.roomName)}
                            >
                              <Icon as={Share2} size="sm" color={Colors.white} />
                            </Button>
                            <Button
                              size="sm"
                              bg={Colors.error}
                              rounded="$lg"
                              onPress={() => handleDeleteRoom(item.roomId)}
                            >
                              <Icon as={Trash} size="sm" color={Colors.white} />
                            </Button>
                          </HStack>
                        </HStack>
                      ))
                    ) : (
                      <Text color={Colors.gray}>No rooms in this category</Text>
                    )}
                  </VStack>
                </Box>
              )}
            </Box>
          );
        })}
      </VStack>

      {/* Add Room Modal */}
      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">{i18n.t('enterRoomInformation')}</Heading>
          </ModalHeader>

          <ModalBody>
            {/* Category Select or New Category Input */}
            <FormControl mt="$4">
              <FormControlLabel>
                <FormControlLabelText>
                  <Text>
                    {isAddingCategory ? i18n.t('enterNewCategory') : i18n.t('chooseCategory')}
                  </Text>
                </FormControlLabelText>
              </FormControlLabel>

              {isAddingCategory ? (
                <HStack space="md" mt="$2" alignItems="center">
                  <Input flex={1}>
                    <InputField
                      placeholder={i18n.t('enterNewCategory')}
                      value={newCategory}
                      onChangeText={setNewCategory}
                    />
                  </Input>
                  <Button onPress={() => setIsAddingCategory(false)} bg={Colors.text} size="sm">
                    <Icon as={Plus} color={Colors.white} />
                  </Button>
                </HStack>
              ) : (
                <HStack space="md" mt="$2" alignItems="center">
                  <Select
                    flex={1}
                    selectedValue={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                  >
                    <SelectTrigger variant="outline" size="md" borderColor={Colors.gray}>
                      <SelectInput placeholder={i18n.t('chooseCategory')} />
                      <SelectIcon>
                        <Icon as={ChevronDown} />
                      </SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        {categories.map((cat) => (
                          <SelectItem key={`category-${cat}`} label={cat} value={cat} />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <Button onPress={() => setIsAddingCategory(true)} bg={Colors.text} size="sm">
                    <Icon as={Plus} color={Colors.white} />
                  </Button>
                </HStack>
              )}
            </FormControl>

            {/* Room Name Input */}
            <FormControl mt="$4">
              <FormControlLabel>
                <FormControlLabelText><Text>{i18n.t('roomName')}</Text></FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder={i18n.t('roomName')}
                  value={roomName}
                  onChangeText={setRoomName}
                />
              </Input>
            </FormControl>

            {/* Error Message */}
            {error ? (
              <Text mt="$2" color={Colors.error}>
                {error}
              </Text>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <HStack space="sm" justifyContent="flex-end" w="100%">
              <Button
                variant="outline"
                borderColor={Colors.text}
                onPress={() => {
                  setModalVisible(false);
                  setRoomName('');
                  setRoomFloor('');
                  setSelectedCategory('');
                  setNewCategory('');
                  setIsAddingCategory(false);
                  setError('');
                }}
              >
                <Text color={Colors.text}>{i18n.t('cancel')}</Text>
              </Button>
              <Button
                onPress={handleAddRoom}
                bg={Colors.text}
                isDisabled={loading}
              >
                <Text color={Colors.white}>{i18n.t('create')}</Text>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* QR Code Modal with ViewShot */}
      <Modal isOpen={qrModalVisible} onClose={() => setQrModalVisible(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">{i18n.t('shareRoomQrCode')}</Heading>
          </ModalHeader>

          <ModalBody>
            <VStack space="md" alignItems="center" py="$4">
              <Text textAlign="center" fontWeight="$medium">
                {currentRoomName}
              </Text>
              {/* The ViewShot component needs to be properly positioned */}
              <View style={styles.qrContainer}>
                <ViewShot
                  ref={qrCodeRef}
                  options={{ format: 'png', quality: 1 }}
                  style={styles.viewShot}
                >
                  <View style={styles.qrContent}>
                    <QRCode
                      value={qrValue}
                      size={200}
                      backgroundColor="white"
                    />
                    <Text style={styles.qrText}>
                      {currentRoomName}
                    </Text>
                  </View>
                </ViewShot>
              </View>
              <Text textAlign="center" fontSize="$sm" color={Colors.text}>
                {i18n.t('scanQrToAccess')}
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack space="sm" justifyContent="space-between" w="100%">
              <Button
                onPress={shareQRCode}
                bg={Colors.text}
                flex={1}
              >
                <Icon as={Share2} color={Colors.white} mr={5} />
                <Text color={Colors.white}>{i18n.t('shareQrCode')}</Text>
              </Button>
              <Button
                onPress={() => setQrModalVisible(false)}
                variant="outline"
                borderColor={Colors.text}
                flex={1}
              >
                <Text color={Colors.text}>{i18n.t('close')}</Text>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
}