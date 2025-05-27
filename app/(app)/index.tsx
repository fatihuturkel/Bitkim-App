import { router } from 'expo-router';
import { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function AppIndex() {
  // Function to navigate to the home page
  const goToHome = () => {
    router.replace('/(app)/(home)'); // Update the path to match your folder structure
  };

  // Run the goToHome function once when component mounts
  useEffect(() => {
    goToHome();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops! Something went wrong. Please try again.</Text>
      <Button title="Go to Home" onPress={goToHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});