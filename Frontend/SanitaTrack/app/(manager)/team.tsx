import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, Share, ActivityIndicator, Linking, RefreshControl } from 'react-native';
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
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  CloseIcon,
  ButtonGroup,
  ButtonText,
  Center,
} from '@gluestack-ui/themed';
import { Phone, Search, Trash2, Edit } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAllUsers, fetchTeamByManager, removeTeamMember } from '@/api/apiService';
import { useLanguage } from '@/contexts/LanguageContext';

// User type for team members
type User = {
  userId: string;
  name: string;
  surname: string;
  phone: string;
};

export default function TeamInfoScreen() {
  // State for search input
  const [searchText, setSearchText] = useState('');
  // State for current manager's user ID
  const [userID, setUserID] = useState<string>('');
  // State for team members list
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  // State for loading spinner
  const [loading, setLoading] = useState(true);
  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  // State for edit mode (show delete buttons)
  const [editMode, setEditMode] = useState(false);
  // State for delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // State for which user is selected for deletion
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  // Get language context (not used directly here, but ensures re-render on language change)
  const { language } = useLanguage();

  useEffect(() => {
    // Fetch team data on mount
    fetchTeamData();
  }, []);

  // Fetch team members and manager info from backend
  const fetchTeamData = async () => {
    try {
      setLoading(true);
      // Get manager ID from AsyncStorage
      const raw = await AsyncStorage.getItem('userToken');
      if (!raw) {
        console.warn('No userToken found in storage');
        return;
      }

      const managerId = JSON.parse(raw);
      setUserID(managerId);

      // Fetch team info by manager ID
      const team = await fetchTeamByManager(managerId);
      const ids = Array.isArray(team.employeeId) ? team.employeeId : [];

      // Fetch all users to match with team members
      const allUsers = await fetchAllUsers();

      // Filter and format team members
      const members = allUsers
        .filter((u: any) => ids.includes(u.userId))
        .map((u: any) => ({
          userId: u.userId,
          name: u.name,
          surname: u.surname,
          phone: u.phoneNumber || 'Number Unavailable'
        }));

      setTeamMembers(members);
    } catch (e) {
      console.error('Error during team init:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handler for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTeamData();
    } catch (e) {
      console.error('Error during refresh:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Share team code with others
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my team with this code: ${userID.slice(0, 8)}`,
      });
    } catch (e) {
      console.error('Share error', e);
    }
  };

  // Toggle edit mode (show/hide delete buttons)
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Call a team member's phone number
  const callPhone = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Open delete confirmation dialog for a user
  const openDeleteConfirm = (userId: string) => {
    setSelectedUserId(userId);
    setShowDeleteConfirm(true);
  };

  // Remove a team member from the team
  const handleDeleteMember = async () => {
    if (!selectedUserId) return;

    try {
      await removeTeamMember(userID, selectedUserId);
      // Update local state without refetching
      setTeamMembers(prev => prev.filter(member => member.userId !== selectedUserId));
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete team member:", error);
    }
  };

  // Filter team members by search text
  const filtered = teamMembers.filter((user) =>
    `${user.name} ${user.surname}`.toLowerCase().includes(searchText.toLowerCase())
  );

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={Colors.text} />
      </Box>
    );
  }

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header and Search */}
      <Box p="$4" pt="$9" bg={Colors.white}>
        <Heading size="lg" color={Colors.heading}>
          {i18n.t('teamTitle')}
        </Heading>

        <HStack space="sm" mt="$4" alignItems="center">
          {/* Search input for filtering team members */}
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

          {/* Edit mode toggle button */}
          <Pressable
            px="$4"
            py="$2"
            bg={Colors.text}
            rounded="$md"
            onPress={toggleEditMode}
          >
            <HStack alignItems="center">
              <Icon as={Edit} color={Colors.white} size="sm" mr={5} />
              <Text color={Colors.white} fontWeight="bold">
                {editMode ? i18n.t('done') : i18n.t('edit')}
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      </Box>

      {/* Team Member List with Pull to Refresh */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.text]}
            tintColor={Colors.text}
          />
        }
      >
        <VStack space="md" p="$4">
          {filtered.length > 0 ? (
            filtered.map((user) => (
              <Box key={user.userId} p="$4" bg={Colors.white} rounded="$lg">
                <HStack alignItems="center" justifyContent="space-between">
                  {/* User Information */}
                  <HStack alignItems="center" space="md">
                    <Avatar bg={Colors.text} size="md">
                      <AvatarFallbackText>{`${user.name} ${user.surname}`}</AvatarFallbackText>
                    </Avatar>
                    <VStack>
                      <Text fontWeight="bold">{user.name} {user.surname}</Text>
                      <Text color={Colors.gray}>{user.phone}</Text>
                    </VStack>
                  </HStack>

                  {/* Action Buttons: Delete or Call */}
                  <HStack space="md">
                    {editMode ? (
                      // Show delete button in edit mode
                      <Pressable onPress={() => openDeleteConfirm(user.userId)}>
                        <Icon as={Trash2} size="lg" color="$red700" />
                      </Pressable>
                    ) : (
                      // Show call button in normal mode
                      <Pressable onPress={() => callPhone(user.phone || '')}>
                        <Icon as={Phone} size="lg" color={Colors.text} />
                      </Pressable>
                    )}
                  </HStack>
                </HStack>
              </Box>
            ))
          ) : (
            // Show message if no members found
            <Center py="$8">
              <Text textAlign="center" color={Colors.gray}>
                {i18n.t('noResultsMember')}
              </Text>
            </Center>
          )}
        </VStack>
      </ScrollView>

      {/* Footer Button for sharing team code */}
      <Box px="$4" py="$4" bg={Colors.white}>
        <Button onPress={handleShare} bg={Colors.text} rounded="$lg">
          <ButtonText color={Colors.white} fontWeight="bold">
            {i18n.t('addMemberButton')}
          </ButtonText>
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">{i18n.t('removeTeamMember')}</Heading>
            <AlertDialogCloseButton>
              <Icon as={CloseIcon} />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              {i18n.t('removeTeamMemberConfirm')}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <ButtonGroup space="md">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowDeleteConfirm(false)}
              >
                <ButtonText>{i18n.t('cancel')}</ButtonText>
              </Button>
              <Button bg="$red600" onPress={handleDeleteMember}>
                <ButtonText>{i18n.t('confirm')}</ButtonText>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}