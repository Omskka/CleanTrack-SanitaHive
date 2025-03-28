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
import { i18n } from '@/hooks/i18n';  // Dil desteği için
import { Link } from 'expo-router';

export default function CreateTeam() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  const handleCreateTeam = () => {
    if (!name.trim() || !surname.trim() || !teamName.trim() || !phone.trim() || !password.trim()) {
      setError(i18n.t('allFieldsRequired'));
    } else {
      setError('');
      console.log('Team created!');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#E0F7FF'
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
          resizeMode="cover" // Resmi ekrana sığdırırken orantısını koruyarak genişlet
          zIndex={-1}
        />

        {/* Team Create Title */}
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
            {i18n.t('createTeamTitle')}
          </Heading>

          <VStack space="lg" mt="$4">
            {/* Ad */}
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
                <FormControlError style={{ position: 'absolute', bottom: -16}}>
                  <Text color="$red600" fontSize="$xs">{i18n.t('enterSurname')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Kurum Adı */}
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
                <FormControlError style={{ position: 'absolute', bottom: -16}}>
                  <Text color="$red600" fontSize="$xs">{i18n.t('enterCompanyName')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Telefon */}
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
                <FormControlError style={{ position: 'absolute', bottom: -16}}>
                  <Text color="$red600" fontSize="$xs">{i18n.t('enterPassword')}</Text>
                </FormControlError>
              )}
            </FormControl>

            {/* Team Oluştur Butonu */}
            <Button onPress={handleCreateTeam} bg="$blue600" mt={"$1.5"} rounded="$xl" alignSelf="center">
              <Text color="$white" fontWeight="bold">{i18n.t('createTeamButton')}</Text>
            </Button>

            {/* Login Sayfasına Git */}
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
      </View>
    </TouchableWithoutFeedback>
  );
}
