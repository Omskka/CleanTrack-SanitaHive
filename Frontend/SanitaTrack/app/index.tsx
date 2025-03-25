import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
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
  FormControlHelper,
  Image,
  Select,
  SelectItem
} from '@gluestack-ui/themed';
import { i18n } from '@/hooks/i18n';
import { Link } from 'expo-router';
import { Dimensions } from 'react-native';

export default function loginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState('en');  // Dil durumu için state

  const handleLogin = async () => {
    // trim() boşlukları temizlemek için (güvenli doğrulama)
    if (!phone.trim()) {
      setError(i18n.t('enterPhone'));
    } else if (!password.trim()) {
      setError(i18n.t('enterPassword'));
    } else {
      setError('');
      try {
        const response = await fetch('http://10.0.2.2:8080/api/v1/users', {
          method: 'POST', // Sending data via POST method
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phone, // Sending phone number
            password: password, // Sending password
            name: "null", // Sending user name
            manager: false, // Sending manager status (true or false)
            lang: "en", // Sending language (e.g., 'en', 'tr', etc.)
          }),
        });

        const result = await response.json();
        console.log('Response:', result); // This will show the response from the backend

        if (response.ok) {
          setIsLoggedIn(true); // Giriş başarılıysa durumu değiştir
        } else {
          setError(result.message || i18n.t('loginFailed'));
        }
      } catch (error) {
        console.error('Login Error:', error); // Log the error for debugging
        setError(i18n.t('serverError'));
      }
    }
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage); // Dil değişikliği
    i18n.locale = newLanguage; // i18n dilini güncelle
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <Box flex={1} justifyContent="center" alignItems="center" bg="$blue100" position="relative">
          {/* Üst Görsel */}
          <Image
            source={require('@/assets/images/login-img-top.png')}
            alt="Top Image"
            position="absolute"
            top={0}
            width={Dimensions.get('screen').width}
            height={200}
            resizeMode="contain"
          />

          {/* Alt Görsel */}
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
            color="$blue600"
            fontWeight="bold"
            top="$16"
            left="$4"
            position="absolute"
            zIndex={1}
          >
            CleanTrack
          </Text>

          {/* Dil Seçimi Butonu */}
          <Pressable
            position="absolute"
            top="$16"
            right="$6"
            onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}
            zIndex={2}
          >
            <Text color="$blue600" fontWeight="bold">
              {language === 'en' ? 'TR' : 'EN'}
            </Text>
          </Pressable>

          {/* Login Form */}
          <VStack space="xl" w="90%" maxWidth="$96" px="$10" py="$16" bg="$white" rounded="$2xl" boxShadow="$4" zIndex={1}>
            <Heading size="xl" color="$blue800" textAlign="center">
              {i18n.t('loginTitle')}
            </Heading>

            {/* Telefon */}
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

              {!!error && !phone.trim() ? (
                <FormControlError>
                  <Text color="$red600" fontSize="$sm">{i18n.t('enterPhone')}</Text>
                </FormControlError>
              ) : null}
            </FormControl>

            {/* Şifre */}
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

              {!!error && !password.trim() ? (
                <FormControlError>
                  <Text color="$red600" fontSize="$sm">{i18n.t('enterPassword')}</Text>
                </FormControlError>
              ) : null}
            </FormControl>

            {/* Giriş Butonu */}
            <Button onPress={handleLogin} bg="$blue600" px={"$7"} rounded="$xl" alignSelf="center">
              <Text color="$white" fontWeight="bold">{i18n.t('loginButton')}</Text>
            </Button>

            {/* Giriş Başarılıysa Worker Homepage'e yönlendirme */}
            {isLoggedIn && (
              <Link href="/workerHomepage">
                <Pressable>
                  <Text color="$blue600" fontWeight="bold" textAlign="center" mt="$2">
                    {i18n.t('continue')}
                  </Text>
                </Pressable>
              </Link>
            )}

            {/* Hesabın yok mu */}
            <Box alignItems="center" mt="$2">
              <Text fontSize="$sm">{i18n.t('isManager')}</Text>
              <Link href="/createAccount/melike">
                <Pressable>
                  <Text color="$blue600" fontWeight="bold">{i18n.t('createTeam')}</Text>
                </Pressable>
              </Link>
            </Box>
          </VStack>
        </Box>
      </View>
    </TouchableWithoutFeedback>
  );
}
