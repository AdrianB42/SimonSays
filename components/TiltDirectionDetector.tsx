// src/components/TiltSequenceGame.tsx

import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Vibration } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const directions = ['Left', 'Right', 'Up', 'Down'] as const;
type Direction = typeof directions[number];

const getRandomDirection = (): Direction => {
    return directions[Math.floor(Math.random() * directions.length)];
};
saxd
const softVibration = 100;
const aggressiveVibration = 500;

const TiltSequenceGame: React.FC = () => {
    const [targetSequence, setTargetSequence] = useState<Direction[]>([getRandomDirection()]);
    const [userSequence, setUserSequence] = useState<Direction[]>([]);
    const [displayedDirection, setDisplayedDirection] = useState<Direction | 'None' | 'Correct' | 'Incorrect'>('None');
    const [tiltDirection, setTiltDirection] = useState<Direction | 'None'>('None');
    const [countdown, setCountdown] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [awaitingNoDirection, setAwaitingNoDirection] = useState(false);
    const [showSequence, setShowSequence] = useState(true);

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
        Accelerometer.setUpdateInterval(100);
        const subscription = Accelerometer.addListener((data) => {
            const { x, y } = data;

            let currentDirection: Direction | 'None' = 'None';
            if (x < -0.5) currentDirection = 'Right';
            else if (x > 0.5) currentDirection = 'Left';
            else if (y < -0.5) currentDirection = 'Up';
            else if (y > 0.5) currentDirection = 'Down';

            if (!awaitingNoDirection) {
                setTiltDirection(currentDirection);
                if (currentDirection !== 'None') handleUserInput(currentDirection);
            }

            if (currentDirection === 'None' && awaitingNoDirection) {
                setAwaitingNoDirection(false);
            }
        });

        return () => subscription && subscription.remove();
    }, [awaitingNoDirection]);

    useEffect(() => {
        if (showSequence) {
            startCountdown();
        }
    }, [showSequence]);

    const startCountdown = async () => {
        const countdownSteps = ["Ready", "Set", "Go"];
        for (let step of countdownSteps) {
            setCountdown(step);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second per countdown step
        }
        setCountdown(null);
        displaySequence();
    };

    const displaySequence = async () => {
        for (const direction of targetSequence) {
            setDisplayedDirection(direction);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Show each direction for 1 second
            setDisplayedDirection('None');
            await new Promise((resolve) => setTimeout(resolve, 500)); // Pause between directions
        }
        setShowSequence(false);
    };

    const handleUserInput = (direction: Direction) => {
        const updatedUserSequence = [...userSequence, direction];
        setUserSequence(updatedUserSequence);

        // Show the direction user just entered
        setDisplayedDirection(direction);

        // Hide the emoji after 0.5 seconds
        setTimeout(() => {
            setDisplayedDirection('None');
        }, 500);

        if (updatedUserSequence[updatedUserSequence.length - 1] !== targetSequence[updatedUserSequence.length - 1]) {
            endRound(false);
        } else if (updatedUserSequence.length === targetSequence.length) {
            endRound(true);
        }

        setAwaitingNoDirection(true);
    };

    const endRound = (isCorrect: boolean) => {
        if (isCorrect) {
            Vibration.vibrate(softVibration);
            setScore(score + 1);
            setDisplayedDirection("Correct");

            // Wait for 2 seconds before proceeding to the next round
            setTimeout(() => {
                setTargetSequence([...targetSequence, getRandomDirection()]); // Add a new direction for the next round
                setUserSequence([]);
                setShowSequence(true);
            }, 1000); // Display the 'Correct' emoji for 2 seconds
        } else {
            Vibration.vibrate(aggressiveVibration);
            setDisplayedDirection("Incorrect");

            // Wait for 2 seconds before resetting the game
            setTimeout(() => {
                setScore(0);
                setTargetSequence([getRandomDirection()]); // Restart with a single direction
                setUserSequence([]);
                setShowSequence(true);
            }, 1000); // Display the 'Incorrect' emoji for 2 seconds
        }
    };

    return (
        <View style={styles.container}>
            {countdown ? (
                <Text style={styles.countdown}>{countdown}</Text>
            ) : (
                <Text style={styles.emoji}>{directionToEmoji(displayedDirection)}</Text>
            )}
            <Text style={styles.text}>Score: {score}</Text>
            <Button title="Reset Game" onPress={() => endRound(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    text: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
    },
    emoji: {
        fontSize: 100,
    },
    countdown: {
        fontSize: 50,
        color: '#fff',
        marginBottom: 20,
    }
});

export default TiltSequenceGame;
