import Button from '@/components/Button';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor'; // Added import
import i18n from '@/i18n'; // Added import
import { generateAIResponse } from '@/services/openaiService';
import { useImageSelectionStore } from '@/zustand/imageSelectionStore'; // Add this import
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Removed useRoute and RouteProp
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'; // Add useLayoutEffect
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

// Define ChatMessage type for the OpenAI API
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string | { type: string; text?: string; image_url?: { url: string } }[];
};

// UI Message type for rendering messages in chat
type Message = {
  id: string;
  text: string;
  imageUri?: string;
  timestamp: Date;
  isUser: boolean;
};

// Remove the route param type definition as we're not using route params anymore

export default function ChatScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Remove route and replace with Zustand store
  const storeSelectedImageUris = useImageSelectionStore((state) => state.selectedImageUris);
  const clearSelectedImages = useImageSelectionStore((state) => state.clearSelectedImages);
  const navigation = useNavigation<any>(); // Using any for now to allow setParams

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'mixSystemBackground');
  const primaryTextColor = useThemeColor({}, 'label');
  const secondaryTextColor = useThemeColor({}, 'secondaryLabel');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryLabel');
  const placeholderColor = useThemeColor({}, 'placeholderText');
  const tintColor = useThemeColor({}, 'tint');
  const systemBlueColor = useThemeColor({}, 'systemBlue');
  const botMessageBackgroundColor = useThemeColor({}, 'tertiarySystemBackground'); // Or systemGray5
  const userMessageBackgroundColor = systemBlueColor; // Or tintColor
  const separatorColor = useThemeColor({}, 'separator');
  const systemBackgroundColor = useThemeColor({}, 'systemBackground');
  const iconButtonColor = systemBlueColor; // Or tintColor
  const sendButtonIconColor = '#FFFFFF'; // Explicit white for icon on blue background
  const userMessageTextColor = '#FFFFFF'; // Explicit white for text on blue background
  const systemGrayColor = useThemeColor({}, 'systemGray4'); // Added system gray


  // Replace useFocusEffect with useLayoutEffect for immediate execution
  useLayoutEffect(() => {
    const parentNavigator = navigation.getParent();
    if (parentNavigator) {
      // Hide the tab bar immediately
      parentNavigator.setOptions({
        tabBarStyle: { display: 'none' },
      });
    }
  }, [navigation]);

  // Keep useFocusEffect only for cleanup when leaving the screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Restore the tab bar when the screen is unfocused
        const parentNavigator = navigation.getParent();
        if (parentNavigator) {
          parentNavigator.setOptions({
            tabBarStyle: undefined,
          });
        }
      };
    }, [navigation])
  );

  // Replace route params effect with Zustand store effect
  useEffect(() => {
    if (storeSelectedImageUris.length > 0) {
      // Use the first selected image from the store
      setSelectedImage(storeSelectedImageUris[0]);
      
      // Optionally clear the store after getting the image
      // clearSelectedImages();
    }
  }, [storeSelectedImageUris]);

  // Add this function to your ChatScreen component
  const imageToBase64 = async (uri: string): Promise<string> => {
    try {
      // Fetch the image as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a FileReader to read the blob as base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // The result is a data URL like "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
          // We only need the base64 part
          const base64 = reader.result?.toString().split(',')[1];
          resolve(base64 || '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const handleClearChat = () => {
    setIsMenuVisible(false); // Close menu
    setInputText(''); // Clear input text
    setSelectedImage(null); // Clear selected image
    
    if (messages.length === 0) return;

    if (Platform.OS === 'web') {
      // For web platform, use browser's confirm dialog
      const confirmed = window.confirm(i18n.t('chat.clear_chat_confirm_message'));
      if (confirmed) {
        setMessages([]);
        setChatHistory([]); // Clear chat history as well
        console.log('Chat cleared (web)');
      }
    } else {
      // For native platforms (iOS, Android), use React Native Alert
      Alert.alert(
        i18n.t('chat.clear_chat_confirm_title'),
        i18n.t('chat.clear_chat_confirm_message'),
        [
          {
            text: i18n.t('common.cancel'),
            style: "cancel"
          },
          {
            text: i18n.t('common.clear'),
            onPress: () => {
              setMessages([]);
              setChatHistory([]); // Clear chat history as well
              console.log('Chat cleared (native)');
            },
            style: "destructive"
          }
        ]
      );
    }
  };

  const openSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
      Alert.alert(i18n.t('chat.error_opening_settings'), i18n.t('chat.error_opening_settings_message'));
    }
  };

  const pickImage = async () => {
    // Launch image picker - permissions will be handled by launchImageLibraryAsync if needed
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      aspect: [1, 1],
      quality: 1,
      allowsMultipleSelection: true
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri); // Continues to use the first selected image
    }
  };

  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      console.log('Camera permission needed');
      Alert.alert(
        i18n.t('chat.permission_needed_title'),
        i18n.t('chat.permission_needed_message'),
        [
          { text: i18n.t('common.cancel'), style: 'cancel' },
          { text: i18n.t('chat.open_settings'), onPress: openSettings }
        ]
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleSend = async () => {
    if (inputText.trim() === '') {
      Alert.alert(i18n.t('chat.empty_message_error_title'), i18n.t('chat.empty_message_error_message'));
      console.error('Empty message: User tried to send an empty message');
      return;
    }
    setIsMenuVisible(false); // Close menu

    // Create a new message for UI
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      imageUri: selectedImage || undefined,
      timestamp: new Date(),
      isUser: true
    };

    // Add user message to chat UI
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Create appropriate user message for the API chat history
    let userChatMessage: ChatMessage;

    // Always use content array format for API consistency
    if (selectedImage) {
      // For mobile platforms, convert image to base64
      if (Platform.OS !== 'web') {
        try {
          const base64Image = await imageToBase64(selectedImage);
          userChatMessage = {
            role: 'user',
            content: [
              { type: "text", text: inputText },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          };
        } catch (error) {
          console.error('Error processing image:', error);
          // Fallback to text-only if image processing fails
          userChatMessage = {
            role: 'user',
            content: [
              { type: "text", text: inputText + " " + i18n.t('chat.image_upload_failed_suffix') }
            ],
          };
        }
      } else {
        // Web - use the URL directly
        userChatMessage = {
          role: 'user',
          content: [
            { type: "text", text: inputText },
            {
              type: "image_url",
              image_url: {
                url: selectedImage,
              },
            },
          ],
        };
      }
    } else {
      // Text-only message but still using the array format with type
      userChatMessage = {
        role: 'user',
        content: [
          { type: "text", text: inputText }
        ],
      };
    }

    // Create a copy of the chat history with the new message
    const updatedChatHistory = [...chatHistory, userChatMessage];
    setChatHistory(updatedChatHistory);

    // Clear input and image
    setInputText('');
    setSelectedImage(null);

    // Set loading state
    setIsLoading(true);

    try {
      // Generate AI response with full conversation history
      const aiResponse = await generateAIResponse(
        inputText,
        newMessage.imageUri,
        updatedChatHistory // Pass the updated chat history
      );

      // Add AI response to UI messages
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        timestamp: new Date(),
        isUser: false
      };

      setMessages((prevMessages) => [...prevMessages, responseMessage]);

      // Add AI response to chat history with consistent format
      const assistantChatMessage: ChatMessage = {
        role: 'assistant',
        content: [
          { type: "text", text: aiResponse }
        ],
      };

      setChatHistory((prevHistory) => [...prevHistory, assistantChatMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: i18n.t('chat.ai_response_error'),
        timestamp: new Date(),
        isUser: false
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage, item.isUser ? { backgroundColor: userMessageBackgroundColor } : { backgroundColor: botMessageBackgroundColor }]}>
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
      )}
      {item.text ? <Text style={item.isUser ? [styles.userMessageText, { color: userMessageTextColor }] : [styles.messageText, { color: primaryTextColor }]}>{item.text}</Text> : null}
      <Text style={[styles.timestamp, { color: item.isUser ? userMessageTextColor + '99' : secondaryTextColor }]}>{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { marginBottom: tabBarHeight, backgroundColor: themedBackgroundColor }]}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.innerContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: primaryTextColor }]}>{/* Add a title like "Chat" here if desired */}</Text>
            <Button
              onPress={handleClearChat}
              title={i18n.t('chat.clear_chat_button')} // Or remove title if icon is enough
              icon={<Ionicons name="trash-outline" size={22} />} // iOS blue icon
              buttonStyle='gray'
            />
          </View>

          <FlatList
            style={styles.chatList}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted={false}
            contentContainerStyle={styles.chatListContent}
            key={`messages-${messages.length}`}
            ListEmptyComponent={() => (
              <View style={styles.emptyChat}>
                <Text style={[styles.emptyChatText, { color: placeholderColor }]}>{i18n.t('chat.empty_chat_placeholder')}</Text>
              </View>
            )}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={tintColor} />
              <Text style={[styles.loadingText, { color: tintColor }]}>{i18n.t('chat.ai_thinking')}</Text>
            </View>
          )}

          <View style={[styles.inputContainer, { borderTopColor: separatorColor, backgroundColor: themedBackgroundColor }]}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
                <Button
                  onPress={() => setSelectedImage(null)}
                  icon={<Ionicons name="close-outline" size={35} />}
                  buttonStyle='plain'
                  role='destructive' // Optional role for the button
                  style={styles.closeButton} // Apply the new style here
                />
              </View>
            ) : null}

            <View style={styles.messagingControls}>
              <View style={{ position: 'relative' }}>
                <Button
                  onPress={toggleMenu}
                  icon={<Ionicons name="add-outline" size={20} />} // Changed icon and color
                  buttonStyle='gray'
                />

                {isMenuVisible && (
                  <View style={[styles.menuContainer, { backgroundColor: systemBackgroundColor, shadowColor: primaryTextColor, borderColor: systemGrayColor }]}>
                    <Button
                      onPress={() => {
                        takePhoto();
                        setIsMenuVisible(false);
                      }}
                      title={i18n.t('chat.take_photo')}
                      icon={<Ionicons name="camera-outline" size={20} />} // iOS blue icon
                      style={{ ...styles.menuButton, borderBottomColor: separatorColor }}
                      textStyle={{ ...styles.menuButtonText, color: primaryTextColor }} // Text color defined in menuButtonText
                    />
                    <Button
                      onPress={() => {
                        pickImage();
                        setIsMenuVisible(false);
                      }}
                      title={i18n.t('chat.pick_from_gallery')}
                      icon={<Ionicons name="image-outline" size={22} />} // iOS blue icon
                      style={{ ...styles.menuButton, borderBottomColor: separatorColor }} // Apply to the last one or conditionally if it's not the last
                      textStyle={{ ...styles.menuButtonText, color: primaryTextColor }} // Text color defined in menuButtonText
                    />
                  </View>
                )}
              </View>

              <TextInput
                style={[styles.textInput, { backgroundColor: systemBackgroundColor, color: primaryTextColor, borderColor: systemGrayColor }]}
                value={inputText}
                onChangeText={(text) => {
                  setInputText(text);
                  if (isMenuVisible) {
                    setIsMenuVisible(false); // Close menu on text input
                  }
                }}
                placeholder={i18n.t('chat.input_placeholder')}
                placeholderTextColor={placeholderColor}
                multiline
              />

              <Button
                onPress={handleSend}
                icon={<Ionicons name="arrow-up-outline" size={20} />} // iOS-like send icon (filled)
                disabled={isLoading}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16, // Adjusted horizontal padding
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align title and button
    alignItems: 'center',
  },
  header: { // Style for a potential header title
    fontSize: 17,
    fontWeight: '600', // iOS title weight
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20, // More rounded bubbles
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginRight: 8, // Margin from the edge
  },
  botMessage: {
    alignSelf: 'flex-start',
    marginLeft: 8, // Margin from the edge
  },
  userMessageText: { // Specific style for user message text
    fontSize: 17,
  },
  messageText: { // Default for bot messages
    fontSize: 17,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 18, // Slightly less than bubble or same
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  inputContainer: {
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1, // Thinner border for iOS
    padding:8,
    paddingBottom: 16
  },
  selectedImageContainer: {
    marginBottom: 10,
    position: 'relative', // Ensures the absolute positioning of children is relative to this container
    alignSelf: 'flex-start', // Keeps the container wrapped around the image
  }, 
  selectedImagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  closeButton: { // New style for the close button
    position: 'absolute',
    top: -28, // Moves the button up, so its center aligns with the top edge of the image
    right: -35, // Moves the button right, so its center aligns with the right edge of the image
  },
  // iconButtonText is removed as color is set directly in icon prop
  messagingControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1, // Changed from 0 to 1
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 17,
    maxHeight: 120,
    marginHorizontal: 8, // Margin between elements
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  emptyChatText: {
    fontSize: 17,
    textAlign: 'center',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 50, // Adjusted to ensure it's above the icon button with border
    left: 0,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 5,
    elevation: 3, // Softer elevation for Android
    width: 180, // Adjusted width
    zIndex: 1000,
    borderWidth: 1,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 14, // Adjusted padding
    backgroundColor: 'transparent',
    marginTop: 0,
    width: '100%',
    justifyContent: 'flex-start',
    borderBottomWidth: 1, // Add a separator line between menu items
  },
  menuButtonText: {
    marginLeft: 12, // Space between icon and text
    fontSize: 17,
  },
});