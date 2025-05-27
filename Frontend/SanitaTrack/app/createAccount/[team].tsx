import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
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
import { i18n } from '@/hooks/i18n';  // For language support
import { Link, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import UUID from 'react-native-uuid';
import { registerUser } from '@/api/apiService';
import axiosInstance from '@/api/axiosInstance'; // Ensure axiosInstance is imported
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateAccount() {
    // State variables for form fields and UI
    const [teamCode, setTeamCode] = useState(''); // Team code entered by user
    const [name, setName] = useState(''); // User's first name
    const [surname, setSurname] = useState(''); // User's last name
    const [phone, setPhone] = useState(''); // User's phone number
    const [password, setPassword] = useState(''); // User's password
    const [error, setError] = useState(''); // Error message to display
    const [loading, setLoading] = useState(false); // Loading state for async actions
    const { language, changeLanguage } = useLanguage(); // Function to change language

    // Main registration handler for the form
    const handleRegister = async () => {
        // Validate all fields before proceeding
        if (!name.trim() || !surname.trim() || !phone.trim() || !password.trim() || !teamCode.trim()) {
            setError(i18n.t('allFieldsRequired'));
            return;
        }

        setLoading(true);

        try {
            // 1. Generate a unique user ID for the new user
            const userId = UUID.v4();

            // 2. Prepare the new user object to send to the backend
            const newUser = {
                userId,
                name: name.trim(),
                surname: surname.trim(),
                phoneNumber: phone.trim(),
                password: password.trim(),
                manager: false, // This is a regular user, not a manager
                lang: language,
            };

            console.log('New user data:', newUser);

            // 3. Register the user in the backend (creates the user)
            const userData = await registerUser(newUser);

            // 4. Fetch the team info using the provided team code
            //    This checks if the team exists and gets its managerId
            const teamResponse = await fetch(`http://10.0.2.2:8080/api/v1/teams/by-teamcode/${teamCode}`);
            const teamData = await teamResponse.json();

            // 5. If the team code is invalid or the team does not have a manager, show an error
            if (!teamResponse.ok || !teamData || !teamData.managerId) {
                setError(i18n.t('invalidTeamCode'));
                setLoading(false);
                return;
            }

            // 6. Add the new user's ID to the employee list of the team
            //    This updates the team by sending the new employeeId to the backend
            const updateResponse = await fetch(
                `http://10.0.2.2:8080/api/v1/teams/add-employee/${teamData.managerId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ employeeId: userId }),
                }
            );

            console.log('Response status:', updateResponse.status);

            // 7. If updating the team fails, show an error
            if (!updateResponse.ok) {
                throw new Error(i18n.t('teamUpdateFailed'));
            }

            console.log('User registered successfully:', userData);

            // 8. Registration successful, clear errors and show success message
            setError('');
            alert(i18n.t('registerSuccess'));

            // 9. Redirect to login page after a short delay
            setTimeout(() => {
                router.push('/');
            }, 100);
        } catch (error: any) {
            // Handle registration errors (e.g., duplicate phone number, network issues)
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
                colors={['#d3ecdc', '#5a855f']}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
                {/* App title/logo at the top */}
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

                {/* Registration Form Area */}
                <Box w="90%" maxWidth="$80" p="$7" bg={Colors.white} rounded="$2xl" boxShadow="$4">
                    {/* Form title */}
                    <Heading size="xl" color={Colors.heading} textAlign="center">
                        {i18n.t('registerTitle')}
                    </Heading>

                    <VStack space="lg" mt="$4">
                        {/* Team Code Field */}
                        <FormControl isInvalid={!!error && !teamCode.trim()}>
                            <FormControlLabel>
                                <Text>{i18n.t('teamCode')}</Text>
                            </FormControlLabel>
                            <Input borderColor={Colors.text}>
                                <InputField
                                    fontSize="$sm"
                                    placeholder={i18n.t('teamCodePlaceholder')}
                                    value={teamCode}
                                    onChangeText={(text) => {
                                        setTeamCode(text);
                                        if (error) setError('');
                                    }}
                                />
                            </Input>
                            {/* Show error if team code is missing */}
                            {!!error && !teamCode.trim() && (
                                <FormControlError style={{ position: 'absolute', bottom: -14 }}>
                                    <Text color={Colors.error} fontSize="$xs">{i18n.t('enterTeamCode')}</Text>
                                </FormControlError>
                            )}
                        </FormControl>

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

                        {/* Phone Field */}
                        <FormControl isInvalid={!!error && !phone.trim()}>
                            <FormControlLabel>
                                <Text>{i18n.t('phoneLabel')}</Text>
                            </FormControlLabel>
                            <Input borderColor={Colors.text}>
                                <InputField
                                    fontSize="$sm"
                                    keyboardType='phone-pad'
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
                                    type='password'
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

                        {/* Register Button */}
                        <Button
                            onPress={handleRegister}
                            bg={Colors.text}
                            mt={"$1.5"}
                            rounded="$xl"
                            alignSelf="center"
                        >
                            <Text color={Colors.white} fontWeight="bold">{i18n.t('registerButton')}</Text>
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