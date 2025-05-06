import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define the structure for each option
type OptionType = {
  label: string;
  value: string;
};

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: OptionType[]; // Use the OptionType here
  selectedOption: string; // This will store the 'value' of the selected option
  onSelect: (value: string) => void; // This callback receives the 'value'
};

const CustomModal = ({
  visible,
  onClose,
  title,
  options,
  selectedOption, // This is the selected value ('en', 'es', etc.)
  onSelect,
}: CustomModalProps) => {
  // Theme colors
  const secondaryBackground = useThemeColor({}, 'secondarySystemBackground');
  const tertiaryBackground = useThemeColor({}, 'tertiarySystemBackground');
  const labelColor = useThemeColor({}, 'label');
  const tintColor = useThemeColor({}, 'tint');
  const separatorColor = useThemeColor({}, 'separator');

  // State to control the background visibility
  const [showBackground, setShowBackground] = useState(visible);

  useEffect(() => {
    // Show background immediately when modal opens
    if (visible) {
      setShowBackground(true);
    }
    // Hide background immediately when modal closes
    else {
      setShowBackground(false);
    }
  }, [visible]);

  const handleClose = () => {
    // Hide background immediately when closing
    setShowBackground(false);
    onClose();
  };

  return (
    <>
      {/* Instant background overlay */}
      {showBackground && (
        <View style={styles.backgroundOverlay} />
      )}

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: secondaryBackground }]}>
            <Text style={[styles.modalTitle, { color: labelColor }]}>{title}</Text>

            <ScrollView style={styles.optionsList}>
              {options.map((option) => ( // Iterate over the array of objects
                <TouchableOpacity
                  key={option.value} // Use the unique value as the key
                  style={[
                    styles.optionItem,
                    { borderBottomColor: separatorColor },
                    // Compare selectedOption (value) with the current option's value
                    selectedOption === option.value && [styles.selectedOption, { backgroundColor: tertiaryBackground }]
                  ]}
                  onPress={() => {
                    onSelect(option.value); // Pass the value back on selection
                    handleClose();
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: labelColor },
                    // Compare selectedOption (value) with the current option's value for text color
                    selectedOption === option.value && { color: tintColor }
                  ]}>
                    {option.label} {/* Display the label */}
                  </Text>
                  {/* Compare selectedOption (value) with the current option's value for checkmark */}
                  {selectedOption === option.value && (
                    <Ionicons name="checkmark" size={22} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: tintColor }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ... existing styles ...
const styles = StyleSheet.create({
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    // Removed background color from here as it's now handled by backgroundOverlay
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  selectedOption: {
    // Background color provided inline
  },
  optionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
    padding: 15,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default CustomModal;