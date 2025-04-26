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
import { registerUser, createTeam } from '@/api/apiService'; 

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
      // Generate a unique userId
      const userId = UUID.v4();
  
      // 1️⃣ Register the Manager User
      const newUser = {
        userId: userId as string, // UUID.v4() returns string | number[], so we cast it
        name: name.trim(),
        surname: surname.trim(),
        phoneNumber: phone.trim(),
        password: password.trim(),
        isManager: true,
        lang: language,
      };
  
      const userData = await registerUser(newUser);
      console.log('User Data:', userData);
  
      if (!userData || !userData.userId) {
        throw new Error('User registration failed: Missing userId');
      }
  
      const managerId = userData.userId;
      console.log('--userID--:', managerId);
  
      // 2️⃣ Create a Team for this Manager
      const teamData = {
        teamName: teamName.trim(),
        managerId: managerId,
        employeeId: [],
      };
  
      const teamResult = await createTeam(teamData);
      console.log('Team created successfully:', teamResult);
  
      // 3️⃣ Success: Show alert and navigate
      setError('');
      alert('Account and team created successfully!');
      setTimeout(() => {
        router.push('/');
      }, 100);
  
    } catch (error: any) {
      console.error('Error during team creation flow:', error);
      setError(error.message || i18n.t('networkError'));
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
