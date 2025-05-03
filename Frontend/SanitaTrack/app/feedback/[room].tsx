import React, { useState } from 'react';
import { Box, Text, Button, VStack, Textarea, HStack, Pressable, TextareaInput } from '@gluestack-ui/themed';
import { Star } from 'lucide-react-native';

const categories = ['Suggestion', 'Smell', 'Equipment', 'Overall'];

export default function FeedbackScreen() {
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // Submit logic here
    console.log({ rating, selectedCategory, feedback });
  };

  return (
    <Box flex={1} p="$4" bg="$backgroundLight0">
      <Text fontSize="$2xl" fontWeight="$bold" mb="$4">
        Feedback
      </Text>

      <Text mb="$2">How would you rate your experience?</Text>
      <HStack space="md" mb="$4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable key={i} onPress={() => setRating(i)}>
            <Star
              size={24}
              color={i <= rating ? '#FFD700' : '#ccc'}
              fill={i <= rating ? '#FFD700' : 'none'}
            />
          </Pressable>
        ))}
      </HStack>

      <Text mb="$2">Select a feedback category:</Text>
      <HStack flexWrap="wrap" space="sm" mb="$4">
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            borderWidth={1}
            borderColor={selectedCategory === cat ? '$primary500' : '$borderLight300'}
            bg={selectedCategory === cat ? '$primary100' : '$backgroundLight0'}
            borderRadius="$md"
            px="$3"
            py="$2"
            mr="$2"
            mb="$2"
          >
            <Text color={selectedCategory === cat ? '$primary700' : '$textLight700'}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </HStack>

      <Textarea minHeight={100} mb="$4">
        <TextareaInput
          value={feedback}
          onChangeText={setFeedback}
          placeholder="Leave your feedback here..."
        />
      </Textarea>

      <Button onPress={handleSubmit}>
        <Text color="white">Submit</Text>
      </Button>
    </Box>
  );
}