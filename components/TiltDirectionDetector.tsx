// src/components/TiltSequenceGame.tsx

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Vibration, Modal, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const directions = ['Left', 'Right', 'Up', 'Down'] as const;
type Direction = typeof directions[number];

const getRandomDirection = (): Direction => {
    return directions[Math.floor(Math.random() * directions.length)];
};

const softVibration = 100;
const aggressiveVibration = 500;

const TiltSequenceGame: React.FC = () => {
    const [targetSequence, setTargetSequence] = useState<Direction[]>([getRandomDirection()]);
    const [userSequence, setUserSequence] = useState<Direction[]>([]);
    const [displayedDirection, setDisplayedDirection] = useState<Direction | 'None' | 'Correct' | 'Incorrect'>('None');
    const [countdown, setCountdown] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'countdown' | 'sequence' | 'input' | 'result'>('countdown');
    const [lastProcessedDirection, setLastProcessedDirection] = useState<Direction | 'None'>('None');
    const [showInstructions, setShowInstructions] = useState(true); // State for showing the instructions modal
    const [isGameStarted, setIsGameStarted] = useState(false); // State to control when the game starts

    const directionToEmoji = (direction: Direction | 'None' | 'Correct' | 'Incorrect') => {
        switch (direction) {
            case 'Up':
                return '⬆️';
            case 'Down':
                return '⬇️';
            case 'Left':
                return '⬅️';
            case 'Right':
                return '➡️';
            case 'Correct':
                return '✅';
            case 'Incorrect':
                return '❌';
            default:
                return ''; // Empty for 'None'
        }
    };

    useEffect(() => {
        if (!isGameStarted) return;

        Accelerometer.setUpdateInterval(100);
        const subscription = Accelerometer.addListener((data) => {
            const { x, y } = data;

            if (gameState !== 'input') return; // Ignore tilt during countdown/sequence

            let currentDirection: Direction | 'None' = 'None';
            if (x < -0.5) currentDirection = 'Right';
            else if (x > 0.5) currentDirection = 'Left';
            else if (y < -0.5) currentDirection = 'Up';
            else if (y > 0.5) currentDirection = 'Down';

            // Ensure a direction is only processed once until the device returns to neutral
            if (currentDirection !== 'None' && currentDirection !== lastProcessedDirection) {
                handleUserInput(currentDirection);
                setLastProcessedDirection(currentDirection);
            } else if (currentDirection === 'None') {
                setLastProcessedDirection('None'); // Reset when back to neutral
            }
        });

        return () => subscription.remove();
    }, [gameState, userSequence, targetSequence, lastProcessedDirection, isGameStarted]);

    useEffect(() => {
        if (!isGameStarted) return;

        if (gameState === 'countdown') startCountdown();
        else if (gameState === 'sequence') displaySequence();
    }, [gameState, isGameStarted]);

    const startCountdown = async () => {
        const countdownSteps = ["Ready", "Set", "Go"];
        for (let step of countdownSteps) {
            setCountdown(step);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(null);
        setGameState('sequence');
    };

    const displaySequence = async () => {
        for (const direction of targetSequence) {
            setDisplayedDirection(direction);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Show for 1 second
            setDisplayedDirection('None');
            await new Promise((resolve) => setTimeout(resolve, 500)); // Pause between directions
        }
        setGameState('input');
    };

    const handleUserInput = (direction: Direction) => {
        const updatedUserSequence = [...userSequence, direction];

        setUserSequence(updatedUserSequence);

        setDisplayedDirection(direction);
        setTimeout(() => setDisplayedDirection('None'), 500);

        // Check if input matches target sequence so far
        const isCorrectSoFar = updatedUserSequence.every((dir, index) => dir === targetSequence[index]);

        if (!isCorrectSoFar) {
            endRound(false);
            return;
        }

        // If user completes the sequence correctly, end the round
        if (updatedUserSequence.length === targetSequence.length) {
            endRound(true);
        }
    };

    const endRound = (isCorrect: boolean) => {
        setGameState('result');
        setDisplayedDirection(isCorrect ? 'Correct' : 'Incorrect');
        Vibration.vibrate(isCorrect ? softVibration : aggressiveVibration);

        setTimeout(() => {
            if (isCorrect) {
                setScore((prevScore) => prevScore + 1);
                setTargetSequence((prevSequence) => [...prevSequence, getRandomDirection()]);
            } else {
                setScore(0);
                setTargetSequence([getRandomDirection()]);
            }
            setUserSequence([]); // Reset user sequence
            setDisplayedDirection('None');
            setGameState('countdown');
        }, 2000); // Show result for 2 seconds
    };

    return (
        <View style={styles.container}>
            {/* Instructions Modal */}
            <Modal visible={showInstructions} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🌌 How to Play 🌌</Text>
                        <Text style={styles.modalText}>
                            1. Watch the sequence of directions shown on the screen.{"\n"}
                            2. After the sequence, tilt your device in the correct order to match the sequence.{"\n"}
                            3. Return the device to a neutral position (flat) between tilts.{"\n"}
                            4. Try to score as high as possible!
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setShowInstructions(false);
                                setIsGameStarted(true); // Start the game only after the modal is dismissed
                            }}
                        >
                            <Text style={styles.modalButtonText}>🚀 Begin Journey 🚀</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {countdown ? (
                <Text style={styles.countdown}>{countdown}</Text>
            ) : (
                <Text style={styles.emoji}>{directionToEmoji(displayedDirection)}</Text>
            )}
            <Text style={styles.text}>Score: {score}</Text>
            <Button title="Reset Game" onPress={() => {
                setScore(0);
                setTargetSequence([getRandomDirection()]);
                setUserSequence([]);
                setDisplayedDirection('None');
                setGameState('countdown');
            }} />
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
    text: {
        fontSize: 24,
        color: '#80D0C7',
        marginBottom: 20,
        textShadowColor: '#40E0D0',
        textShadowRadius: 10,
    },
    emoji: {
        fontSize: 100,
        textShadowColor: '#ffffff',
        textShadowRadius: 20,
    },
    countdown: {
        fontSize: 50,
        color: '#FFD700',
        marginBottom: 20,
        textShadowColor: '#FFA500',
        textShadowRadius: 15,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContent: {
        backgroundColor: '#1F1B24',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#ffffff',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#40E0D0',
        padding: 10,
        borderRadius: 5,
    },
    modalButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TiltSequenceGame;
