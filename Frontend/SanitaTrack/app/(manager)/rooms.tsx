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
import { useLanguage } from '@/contexts/LanguageContext';

interface Room {
  roomId: string;
  id: number;
  roomName: string;
  roomFloor: string;
  teamId: string;
}

export default function RoomsScreen() {
  // State for search input in the room list
  const [searchText, setSearchText] = useState('');
  // State for modal visibility (add room)
  const [modalVisible, setModalVisible] = useState(false);
  // State for new room name input
  const [roomName, setRoomName] = useState('');
  // State for new room ID (generated)
  const [roomId, setRoomId] = useState('');
  // State for new room's floor/category
  const [roomFloor, setRoomFloor] = useState('');
  // State for error messages
  const [error, setError] = useState('');
  // State for loading spinner
  const [loading, setLoading] = useState(false);
  // State for current user's (manager's) user ID
  const [userID, setUserID] = useState('');
  // State for all rooms fetched from backend
  const [rooms, setRooms] = useState<Room[]>([]);

  // State for expanded/collapsed categories in the UI
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  // State for new category input
  const [newCategory, setNewCategory] = useState('');
  // State for toggling between selecting and adding a new category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  // State for all unique categories (room floors)
  const [categories, setCategories] = useState<string[]>([]);
  // State for currently selected category in the add room modal
  const [selectedCategory, setSelectedCategory] = useState('');
  // Language context for i18n
  const { language } = useLanguage();

  // QR code sharing state
  const [qrModalVisible, setQrModalVisible] = useState(false);
  // Value to encode in the QR code (room feedback URL)
  const [qrValue, setQrValue] = useState('');
  // Name of the room for which QR is generated
  const [currentRoomName, setCurrentRoomName] = useState('');
  // Ref for capturing QR code image
  const qrCodeRef = useRef<any>(null);

  // Define styles for QR code and modal
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
    // Fetch user ID from AsyncStorage on mount
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
    // Fetch rooms when userID is available
    if (!userID) return;
    handleFetchRooms();
  }, [userID]);

  // Fetch all rooms for the current team/manager
  const handleFetchRooms = async () => {
    setLoading(true);
    try {
      const roomsData = await fetchRooms();
      // Only show rooms belonging to this manager's team
      const filteredRooms: Room[] = roomsData.filter((room: Room) => room.teamId === userID);
      setRooms(filteredRooms);

      // Extract unique categories (room floors) for filtering/grouping
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

  // Add a new room to the backend
  const handleAddRoom = async () => {
    // Use new category if adding, otherwise use selected
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

  // Delete a room by roomId
  const handleDeleteRoom = async (roomId: string) => {
    setLoading(true);
    try {
      await deleteRoom(roomId); // now only sends roomId
      alert(i18n.t('roomDeleted'));
      setRooms((prev) => prev.filter((room) => room.roomId !== roomId)); // filter by roomId
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.message || i18n.t('failedToDeleteRoom'));
    } finally {
      setLoading(false);
    }
  };

  // Open QR modal for sharing room feedback link
  const handleShareRoom = (roomId: string, roomName: string) => {
    setQrValue(`https://localhost:8081/feedback/${roomId}`);
    setCurrentRoomName(roomName);
    setQrModalVisible(true);
  };

  // Check if sharing is available (iOS/Android)
  const checkSharingAvailability = async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return await Sharing.isAvailableAsync();
    }
    return false;
  };

  // Share QR code image using ViewShot and expo-sharing
  const shareQRCode = async () => {
    if (!qrCodeRef.current) {
      alert(i18n.t('qrCodeNotReady'));
      return;
    }

    try {
      // First check if sharing is available
      const isSharingAvailable = await checkSharingAvailability();
      if (!isSharingAvailable) {
        alert(i18n.t('sharingUnavailable'));
        return;
      }

      // Capture the QR code as an image
      const uri = await qrCodeRef.current.capture();

      // Use expo-sharing to share the captured image
      await Sharing.shareAsync(uri, {
        dialogTitle: i18n.t('qrCodeDialogTitle', { roomName: currentRoomName }),
        mimeType: 'image/png',
        UTI: 'public.png' // Uniform Type Identifier for iOS
      });
    } catch (error: any) {
      console.error('Error sharing QR code image:', error);
      alert(i18n.t('shareQrFailed'));
    }
  };

  // Toggle expand/collapse for a category
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
      {/* Header with search bar */}
      <Box p="$4" pt="$9" bg={Colors.white}>
        <Heading size="lg" color={Colors.heading}>{i18n.t('roomsTitle')}</Heading>
        <HStack space="sm" mt="$4" alignItems="center">
          <Input borderColor={Colors.text} flex={1}>
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

      {/* Room List grouped by categories (expandable) */}
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
              {/* Category header (expand/collapse) */}
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

              {/* List of rooms in this category */}
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
                            {/* Share QR code button */}
                            <Button
                              size="sm"
                              bg={Colors.text}
                              rounded="$lg"
                              onPress={() => handleShareRoom(item.roomId, item.roomName)}
                            >
                              <Icon as={Share2} size="sm" color={Colors.white} />
                            </Button>
                            {/* Delete room button */}
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

              {/* New category input or select existing */}
              {isAddingCategory ? (
                <HStack space="md" mt="$2" alignItems="center">
                  <Input borderColor={Colors.text} flex={1}>
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
                    <SelectTrigger variant="outline" size="md" borderColor={Colors.text}>
                      <SelectInput placeholder={i18n.t('chooseCategory')} />
                      <SelectIcon as={ChevronDown} mr={5} />
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
              <Input borderColor={Colors.text}>
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
              {/* Cancel button */}
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
              {/* Create room button */}
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

      {/* QR Code Modal with ViewShot for sharing */}
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
              {/* QR code image for sharing */}
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
              {/* Share QR code button */}
              <Button
                onPress={shareQRCode}
                bg={Colors.text}
                flex={1}
              >
                <Icon as={Share2} color={Colors.white} mr={5} />
                <Text color={Colors.white}>{i18n.t('shareQrCode')}</Text>
              </Button>
              {/* Close modal button */}
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