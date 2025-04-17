import React, { useEffect, useState } from 'react';
import { ScrollView, Linking, Share } from 'react-native';
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
  InputSlot,
} from '@gluestack-ui/themed';
import { Search } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const callPhone = (phoneNumber: string) => {
  Linking.openURL(`tel:${phoneNumber}`);
};

export default function TeamInfoScreen() {
  const [searchText, setSearchText] = useState('');
  const [userID, setUserID] = useState('');

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

const handleShare = async () => {
  try {
    const shortID = userID.slice(0, 8); // only the first 8 characters

    const result = await Share.share({
      message: `Join my team with this team ID: ${shortID}`,
    });

    if (result.action === Share.sharedAction) {
      console.log('Shared successfully');
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Üst Kısım - Başlık ve Arama Çubuğu */}
      <Box px="$4" py="$6" bg={Colors.white}>
        <Heading size="lg" color={Colors.heading}>
          {i18n.t('teamTitle')}
        </Heading>

        <HStack space="sm" mt="$4" alignItems="center">
          <Input flex={1}>
            <InputSlot pl='$3'>
              <Icon as={Search} size="lg" color={Colors.text} />
            </InputSlot>
            <InputField
              fontSize="$sm"
              placeholder={i18n.t('searchMemberPlaceholder')}
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>

          <Pressable
            px="$4"
            py="$2"
            bg={Colors.text}
            rounded="$md"
            onPress={() => console.log('Edit pressed')}
          >
            <Text color={Colors.white} fontWeight="bold">
              {i18n.t('edit')}
            </Text>
          </Pressable>
        </HStack>
      </Box>

      {/* Kullanıcı Listesi */}
      <ScrollView style={{ flex: 1 }}>
        {/* Member cards or list items would go here */}
      </ScrollView>

      {/* Alt Kısım - Sabit Buton */}
      <Box px="$4" py="$4" bg={Colors.white}>
        <Button onPress={handleShare} bg={Colors.text} rounded="$lg">
          <Text color={Colors.white} fontWeight="bold">
            {i18n.t('addMemberButton')}
          </Text>
        </Button>
      </Box>
    </Box>
  );
}
