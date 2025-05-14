import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  Textarea,
  HStack,
  Pressable,
  TextareaInput
} from '@gluestack-ui/themed';
import { Star } from 'lucide-react-native';
import { i18n, getCurrentLanguage } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';

const categories = ['suggestion', 'smell', 'equipment', 'overall'];

export default function FeedbackScreen() {
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedback, setFeedback] = useState('');
  const [language, setLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    // Update component when language changes
    setLanguage(getCurrentLanguage());
  }, [language]);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.locale = newLanguage;
  };

  const handleSubmit = () => {
    // Submit logic here
    console.log({ rating, selectedCategory, feedback });
  };

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header */}
      <Box px="$4" py="$6" bg={Colors.white} position="relative">
        <Text fontSize="$2xl" fontWeight="$bold" color={Colors.heading}>
          {i18n.t('feedbackTitle')}
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
      <VStack px="$4" py="$4" space="md">
        <Box>
          <Text fontSize="$md" fontWeight="$medium" mb="$2" color={Colors.text}>
            {i18n.t('rateExperience')}
          </Text>
          <HStack space="md" mb="$4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => setRating(i)}>
                <Star
                  size={24}
                  color={i <= rating ? Colors.text : Colors.gray}
                  fill={i <= rating ? Colors.text : 'none'}
                />
              </Pressable>
            ))}
          </HStack>
        </Box>

        <Box>
          <Text fontSize="$md" fontWeight="$medium" mb="$2" color={Colors.text}>
            {i18n.t('selectCategory')}
          </Text>
          <HStack flexWrap="wrap" space="sm" mb="$4">
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                borderWidth={1}
                borderColor={selectedCategory === cat ? Colors.text : Colors.gray}
                bg={selectedCategory === cat ? Colors.tint : Colors.white}
                borderRadius="$lg"
                px="$3"
                py="$2"
                mr="$2"
                mb="$2"
              >
                <Text color={selectedCategory === cat ? Colors.text : Colors.black}>
                  {i18n.t(`category.${cat}`)}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        <Box>
          <Text fontSize="$md" fontWeight="$medium" mb="$2" color={Colors.text}>
            {i18n.t('yourFeedback')}
          </Text>
          <Textarea 
            minHeight={120} 
            mb="$4"
            borderColor={Colors.gray}
            borderRadius="$lg"
            bgColor={Colors.white}
          >
            <TextareaInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder={i18n.t('feedbackPlaceholder')}
              color={Colors.black}
            />
          </Textarea>
        </Box>

        <Button 
          onPress={handleSubmit}
          bg={Colors.text}
          rounded="$lg"
        >
          <Text color={Colors.white} fontWeight="bold">{i18n.t('submit')}</Text>
        </Button>
      </VStack>
    </Box>
  );
}