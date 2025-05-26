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
import { i18n } from '@/hooks/i18n';
import { Colors } from '@/constants/Colors';
import UUID from 'react-native-uuid';
import { useRoute, RouteProp } from '@react-navigation/native';
import { createFeedback } from '@/api/apiService';
import { useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';

// Feedback categories for selection
const categories = [i18n.t('suggestion'), i18n.t('smell'), i18n.t('equipment'), i18n.t('overall')];

export default function FeedbackScreen() {
  // State for star rating (1 to 5)
  const [rating, setRating] = useState(0);
  // State for selected feedback category
  const [selectedCategory, setSelectedCategory] = useState('');
  // State for feedback text input
  const [feedback, setFeedback] = useState('');
  // Language context for i18n
  const { language, changeLanguage } = useLanguage();

  // Use the useRoute hook to get route parameters, including roomId
  const roomId: any = useLocalSearchParams();
  console.log("roomId :", roomId);

  // Handle feedback form submission
  const handleSubmit = async () => {
    // Ensure roomId is available
    if (!roomId) {
      alert(i18n.t('roomIdError'));
      return;
    }

    // Generate a unique feedback ID
    const feedbackID = UUID.v4();
    // Prepare feedback payload to send to backend
    const payload = {
      feedbackId: feedbackID,
      roomId: roomId.room,  // Room ID from route params
      rating,               // Ensure rating is correctly set
      category: selectedCategory,  // Selected feedback category
      description: feedback,       // Feedback text
      submissionTime: new Date(),  // Current time
    };

    try {
      console.log('Payload:', payload);
      // Call backend API to save feedback
      const updated = await createFeedback(payload);
      console.log('Feedback saved successfully:', updated);
      // Optionally reset the form or show a success message
      alert(i18n.t('feedbackSuccess'));
      // Reset form or navigate to another page if necessary
    } catch (err: any) {
      // Handle errors during feedback submission
      console.error('Error saving feedback:', err);
      alert(`${i18n.t('feedbackError')}: ${err.message}`);
    }
  };

  return (
    <Box flex={1} bg={Colors.background}>
      {/* Header */}
      <Box px="$4" py="$6" bg={Colors.white} position="relative">
        {/* Feedback page title */}
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

      {/* Main Content */}
      <VStack px="$4" py="$4" space="md">
        {/* Star Rating Section */}
        <Box>
          <Text fontSize="$md" fontWeight="$medium" mb="$2" color={Colors.text}>
            {i18n.t('rateExperience')}
          </Text>
          <HStack space="md" mb="$4">
            {/* Render 5 stars for rating */}
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

        {/* Category Selection Section */}
        <Box>
          <Text fontSize="$md" fontWeight="$medium" mb="$2" color={Colors.text}>
            {i18n.t('selectCategory')}
          </Text>
          <HStack flexWrap="wrap" space="sm" mb="$4">
            {/* Render category buttons */}
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                borderWidth={1}
                borderColor={selectedCategory === cat ? Colors.heading : Colors.text}
                bg={selectedCategory === cat ? 	'#d3ecdc' : Colors.white}
                borderRadius="$lg"
                px="$3"
                py="$2"
                mr="$2"
                mb="$2"
              >
                <Text color={selectedCategory === cat ? Colors.heading : Colors.black}>
                  {i18n.t(`${cat.toLocaleLowerCase()}`)}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </Box>

        {/* Feedback Textarea Section */}
        <Box>
          <Text fontSize="$md" fontWeight="$medium" mb="$2" color={Colors.text}>
            {i18n.t('yourFeedback')}
          </Text>
          <Textarea
            minHeight={120}
            mb="$4"
            borderColor={Colors.text}
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

        {/* Submit Button */}
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