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
  Image,
} from '@gluestack-ui/themed';
import { i18n } from '@/hooks/i18n';
import { Link } from 'expo-router';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';  // useRouter ile yönlendirme 

export default function loginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');  // Dil durumu için state
  const router = useRouter();  // useRouter hook'u ile yönlendirme işlemleri

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
          router.push('/workerHomepage');  // Giriş başarılıysa workerHomepage'e yönlendirir
        } else {
          setError(result || i18n.t('loginFailed'));
        }
      } catch (error) {
        console.error('Login Failed');
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
        <Box flex={1} justifyContent="center" alignItems="center" bg="#E0F7FF" position="relative">
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
          <VStack space="xl" w="90%" maxWidth="$80" p="$7" bg="$white" rounded="$2xl" boxShadow="$4" zIndex={1}>
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

              {!!error && !phone.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -16}}>
                  <Text color="$red600" fontSize="$xs">{i18n.t('enterPhone')}</Text>
                </FormControlError>
              )}
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

              {!!error && !password.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -16 }}>
                  <Text color="$red600" fontSize="$xs">{i18n.t('enterPassword')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Giriş Butonu */}
            <Button onPress={handleLogin} bg="$blue600" px={"$7"} mt={"$1.5"} rounded="$xl" alignSelf="center">
              <Text color="$white" fontWeight="bold">{i18n.t('loginButton')}</Text>
            </Button>

            {/* Takım Oluştur */}
            <Box alignItems="center" mt="$2">
              <Text fontSize="$sm">{i18n.t('isManager')}</Text>
              <Pressable>
                <Link href="/createTeam">
                  <Text color="$blue600" fontWeight="bold">{i18n.t('createTeam')}</Text>
                </Link>
              </Pressable>
            </Box>
          </VStack>
        </Box>
      </View>
    </TouchableWithoutFeedback>
  );
}
