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
  get,
} from '@gluestack-ui/themed';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';  // For language support
import { Colors } from '../constants/Colors';
import { Link, router } from 'expo-router';
import UUID from 'react-native-uuid';

export default function CreateTeam() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(getCurrentLanguage());  // For language state
  const [loading, setLoading] = useState(false);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  const handleCreateTeam = async () => {
    if (!name.trim() || !surname.trim() || !phone.trim() || !password.trim()) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }

    setLoading(true);

    try {
      // Generate a unique userId using react-native-uuid
      const userId = UUID.v4();  // Generate a unique v4 UUID

      const userResponse = await fetch('http://10.0.2.2:8080/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          name: name.trim(),
          surname: surname.trim(),
          phoneNumber: phone.trim(),
          password: password.trim(),
          manager: true,
          lang: language,
        }),
      });

      const userData = await userResponse.json();  // Parse JSON response

      console.log('User Data:', userData);  // Log response to inspect the structure

      if (userResponse.ok) {
        const managerId = userData.userId; // Ensure it's a string
        console.log('--userID--:', managerId);


        // After successful user registration, create a team with the new manager
        const teamResponse = await fetch('http://10.0.2.2:8080/api/v1/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamName: teamName.trim(),  // You can dynamically set the team name as well
            managerId: managerId,  // Set the new user's ID as the manager of the team
            employeeId: [],  // Initially, no employees (you can update later)
          }),
        });

        const teamData = await teamResponse.json();

        if (teamResponse.ok) {
          console.log('Team created successfully:', teamData);
          // Handle the success after creating the team
        } else {
          console.error('Failed to create team:', teamData);
          setError(teamData.message || 'Failed to create team');
        }

        // Success: Show alert and navigate to login page
        setError('');
        alert('Account and team created successfully!');
        setTimeout(() => {
          router.push('/');
        }, 100);  // Delay to let the toast show
      } else {
        console.error('Registration failed:', userData);
        setError(userData.message || i18n.t('registrationFailed'));
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError(i18n.t('networkError'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background
        }}
      >

        {/* Background Image */}
        <Image
          source={require('@/assets/images/createTeam-3d-blob.png')}
          alt="Background Image"
          position="absolute"
          top={0}
          left={0}
          right={0}
          width={Dimensions.get('window').width}
          height={Dimensions.get('window').height}
          resizeMode="cover" // Expand the image to fit the screen while maintaining its aspect ratio
          zIndex={-1}
        />

        {/* Team Create Title */}
        <Text
          color={Colors.text}
          fontWeight="bold"
          top="$16"
          left="$4"
          position="absolute"
          zIndex={1}
        >
          CleanTrack
        </Text>

        {/* Language Selection Button */}
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

        {/* Form Area */}
        <Box w="90%" maxWidth="$80" p="$7" bg={Colors.white} rounded="$2xl" boxShadow="$4">
          <Heading size="xl" color={Colors.heading} textAlign="center">
            {i18n.t('createTeamTitle')}
          </Heading>

          <VStack space="lg" mt="$4">
            {/* Name */}
            <FormControl isInvalid={!!error && !name.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('name')}</Text>
              </FormControlLabel>

              <Input>
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

              {!!error && !name.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterName')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Surname */}
            <FormControl isInvalid={!!error && !surname.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('surname')}</Text>
              </FormControlLabel>

              <Input>
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

              {!!error && !surname.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterSurname')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Company Name */}
            <FormControl isInvalid={!!error && !teamName.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('companyNameLabel')}</Text>
              </FormControlLabel>

              <Input>
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

              {!!error && !teamName.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterCompanyName')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Phone */}
            <FormControl isInvalid={!!error && !phone.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('phoneLabel')}</Text>
              </FormControlLabel>

              <Input>
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

              {!!error && !phone.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                  <Text color={Colors.error} fontSize="$xs">{i18n.t('enterPhone')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={!!error && !password.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('passwordLabel')}</Text>
              </FormControlLabel>

              <Input>
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

            {/* Navigate to Login Page */}
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
      </View>
    </TouchableWithoutFeedback>
  );
}
