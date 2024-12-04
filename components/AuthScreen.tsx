import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as Google from 'expo-google-sign-in';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/components/Firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';


const AuthScreen = ({ onAuthComplete }: { onAuthComplete: () => void }) => {
    const [username, setUsername] = useState('');
    const [isUsernameScreen, setIsUsernameScreen] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '917227234737-p7bgr45okt4vkk3ruq6qdtkv2fid0atl.apps.googleusercontent.com'
        });
    }, []);



    const signInWithGoogle = async () => {
        try {
            const { type, user } = await Google.signInAsync();

            if (type === 'success') {
                if (user?.auth?.idToken) {  // Check if idToken exists
                    // Get Google credential
                    const googleCredential = GoogleAuthProvider.credential(user.auth.idToken);

                    // Sign in with Firebase
                    const userCredential = await signInWithCredential(auth, googleCredential);

                    // Check if user exists in Firestore
                    const userDocRef = doc(db, 'users', userCredential.user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        console.log('User already exists:', userDoc.data());
                        onAuthComplete(); // Proceed to the main app
                    } else {
                        console.log('New user. Redirecting to username screen.');
                        setIsUsernameScreen(true); // Show username input screen for new users
                    }
                } else {
                    console.error('No idToken available from Google sign-in');
                }
            } else {
                console.log('Google sign-in failed or was canceled');
            }
        } catch (error) {
            console.error('Error during Google sign-in:', error);
        }
    };

    const saveUsername = async () => {
        if (!username.trim()) {
            alert('Please enter a username');
            return;
        }

        try {
            const userDocRef = doc(db, 'users', auth.currentUser?.uid!);
            await setDoc(userDocRef, { username }, { merge: true });
            console.log('Username saved successfully');
            setIsUsernameScreen(false); // Hide username input screen
            onAuthComplete(); // Proceed to the main app
        } catch (error) {
            console.error('Error saving username:', error);
        }
    };

    if (isUsernameScreen) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Choose a Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a username"
                    placeholderTextColor="#AAAAAA"
                    value={username}
                    onChangeText={setUsername}
                />
                <TouchableOpacity style={styles.button} onPress={saveUsername}>
                    <Text style={styles.buttonText}>Save Username</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to the App</Text>
            <TouchableOpacity style={styles.button} onPress={signInWithGoogle}>
                <Text style={styles.buttonText}>Sign in with Google</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0d1117',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: '#FFD700',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        color: '#ffffff',
        marginBottom: 20,
        backgroundColor: '#1F1B24',
    },
    button: {
        backgroundColor: '#40E0D0',
        padding: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AuthScreen;
