import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import the hook

// Exclude the original onChangeText from TextInputProps
type OmitOnChangeText = Omit<TextInputProps, 'onChangeText'>;

interface FormItemProps extends OmitOnChangeText {
  id: string;
  label?: string; // Made label optional
  value: string;
  onChangeText: (id: string, text: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  errorMessage?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  showClearButton?: boolean;
  multiline?: boolean;
  maxLength?: number;
}

interface FormInputProps {
  title?: string;
  description?: string;
  formItems: FormItemProps[];
  footerText?: string;
  style?: object;
}

const FormInputField: React.FC<FormInputProps> = ({
  title,
  description,
  formItems,
  footerText,
  style
}) => {
  // --- Get Theme Colors ---
  const backgroundColor = useThemeColor({}, 'mixListItemBackground');
  const textColor = useThemeColor({}, 'label');
  const secondaryTextColor = useThemeColor({}, 'secondaryLabel'); // For title, description, footer
  const placeholderColor = useThemeColor({}, 'placeholderText');
  const separatorColor = useThemeColor({}, 'separator');
  const tintColor = useThemeColor({}, 'systemBlue'); // For interactive elements like the eye icon
  const destructiveColor = useThemeColor({}, 'systemRed'); // For error messages
  const errorBackgroundColor = useThemeColor({ light: 'rgba(255, 59, 48, 0.2)', dark: 'rgba(255, 59, 48, 0.2)' }, 'systemRed'); // Example error background
  const iconColor = useThemeColor({}, 'tertiaryLabel'); // For less prominent icons like clear

  // --- State Management ---
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [passwordVisibility, setPasswordVisibility] = useState<{[key: string]: boolean}>({});

  const togglePasswordVisibility = (id: string) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleClear = (id: string) => {
    const item = formItems.find(item => item.id === id);
    if (item) {
      item.onChangeText(id, '');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Apply secondaryTextColor to title, description, footer */}
      {title && <Text style={[styles.title, { color: secondaryTextColor }]}>{title}</Text>}
      {description && <Text style={[styles.description, { color: secondaryTextColor }]}>{description}</Text>}

      {/* Apply backgroundColor to formContainer */}
      <View style={[styles.formContainer, { backgroundColor: backgroundColor }]}>
        {formItems.map((item, index) => {
          const isLast = index === formItems.length - 1;
          const isFocused = focusedItemId === item.id;
          const isPasswordVisible = passwordVisibility[item.id] || false;
          const shouldBeSecure = item.secureTextEntry && !isPasswordVisible;

          return (
            <View
              key={item.id}
              style={[
                styles.formItemContainer,
                // Apply backgroundColor and errorBackgroundColor
                { backgroundColor: item.errorMessage ? errorBackgroundColor : backgroundColor },
                // Apply separatorColor to border
                !isLast && [styles.borderBottom, { borderBottomColor: separatorColor }],
                isFocused && styles.formItemFocused, // Keep focus style if needed, maybe add themed border?
                // item.errorMessage && styles.formItemError, // Replaced by inline style
                !item.label && styles.formItemContainerNoLabel
              ]}
            >
              {/* Apply textColor to label */}
              {item.label && <Text style={[styles.label, { color: textColor }]}>{item.label}</Text>}
              <View style={[
                styles.inputWrapper,
                item.multiline && styles.multilineWrapper
              ]}>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor }, // Apply textColor to input
                    item.multiline && styles.multilineInput
                  ]}
                  value={item.value}
                  onChangeText={(text) => item.onChangeText(item.id, text)}
                  placeholder={item.placeholder}
                  secureTextEntry={shouldBeSecure}
                  autoCapitalize={item.autoCapitalize || 'none'}
                  keyboardType={item.keyboardType || 'default'}
                  maxLength={item.maxLength}
                  multiline={item.multiline}
                  onFocus={() => setFocusedItemId(item.id)}
                  onBlur={() => setFocusedItemId(null)}
                  placeholderTextColor={placeholderColor} // Apply placeholderColor
                  selectionColor={tintColor} // Apply tintColor for selection
                  {...(Object.keys(item)
                    .filter(key => key !== 'onChangeText' && key !== 'id' && key !== 'label' && key !== 'errorMessage' && key !== 'showClearButton' && key !== 'secureTextEntry')
                    .reduce((obj, key) => ({ ...obj, [key]: item[key as keyof FormItemProps] }), {}))}
                />

                <View style={styles.buttonsContainer}>
                  {item.showClearButton && item.value.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleClear(item.id)}
                      style={styles.iconButton}
                    >
                      {/* Apply iconColor to clear button */}
                      <Ionicons name="close-circle" size={18} color={iconColor} />
                    </TouchableOpacity>
                  )}

                  {item.secureTextEntry && item.value.length > 0 && (
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility(item.id)}
                      style={styles.iconButton}
                    >
                      {/* Apply tintColor to eye icon */}
                      <Ionicons
                        name={isPasswordVisible ? "eye-off" : "eye"}
                        size={20}
                        color={tintColor}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Apply destructiveColor to error message */}
              {item.errorMessage !== '' && (
                <Text style={[styles.errorMessage, { color: destructiveColor }]}>
                  {item.errorMessage}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {footerText && <Text style={[styles.footerText, { color: secondaryTextColor }]}>{footerText}</Text>}
    </View>
  );
};

// --- Update Styles (Remove hardcoded colors where theme colors are applied inline) ---
const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '400',
    // color: '#8A8A8E', // Themed
    marginBottom: 6,
    marginLeft: 16,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    // color: '#8A8A8E', // Themed
    marginBottom: 6,
    marginHorizontal: 16,
  },
  formContainer: {
    // backgroundColor: '#FFFFFF', // Themed
    borderRadius: 10,
    overflow: 'hidden',
    // Shadow might need adjustment for dark mode, consider removing or using platform-specific styles
    shadowColor: '#000', // This might look harsh in dark mode
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1, // Elevation might also need theme adjustment
  },
  formItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    // backgroundColor: '#FFFFFF', // Themed
  },
  formItemContainerNoLabel: {
    paddingVertical: 0, // Keep this adjustment
  },
  formItemFocused: {
    // Consider adding a themed focus indicator, e.g., border color
  },
  formItemError: {
    // backgroundColor: '#FFF5F5', // Themed
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#C6C6C8', // Themed
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    // color: '#000000', // Themed
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  multilineWrapper: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 17,
    // color: '#000000', // Themed
    paddingVertical: 11, // Keep iOS-like padding
    textAlignVertical: 'center',
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: 100, // Keep multiline height
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginLeft: 4,
  },
  errorMessage: {
    fontSize: 13,
    // color: '#FF3B30', // Themed
    marginTop: 4,
  },
  footerText: {
    fontSize: 13,
    // color: '#8A8A8E', // Themed
    marginTop: 6,
    marginHorizontal: 16,
  }
});

export default FormInputField;