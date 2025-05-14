import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Pressable, Center } from '@gluestack-ui/themed';
import { Link } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { i18n, getCurrentLanguage } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  const [language, setLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    // Update component when language changes
    setLanguage(getCurrentLanguage());
  }, [language]);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header */}
      <Box px="$4" py="$6" bg={Colors.white} position="relative">
        <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading}>
          {i18n.t('notFound') || 'Page Not Found'}
        </Text>
        
        {/* Language Toggle Button */}
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

      {/* Content */}
      <Center flex={1} px="$4">
        <VStack space="lg" alignItems="center">
          <AlertCircle size={64} color={Colors.error} />
          
          <Text fontSize="$xl" fontWeight="$semibold" color={Colors.heading} textAlign="center">
            {i18n.t('pageNotFound') || 'This is not the page you are looking for.'}
          </Text>
          
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
