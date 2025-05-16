import React, { useState, useEffect } from 'react';
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
import { getCurrentLanguage, i18n } from '@/hooks/i18n';  // For language support
import { Link, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import UUID from 'react-native-uuid';
import { registerUser } from '@/api/apiService';
import axiosInstance from '@/api/axiosInstance'; // Ensure axiosInstance is imported


export default function CreateAccount() {
    const [teamCode, setTeamCode] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [language, setLanguage] = useState(getCurrentLanguage());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Update component when language changes
        setLanguage(getCurrentLanguage());
    }, [language]);

    const changeLanguage = (newLanguage: string) => {
        setLanguage(newLanguage);
        i18n.locale = newLanguage;
    };

    const handleRegister = async () => {
        if (!name.trim() || !surname.trim() || !phone.trim() || !password.trim() || !teamCode.trim()) {
            setError(i18n.t('allFieldsRequired'));
            return;
        }

        setLoading(true);

        try {
            const userId = UUID.v4();

            // 2. Register the user (your registerUser function handles this)
            const newUser = {
                userId,
                name: name.trim(),
                surname: surname.trim(),
                phoneNumber: phone.trim(),
                password: password.trim(),
                isManager: false,
                lang: language,
            };

            const userData = await registerUser(newUser);

            // 1. Fetch the team using the /by-teamcode/{teamCode} endpoint
            const teamResponse = await fetch(`http://10.0.2.2:8080/api/v1/teams/by-teamcode/${teamCode}`);
            const teamData = await teamResponse.json();

            if (!teamResponse.ok || !teamData || !teamData.managerId) {
                setError(i18n.t('invalidTeamCode'));
                setLoading(false);
                return;
            }

            // 3. Update the team: Add the new user's ID to the employeeId array
            const updateResponse = await fetch(`http://10.0.2.2:8080/api/v1/teams/add-employee/${teamData.managerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: userId }),
            });

            console.log('Response status:', updateResponse.status);

            if (!updateResponse.ok) {
                throw new Error(i18n.t('teamUpdateFailed'));
            }

            console.log('User registered successfully:', userData);

            setError('');
            alert(i18n.t('registrationSuccess'));
            setTimeout(() => {
                router.push('/');
            }, 100);
        } catch (error: any) {
            console.error('Error during registration:', error);
            if (error.message?.includes('Phone number already exists')) {
                setError(i18n.t('phoneExists'));
            } else {
                setError(error.message || i18n.t('registrationFailed'));
            }
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
                        {i18n.t('registerTitle')}
                    </Heading>

                    <VStack space="lg" mt="$4">
                        {/* Team Code */}
                        <FormControl isInvalid={!!error && !teamCode.trim()}>
                            <FormControlLabel>
                                <Text>{i18n.t('teamCode')}</Text>
                            </FormControlLabel>

                            <Input>
                                <InputField fontSize="$sm" placeholder={i18n.t('teamCodePlaceholder')}
                                    value={teamCode}
                                    onChangeText={(text) => {
                                        setTeamCode(text);
                                        if (error) setError('');
                                    }}
                                />
                            </Input>

                            {!!error && !teamCode.trim() && (
                                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                                    <Text color={Colors.error} fontSize="$xs">{i18n.t('enterTeamCode')}</Text>
                                </FormControlError>
                            )}
                        </FormControl>
                        {/* Name */}
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
                                <InputField fontSize="$sm" placeholder={i18n.t('surnamePlaceholder')}
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

                        {/* Register Button */}
                        <Button onPress={handleRegister} bg={Colors.text} mt={"$1.5"} rounded="$xl" alignSelf="center">
                            <Text color={Colors.white} fontWeight="bold">{i18n.t('registerButton')}</Text>
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
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}
