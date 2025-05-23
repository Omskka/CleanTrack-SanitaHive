import React from 'react';
import { Box, Text, VStack, Pressable, Center } from '@gluestack-ui/themed';
import { Link } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFoundScreen() {
  // Language context for i18n
  const { language, changeLanguage } = useLanguage();

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header section with title and language toggle */}
      <Box px="$4" py="$6" bg={Colors.white} position="relative">
        {/* Not Found title */}
        <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading}>
          {i18n.t('notFound') || 'Page Not Found'}
        </Text>

        {/* Language Toggle Button in the top right */}
        <Pressable
          position="absolute"
          top={30}
          right={16}
          zIndex={10}
          onPress={() => changeLanguage(language === 'en' ? 'tr' : 'en')}
        >
          <Text fontWeight="$bold" color={Colors.heading}>
            {language === 'en' ? 'TR' : 'EN'}
          </Text>
        </Pressable>
      </Box>

      {/* Main content area */}
      <Center flex={1} px="$4">
        <VStack space="lg" alignItems="center">
          {/* Warning icon */}
          <AlertCircle size={64} color={Colors.error} />

          {/* Not found message */}
          <Text fontSize="$xl" fontWeight="$semibold" color={Colors.heading} textAlign="center">
            {i18n.t('pageNotFound') || 'This is not the page you are looking for.'}
          </Text>

          {/* Button to return to home page */}
          <Box
            bg={Colors.tint}
            px="$4"
            py="$3"
            borderRadius="$lg"
            borderWidth={1}
            borderColor={Colors.text}
          >
            <Link href="/">
              <Text color={Colors.text} fontWeight="$bold">
                {i18n.t('returnHome') || 'Return to Home'}
              </Text>
            </Link>
          </Box>
        </VStack>
      </Center>
    </Box>
  );
}