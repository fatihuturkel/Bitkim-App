import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onDismiss?: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastProps> = ({
  message,
  type = 'success',
  visible,
  onDismiss,
  duration = 3000
}) => {
  const opacity = new Animated.Value(0);
  
  // Configure icon and colors based on toast type
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: '#34C759',
          bgColor: 'rgba(52, 199, 89, 0.1)'
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: '#FF3B30',
          bgColor: 'rgba(255, 59, 48, 0.1)'
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: '#007AFF',
          bgColor: 'rgba(0, 122, 255, 0.1)'
        };
    }
  };
  
  const config = getToastConfig();
  
  // Animation for showing/hiding toast
  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          if (onDismiss) onDismiss();
        });
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);
  
  // Only render if visible
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity,
          backgroundColor: config.bgColor 
        }
      ]}
    >
      <Ionicons name={config.icon} size={22} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={20} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  message: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  }
});

export default ToastNotification;