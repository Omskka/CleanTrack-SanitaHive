import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { Box, VStack, Heading, Input, InputField, Button, Text, Pressable, FormControl, FormControlLabel, FormControlError, Image } from '@gluestack-ui/themed';
import { getCurrentLanguage, i18n } from '@/hooks/i18n';
import { Link } from 'expo-router';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';  // For storing user token

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(getCurrentLanguage());
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone.trim()) {
      setError(i18n.t('enterPhone'));
    } else if (!password.trim()) {
      setError(i18n.t('enterPassword'));
    } else {
      setError('');
      try {
        const response = await fetch('http://10.0.2.2:8080/api/v1/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: phone, password: password }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log('Login Successful', result);

          // Assuming result contains a userID (token)
          const userID = result?.userId;

          if (userID) {
            // Store the user token securely (e.g., AsyncStorage)
            await AsyncStorage.setItem('userToken', JSON.stringify(userID));

            // Get isManager
            const isManager = result?.manager;
            console.log('isManager', isManager);

            // Navigate based on role
            if (isManager) {
              router.push('/(manager)/team');
            } else {
              router.push('/workerHomepage');
            }
          } else {
            setError(i18n.t('loginFailed'));  // Handle missing userID in response
          }
        } else {
          setError(result || i18n.t('loginFailed'));
        }
      } catch (error) {
        console.error('Login Failed', error);
        setError(i18n.t('serverError'));
      }
    }
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <Box flex={1} justifyContent="center" alignItems="center" bg={Colors.background} position="relative">
          {/* Top Image */}
          <Image
            source={require('@/assets/images/login-img-top.png')}
            alt="Top Image"
            position="absolute"
            top={0}
            width={Dimensions.get('screen').width}
            height={200}
            resizeMode="contain"
          />

          {/* Bottom Image */}
          <Image
            source={require('@/assets/images/login-img-bottom.png')}
            alt="Bottom Image"
            position="absolute"
            bottom={0}
            width={Dimensions.get('screen').width}
            height={190}
            resizeMode="contain"
          />

          {/* CleanTrack */}
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

            {/* Phone */}
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
                <InputField fontSize="$sm" type='password' placeholder={i18n.t('passwordPlaceholder')}
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

            {/* Login Button */}
            <Button onPress={handleLogin} bg={Colors.text} px={"$7"} mt={"$1.5"} rounded="$xl" alignSelf="center">
              <Text color={Colors.white} fontWeight="bold">{i18n.t('loginButton')}</Text>
            </Button>

            {/* Create Team */}
            <Box alignItems="center" mt="$2">
              <Text fontSize="$sm">{i18n.t('isManager')}</Text>
              <Pressable>
                <Link href="/createTeam">
                  <Text color={Colors.text} fontWeight="bold">{i18n.t('createTeam')}</Text>
                </Link>
              </Pressable>
            </Box>
          </VStack>
        </Box>
      </View>
    </TouchableWithoutFeedback>
  );
}
