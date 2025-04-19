import React, { useEffect, useState } from 'react';
import { ScrollView, Share, ActivityIndicator } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Input,
  InputField,
  Button,
  Text,
  Icon,
  InputSlot,
} from '@gluestack-ui/themed';
import { Search } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  userId: string;    // <-- lowercase
  name: string;
  surname: string;
};

export default function TeamInfoScreen() {
  const [searchText, setSearchText] = useState('');
  const [userID, setUserID] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const raw = await AsyncStorage.getItem('userToken');
        if (!raw) {
          console.warn('No userToken found in storage');
          return;
        }

        const managerId = JSON.parse(raw);
        setUserID(managerId);

        const teamRes = await fetch(`http://10.0.2.2:8080/api/v1/teams/${managerId}`);

        if (!teamRes.ok) {
          console.error('Failed to fetch team:', await teamRes.text());
          return;
        }

        const team = await teamRes.json();

        const ids = Array.isArray(team.employeeId) ? team.employeeId : [];
        const usersRes = await fetch('http://10.0.2.2:8080/api/v1/users');
        if (!usersRes.ok) {
          console.error('Failed to fetch users:', await usersRes.text());
          return;
        }

        const allUsers: User[] = await usersRes.json();

        const members = allUsers.filter((u) => ids.includes(u.userId));
        console.log('Filtered team members:', members);

        setTeamMembers(members);
      } catch (e) {
        console.error('Error during team init:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my team with this code: ${userID.slice(0, 8)}`,
      });
    } catch (e) {
      console.error('Share error', e);
    }
  };

  const filtered = teamMembers.filter((u) =>
    `${u.name} ${u.surname}`.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={Colors.text} />
      </Box>
    );
  }

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header + Search */}
      <Box px="$4" py="$6" bg={Colors.white}>
        <Heading size="lg" color={Colors.heading}>
          {i18n.t('teamTitle')}
        </Heading>
        <HStack space="sm" mt="$4" alignItems="center">
          <Input flex={1}>
            <InputSlot pl="$3">
              <Icon as={Search} size="lg" color={Colors.text} />
            </InputSlot>
            <InputField
              fontSize="$sm"
              placeholder={i18n.t('searchMemberPlaceholder')}
              value={searchText}
              onChangeText={setSearchText}
            />
          </Input>
        </HStack>
      </Box>

      {/* Member List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <VStack space="md">
          {filtered.map((u) => (
            <Box key={u.userId} bg={Colors.white} p="$4" rounded="$md">
              <Text fontWeight="bold">
                {u.name} {u.surname}
              </Text>
            </Box>
          ))}
          {filtered.length === 0 && (
            <Text color={Colors.text} >
              {('No Members Found')}
            </Text>
          )}
        </VStack>
      </ScrollView>

      {/* Share Team Code */}
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
