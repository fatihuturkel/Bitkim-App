/**
 * Renders the email verification page for the user.
 *
 * This component displays the user's email address and current verification status
 * fetched from the Zustand store (`useUserStore`). It utilizes Firebase Authentication
 * to send a verification email if the user's email is not already verified.
 *
 * Features:
 * - Displays the user's email and verification status using `ListItem` components within an `AppleSection`.
 * - Dynamically adds a "Send" button to the header using `useLayoutEffect` and `navigation.setOptions`.
 *   - The button is only shown if the email is not verified.
 *   - The button text changes to "Sending" and becomes disabled during the email sending process.
 * - Uses `useCallback` to memoize the `handleEmailVerification` function for performance optimization,
 *   preventing unnecessary re-renders related to the header button.
 * - Employs a `ToastNotification` component to provide feedback to the user upon successful
 *   sending of the verification email or in case of an error.
 * - Uses theme colors (`systemGreen`, `systemRed`) to visually indicate the verification status.
 *
 * @component
 * @returns {JSX.Element} The rendered email verification screen.
 */

// External libraries
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { Button, ScrollView, StyleSheet } from "react-native";

// Internal state management
import useUserStore from "@/zustand/userStore";

// Internal components
import ListItem from "@/components/ListItem";
import AppleSection from "@/components/Section";
import { ThemedView } from "@/components/ThemedView";
import ToastNotification from "@/components/ToastNotification";
import { auth } from "@/firebaseConfig";
import { useThemeColor } from "@/hooks/useThemeColor";
import i18n from "@/i18n";
import { sendEmailVerification } from "firebase/auth";

export default function VerifyEmailPage() {
    // Define theme colors
    const systemGreen = useThemeColor({}, 'systemGreen'); // For success messages
    const systemRed = useThemeColor({}, 'systemRed'); // For error messages

    // For header options
    const navigation = useNavigation();

    // Get data from Zustand store to show in the UI
    const activeUserEmail = useUserStore((state) => state.email); // Get the current user's email from Zustand
    const isEmailVerified = useUserStore((state) => state.isEmailVerified); // Get the current user's email verification status from Zustand

    // State for loading indicator
    const [isLoading, setIsLoading] = useState(false);

    // State for toast notification
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

    // Show toast message
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);
    }

    // Dismiss toast message
    const dismissToast = () => {
        setToastVisible(false);
    }

    // Memoize handleEmailVerification with useCallback
    const handleEmailVerification = useCallback(async () => {
        if (auth.currentUser) {
            setIsLoading(true);
            try {
                await sendEmailVerification(auth.currentUser);
                showToast(i18n.t('success.verification_email_sent'), 'success');
            } catch (error) {
                showToast(i18n.t('error.generic_error'), 'error');
            } finally {
                setIsLoading(false);
            }
        }
    }, [showToast]); // Include showToast in the dependency array to ensure it is stable

    // Set header options dynamically
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => {
                // If email is verified, don't render the button
                if (isEmailVerified) {
                    return null;
                }
                // Otherwise, render the button
                return (
                    <Button
                        onPress={handleEmailVerification}
                        title={isLoading ? i18n.t('common.sending') : i18n.t('common.send')}
                        disabled={isLoading} // Disable only if loading
                    />
                );
            },
        });
        // handleEmailVerification is now stable due to useCallback
    }, [navigation, handleEmailVerification, isLoading, isEmailVerified]);

    return (
        <ThemedView style={styles.container}>

            <ToastNotification
                message={toastMessage}
                type={toastType}
                visible={toastVisible}
                onDismiss={dismissToast}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <AppleSection title={i18n.t('auth.email_verification_status_section_title')}>
                    <ListItem
                        label={activeUserEmail}
                        icon={<Ionicons name="mail-outline" />}
                        isLast={true}
                        accessoryType="none"
                        onPress={() => { }}
                    />
                    <ListItem
                        label={isEmailVerified ? i18n.t('auth.verified') : i18n.t('auth.not_verified')}
                        icon={isEmailVerified
                            ? <Ionicons name="checkmark-circle-outline" />
                            : <Ionicons name="close-circle-outline" />}
                        isLast={true}
                        accessoryType="none"
                        onPress={() => { }}
                        labelStyle={{ color: isEmailVerified ? systemGreen : systemRed }}
                    />
                </AppleSection>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    }
});