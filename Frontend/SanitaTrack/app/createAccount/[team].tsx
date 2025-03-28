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
} from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { i18n } from '@/hooks/i18n';  // Dil desteği için
import { Link } from 'expo-router';

export default function CreateAccount() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en'); 
  const [loading, setLoading] = useState(false);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  const handleRegister = async () => {
    if (!name.trim() || !surname.trim() || !phone.trim() || !password.trim()) {
      setError(i18n.t('allFieldsRequired'));
      return;
    }

    setLoading(true); // Show loading state

    try {
      const response = await fetch('http://10.0.2.2:8080/api/v1/users', {
        method: 'POST', // Sending data via POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          phoneNumber: phone.trim(),
          password: password.trim(),
          isManager: false,
          lang: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User registered successfully:', data);
        setError('');
        alert(i18n.t('registrationSuccess')); // Show success message
      } else {
        console.error('Registration failed:', response.status);
        setError(i18n.t('registrationFailed'));
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
        <LinearGradient
        colors={['#E0F7FF', '#0044CC']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
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

        {/* Form Alanı */}
        <Box w="90%" maxWidth="$80" p="$7" bg="$white" rounded="$2xl" boxShadow="$4">
            <Heading size="xl" color="$blue800" textAlign="center">
            {i18n.t('registerTitle')}
            </Heading>

            <VStack space="lg" mt="$4">
            {/* Ad */}
            <FormControl isInvalid={!!error && !name.trim()}>
                <FormControlLabel>
                <Text>{i18n.t('name')}</Text>
                </FormControlLabel>

                <Input>
                    <InputField fontSize="$sm" placeholder={i18n.t('namePlaceholder')}
                    value={name}
                    onChangeText={(text) => {
                        setName(text);
                        if (error) setError('');
                    }}
                    />
                </Input>

                {!!error && !name.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -16}}>
                    <Text color="$red600" fontSize="$xs">{i18n.t('enterName')}</Text>
                </FormControlError>
                )}
            </FormControl>

            {/* Soyad */}
            <FormControl isInvalid={!!error && !surname.trim()}>
                <FormControlLabel>
                <Text>{i18n.t('surname')}</Text>
                </FormControlLabel>

                <Input> 
                    <InputField fontSize="$sm" placeholder={i18n.t('surnamePlaceholder')} 
                    value={surname} 
                    onChangeText={(text) => {
                        setSurname(text);
                        if (error) setError('');
                    }}
                    />
                </Input>

                {!!error && !surname.trim() && (
                <FormControlError style={{ position: 'absolute', bottom: -16}}>
                    <Text color="$red600" fontSize="$xs">{i18n.t('enterSurname')}</Text>
                </FormControlError>
                )}
            </FormControl>

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
                <FormControlError style={{ position: 'absolute', bottom: -16}}>
                    <Text color="$red600" fontSize="$xs">{i18n.t('enterPassword')}</Text>
                </FormControlError>
                )}
            </FormControl>

            {/* Kayıt Ol Butonu */}
            <Button onPress={handleRegister} bg="$blue600" mt={"$1.5"} rounded="$xl" alignSelf="center">
                <Text color="$white" fontWeight="bold">{i18n.t('registerButton')}</Text>
            </Button>

            {/* Giriş Ekranına Git */}
            <Box alignItems="center">
                <Text fontSize="$sm">{i18n.t('alreadyHaveAccount')}</Text>
                <Pressable>
                    <Link href="/">
                        <Text color="$blue600" fontWeight="bold">{i18n.t('loginHere')}</Text>
                    </Link>
                </Pressable>
            </Box>
            </VStack>
        </Box>
        </LinearGradient>
    </TouchableWithoutFeedback>
  );
}
