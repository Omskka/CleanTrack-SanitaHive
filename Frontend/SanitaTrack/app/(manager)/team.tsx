import React, { useState } from 'react';
import { ScrollView, Linking } from 'react-native';
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
  Avatar,
  Icon,
  AvatarFallbackText,
  InputSlot,
} from '@gluestack-ui/themed';
import { Phone, Search } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';

const users = [
  { id: 1, firstName: 'Bengisu', lastName: 'Su', phone: '800-***-38' },
  { id: 2, firstName: 'Meli', lastName: 'Ke', phone: '900-***-45' },
  { id: 3, firstName: 'Ömer', lastName: 'Murat', phone: '700-***-12' },
  { id: 4, firstName: 'Bu', lastName: 'Se', phone: '800-***-38' },
  { id: 5, firstName: 'Mehmet', lastName: 'Can', phone: '900-***-45' },
  { id: 6, firstName: 'Elif', lastName: 'Deniz', phone: '700-***-12' },
  { id: 7, firstName: 'Bengisu', lastName: 'Su', phone: '800-***-38' },
  { id: 8, firstName: 'Ömer', lastName: 'Murat', phone: '700-***-12' },
  { id: 9, firstName: 'Meli', lastName: 'Ke', phone: '900-***-45' },
];

const callPhone = (phoneNumber: string) => {
  Linking.openURL(`tel:${phoneNumber}`);
};

export default function TeamInfoScreen() {
  const [searchText, setSearchText] = useState('');

  // Kullanıcıları filtreleme
  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchText.toLowerCase())
  );

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
              onChangeText={setSearchText} // Arama çubuğu için event handler
            />
          </Input>

          <Pressable
            px="$4"
            py="$2"
            bg={Colors.text}
            rounded="$md"
            onPress={() => console.log('Edit pressed')}
          >
            <Text color={Colors.white} fontWeight="bold">{i18n.t('edit')}</Text>
          </Pressable>
        </HStack>
      </Box>

      {/* Kullanıcı Listesi */}
      <ScrollView style={{ flex: 1 }}>
        <VStack space="md" p="$4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Box key={user.id} p="$4" bg={Colors.white} rounded="$lg">
                <HStack alignItems="center" justifyContent="space-between">
                  {/* Kullanıcı Bilgileri */}
                  <HStack alignItems="center" space="md">
                    <Avatar bg={Colors.text} size="md">
                      <AvatarFallbackText>{`${user?.firstName || ''} ${user?.lastName || ''}`}</AvatarFallbackText>
                    </Avatar>
                    <VStack>
                      <Text fontWeight="bold">{user.firstName} {user.lastName}</Text>
                      <Text color={Colors.gray}>{user.phone}</Text>
                    </VStack>
                  </HStack>

                  {/* Telefon Arama Butonu */}
                  <Pressable onPress={() => callPhone(user.phone)}>
                    <Icon as={Phone} size="lg" color={Colors.text} />
                  </Pressable>
                </HStack>
              </Box>
            ))
          ) : (
            <Text textAlign="center" color={Colors.gray}>
              {i18n.t('noResultsMember')}
            </Text>
          )}
        </VStack>
      </ScrollView>

      {/* Alt Kısım - Sabit Buton */}
      <Box px="$4" py="$4" bg={Colors.white}>
        <Button bg={Colors.text} rounded="$lg">
          <Text color={Colors.white} fontWeight="bold">{i18n.t('addMemberButton')}</Text>
        </Button>
      </Box>
    </Box>
  );
}
