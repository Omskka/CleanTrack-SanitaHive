import React, { useState } from 'react';
import { ScrollView, Modal } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Input,
  InputField,
  Button,
  Text,
  Pressable,
  Icon,
  RadioGroup,
  Radio,
  RadioLabel,
  RadioIndicator,
} from '@gluestack-ui/themed';
import { ChevronDown, ChevronUp, CircleIcon, Plus, RadioIcon } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';

const roomsData = [
  { category: '1. Kat', rooms: ['Oda 101', 'Oda 102', 'Oda 103'] },
  { category: '2. Kat', rooms: ['Oda 201', 'Oda 202', 'Oda 203'] },
  { category: '3. Kat', rooms: ['Oda 301', 'Oda 302'] },
];

export default function RoomsScreen() {
  const [searchText, setSearchText] = useState('');
  const [expanded, setExpanded] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [rooms, setRooms] = useState(roomsData);

  const toggleExpand = (category) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredRooms = rooms.map((group) => ({
    ...group,
    rooms: group.rooms.filter((room) => room.toLowerCase().includes(searchText.toLowerCase())),
  })).filter((group) => group.rooms.length > 0);

  const addRoomOrCategory = () => {
    if (selectedCategory === 'new' && newCategory) {
      setRooms([...rooms, { category: newCategory, rooms: newRoom ? [newRoom] : [] }]);
    } else if (selectedCategory) {
      setRooms(rooms.map((group) =>
        group.category === selectedCategory ? { ...group, rooms: [...group.rooms, newRoom] } : group
      ));
    }
    setSelectedCategory('');
    setNewCategory('');
    setNewRoom('');
    setModalVisible(false);
  };

  return (
    <Box flex={1} bg="$blue100">
      {/* Başlık ve Arama Çubuğu */}
      <Box px="$4" py="$6" bg="$white">
        <Heading size="lg" color="$blue800">Rooms</Heading>

        <HStack space="sm" mt="$4" alignItems="center">
          <Input flex={1}>
            <InputField
              fontSize="$sm"
              placeholder={i18n.t('searchRoomPlaceholder')}
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>
        </HStack>
      </Box>

      {/* Oda Listesi */}
      <ScrollView style={{ flex: 1 }}>
        <VStack space="md" p="$4">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((group) => (
              <Box key={group.category} bg="$white" rounded="$lg" p="$4">
                <Pressable onPress={() => toggleExpand(group.category)}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="bold">{group.category}</Text>
                    <Icon as={expanded[group.category] ? ChevronUp : ChevronDown} size="lg" />
                  </HStack>
                </Pressable>
                {expanded[group.category] && (
                  <VStack mt="$2" space="sm">
                    {group.rooms.map((room, index) => (
                      <Text key={index} color="$gray500">{room}</Text>
                    ))}
                  </VStack>
                )}
              </Box>
            ))
          ) : (
            <Text textAlign="center" color="$gray500">{i18n.t('noResultsRooms')}</Text>
          )}
        </VStack>
      </ScrollView>

      {/* Oda/Kategori Ekle Butonu */}
      <Box px="$4" py="$4" bg="$white">
        <Button bg="$blue600" rounded="$lg" onPress={() => setModalVisible(true)}>
          <Icon as={Plus} color="$white" mr="$2" />
          <Text color="$white" fontWeight="bold">{i18n.t('addRoomButton')}</Text>
        </Button>
      </Box>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Box flex={1} justifyContent="center" alignItems="center" bg="rgba(0,0,0,0.5)">
          <Box bg="$white" p="$6" rounded="$lg" width="80%">
            <Heading size="md">{i18n.t('addRoomCategory')}</Heading>

            {/* Radio Group for Category Selection */}
            <RadioGroup value={selectedCategory} onChange={setSelectedCategory}>
                {rooms.map((group) => (
                <Radio key={group.category} value={group.category}>
                  <RadioIndicator mr="$2">
                  {selectedCategory === group.category && (
                    <RadioIcon>
                      <CircleIcon fill="grey" />
                    </RadioIcon>
                  )}
                  </RadioIndicator>
                  <RadioLabel>{group.category}</RadioLabel>
                </Radio>
                ))}
              <Radio value="new">
                <RadioIndicator mr="$2">
                  {selectedCategory === "new" && (
                    <RadioIcon>
                      <CircleIcon fill="grey" />
                    </RadioIcon>
                  )}
                </RadioIndicator>
                <RadioLabel>{i18n.t('newCategory')}</RadioLabel>
              </Radio>
            </RadioGroup>

            {/* Show input field only when "New Category" is selected */}
            {selectedCategory === 'new' && (
              <Input mt="$4">
                <InputField
                  placeholder={i18n.t('newCategory')}
                  value={newCategory}
                  onChangeText={setNewCategory}
                />
              </Input>
            )}

            {/* Room Name Input */}
            <Input mt="$4">
              <InputField placeholder={i18n.t('newRoom')} value={newRoom} onChangeText={setNewRoom} />
            </Input>

            <HStack mt="$4" justifyContent="space-between">
              <Button bg="$grey" onPress={() => setModalVisible(false)}>
                <Text color="$white">{i18n.t('cancel')}</Text>
              </Button>
              <Button bg="$blue600" onPress={addRoomOrCategory}>
                <Text color="$white">{i18n.t('save')}</Text>
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
