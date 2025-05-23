import React, { useState, useEffect } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { Box, VStack, Heading, Input, InputField, Button, Text, Pressable, FormControl, FormControlLabel, FormControlError, Image, HStack } from '@gluestack-ui/themed';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';
import { Link } from 'expo-router';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';  // For storing user token
import { login } from '@/api/apiService';

export default function LoginScreen() {
  // State variables for form fields and UI
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(getCurrentLanguage());
  const router = useRouter();

  // Handle login button press
  const handleLogin = async () => {
    // Validate phone input
    if (!phone.trim()) {
      setError(i18n.t('enterPhone'));
      return;
    }
    // Validate password input
    if (!password.trim()) {
      setError(i18n.t('enterPassword'));
      return;
    }

    setError('');
    try {
      // Call backend login API
      const result = await login(phone, password);
      console.log('Login successful', result);

      // Get user ID from response
      const userID = result?.userId;
      if (userID) {
        // Store user token in AsyncStorage
        await AsyncStorage.setItem('userToken', JSON.stringify(userID));
        // Check if user is a manager and route accordingly
        const isManager = result?.manager;
        isManager ? router.push('/(manager)/team') : router.push('/workerHomepage');
      } else {
        setError(i18n.t('loginFailed'));
      }
    } catch (error) {
      // Handle login errors
      console.error('Login Failed', error);
      setError(i18n.t('serverError'));
    }
  };

  useEffect(() => {
    // Update component when language changes
    setLanguage(getCurrentLanguage());
  }, [language]);

  // Change language handler
  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <Box flex={1} justifyContent="center" alignItems="center" bg={Colors.background} position="relative">
          {/* Top decorative image */}
          <Image
            source={require('@/assets/images/login-img-top.png')}
            alt="Top Image"
            position="absolute"
            top={0}
            width={Dimensions.get('screen').width}
            height={200}
            resizeMode="contain"
          />

          {/* Bottom decorative image */}
          <Image
            source={require('@/assets/images/login-img-bottom.png')}
            alt="Bottom Image"
            position="absolute"
            bottom={0}
            width={Dimensions.get('screen').width}
            height={190}
            resizeMode="contain"
          />

          {/* App Title */}
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

          {/* Login Form */}
          <VStack space="xl" w="90%" maxWidth="$80" p="$7" bg={Colors.white} rounded="$2xl" boxShadow="$4" zIndex={1}>
            <Heading size="xl" color={Colors.heading} textAlign="center">
              {i18n.t('loginTitle')}
            </Heading>

            {/* Phone Input Field */}
            <FormControl isInvalid={!!error && !phone.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('phoneLabel')}</Text>
              </FormControlLabel>

              <Input>
                <InputField fontSize="$sm" keyboardType='phone-pad' placeholder={i18n.t('phonePlaceholder')}
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

            {/* Password Input Field */}
            <FormControl isInvalid={!!error && !password.trim()}>
              <FormControlLabel>
                <Text>{i18n.t('passwordLabel')}</Text>
              </FormControlLabel>

              <Input>
                <InputField fontSize="$sm" type='password' placeholder={i18n.t('passwordPlaceholder')}
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

            {/* Login Button */}
            <Button onPress={handleLogin} bg={Colors.text} px={"$7"} mt={"$1.5"} rounded="$xl" alignSelf="center">
              <Text color={Colors.white} fontWeight="bold">{i18n.t('loginButton')}</Text>
            </Button>

            {/* Links to Create Team and Register as Worker */}
            <HStack justifyContent="space-evenly">
              {/* Manager registration link */}
              <Box alignItems="center" mt="$2">
                <Text fontSize="$sm">{i18n.t('isManager')}</Text>
                <Pressable>
                  <Link href="/createTeam">
                    <Text color={Colors.text} fontWeight="bold">{i18n.t('createTeam')}</Text>
                  </Link>
                </Pressable>
              </Box>
              {/* Worker registration link */}
              <Box alignItems="center" mt="$2">
                <Text fontSize="$sm">{i18n.t('isWorker')}</Text>
                <Pressable>
                  <Link href="/createAccount/user">
                    <Text color={Colors.text} fontWeight="bold">{i18n.t('register')}</Text>
                  </Link>
                </Pressable>
              </Box>
            </HStack>
          </VStack>
        </Box>
      </View>
    </TouchableWithoutFeedback>
  );
}