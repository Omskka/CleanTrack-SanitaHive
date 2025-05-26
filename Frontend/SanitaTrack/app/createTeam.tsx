import React, { useState } from 'react';
import { Dimensions, Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import {
  Box,
  VStack,
  Heading,
  Input,
  InputField,
  Button,
  Text,
  Pressable,
  FormControl,
  FormControlLabel,
  FormControlError,
  Image,
} from '@gluestack-ui/themed';
import { i18n } from '@/hooks/i18n';  // For language support
import { Colors } from '../constants/Colors';
import { Link, router } from 'expo-router';
import UUID from 'react-native-uuid';
import { registerUser, createTeam } from '@/api/apiService';
import { useLanguage } from '@/contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateTeam() {
  // State variables for form fields and UI
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [manager, setManager] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { language, changeLanguage } = useLanguage();  // For language state
  const [loading, setLoading] = useState(false);

  // Main handler for creating a team and registering the manager
  const handleCreateTeam = async () => {
    // Validate all required fields
    if (!name.trim() || !surname.trim() || !phone.trim() || !password.trim()) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }

    setLoading(true);

    try {
      // Generate a unique userId for the manager
      const userId = UUID.v4();

      // 1️⃣ Register the Manager User
      const newUser = {
        userId: userId as string, // UUID.v4() returns string | number[], so we cast it
        name: name.trim(),
        surname: surname.trim(),
        phoneNumber: phone.trim(),
        password: password.trim(),
        manager: true,
        lang: language,
      };

      // Call backend API to register the manager user
      const userData = await registerUser(newUser);
      console.log('User Data:', userData);

      // If user registration fails, throw error
      if (!userData || !userData.userId) {
        throw new Error(i18n.t('userCreationError'));
      }

      // Get the manager's userId from the response
      const managerId = userData.userId;
      console.log('--userID--:', managerId);

      // 2️⃣ Create a Team for this Manager
      const teamData = {
        teamName: teamName.trim(),
        managerId: managerId,
        employeeId: [], // Start with an empty employee list
      };

      // Call backend API to create the team
      const teamResult = await createTeam(teamData);
      console.log('Team created successfully:', teamResult);

      // 3️⃣ Success: Show alert and navigate to login
      setError('');
      alert(i18n.t('teamCreatedSuccess'));
      setTimeout(() => {
        router.push('/');
      }, 100);

    } catch (error: any) {
      // Handle errors during registration or team creation
      console.error('Error during team creation flow:', error);
      setError(error.message || i18n.t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <LinearGradient
          colors={['#d3ecdc', '#5a855f']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >

        {/* App Title at the top */}
        <Text
          color={Colors.text}
          fontWeight="bold"
          top="$16"
          left="$4"
          position="absolute"
          zIndex={1}
        >
          SanitaHive
        </Text>

        {/* Language Selection Button in the top right */}
        <Pressable
          position="absolute"
          top="$16"
          right="$6"
          onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}
          zIndex={2}
        >
          <Text color={Colors.text} fontWeight="bold">
            {language === 'en' ? 'TR' : 'EN'}
          </Text>
        </Pressable>

        {/* Main Form Area */}
        <Box w="90%" maxWidth="$80" p="$7" bg={Colors.white} rounded="$2xl" boxShadow="$4">
          <Heading size="xl" color={Colors.heading} textAlign="center">
            {i18n.t('createTeamTitle')}
          </Heading>

          <VStack space="lg" mt="$4">
            {/* Name Field */}
            <FormControl isInvalid={!!error && !name.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('name')}</Text>
              </FormControlLabel>

              <Input borderColor={Colors.text}>
                <InputField
                  fontSize="$sm"
                  placeholder={i18n.t('namePlaceholder')}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (error) setError('');
                  }}
                />
              </Input>

              {/* Show error if name is missing */}
              {!!error && !name.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterName')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Surname Field */}
            <FormControl isInvalid={!!error && !surname.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('surname')}</Text>
              </FormControlLabel>

              <Input borderColor={Colors.text}>
                <InputField
                  fontSize="$sm"
                  placeholder={i18n.t('surnamePlaceholder')}
                  value={surname}
                  onChangeText={(text) => {
                    setSurname(text);
                    if (error) setError('');
                  }}
                />
              </Input>

              {/* Show error if surname is missing */}
              {!!error && !surname.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterSurname')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Company/Team Name Field */}
            <FormControl isInvalid={!!error && !teamName.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('companyNameLabel')}</Text>
              </FormControlLabel>

              <Input borderColor={Colors.text}>
                <InputField
                  fontSize="$sm"
                  placeholder={i18n.t('companyNamePlaceholder')}
                  value={teamName}
                  onChangeText={(text) => {
                    setTeamName(text);
                    if (error) setError('');
                  }}
                />
              </Input>

              {/* Show error if company/team name is missing */}
              {!!error && !teamName.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterCompanyName')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Phone Field */}
            <FormControl isInvalid={!!error && !phone.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('phoneLabel')}</Text>
              </FormControlLabel>

              <Input borderColor={Colors.text}>
                <InputField
                  fontSize="$sm"
                  keyboardType="phone-pad"
                  placeholder={i18n.t('phonePlaceholder')}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (error) setError('');
                  }}
                />
              </Input>

              {/* Show error if phone is missing */}
              {!!error && !phone.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterPhone')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Password Field */}
            <FormControl isInvalid={!!error && !password.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('passwordLabel')}</Text>
              </FormControlLabel>

              <Input borderColor={Colors.text}>
                <InputField
                  fontSize="$sm"
                  type="password"
                  placeholder={i18n.t('passwordPlaceholder')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError('');
                  }}
                  secureTextEntry
                />
              </Input>

              {/* Show error if password is missing */}
              {!!error && !password.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterPassword')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Create Team Button */}
            <Button onPress={handleCreateTeam} bg={Colors.text} mt={"$1.5"} rounded="$xl" alignSelf="center">
              <Text color={Colors.white} fontWeight="bold">{i18n.t('createTeamButton')}</Text>
            </Button>

            {/* Link to Login Page */}
            <Box alignItems="center">
              <Text fontSize="$sm">{i18n.t('alreadyHaveAccount')}</Text>
              <Pressable>
                <Link href="/">
                  <Text color={Colors.text} fontWeight="bold">{i18n.t('loginHere')}</Text>
                </Link>
              </Pressable>
            </Box>
          </VStack>
        </Box>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}