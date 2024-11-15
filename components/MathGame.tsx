import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

type Operation = '+' | '-' | '*' | '/';

const generateRandomNumber = (max: number) => Math.floor(Math.random() * max);
const generateRandomOperation = (): Operation => {
    const operations: Operation[] = ['+', '-', '*', '/'];
    return operations[generateRandomNumber(operations.length)];
};

const calculateAnswer = (num1: number, num2: number, operation: Operation): number => {
    switch (operation) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '*':
            return num1 * num2;
        case '/':
            return parseFloat((num1 / num2).toFixed(2)); // limits to 2 decimal places
        default:
            return 0;
    }
};

const MathGame: React.FC = () => {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(1); // Avoid division by zero
    const [operation, setOperation] = useState<Operation>('+');
    const [answer, setAnswer] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState(0);

    const generateQuestion = () => {
        const newNum1 = generateRandomNumber(10);
        const newNum2 = generateRandomNumber(10) || 1; // Prevent zero in division
        const newOperation = generateRandomOperation();
        const calculatedAnswer = calculateAnswer(newNum1, newNum2, newOperation);

        setNum1(newNum1);
        setNum2(newNum2);
        setOperation(newOperation);
        setCorrectAnswer(calculatedAnswer);
        setAnswer('');
    };

    const checkAnswer = () => {
        const userAnswer = parseFloat(answer);
        if (userAnswer === correctAnswer) {
            Alert.alert("Correct!", "You answered correctly!");
        } else {
            Alert.alert("Incorrect", `The correct answer was ${correctAnswer}`);
        }
        generateQuestion(); // Generate a new question after answering
    };

    useEffect(() => {
        generateQuestion();
    }, []);

    return (
        <View style={styles.container}>
        <Text style={styles.question}>{`${num1} ${operation} ${num2} = ?`}</Text>
    <TextInput
    style={styles.input}
    keyboardType="numeric"
    value={answer}
    onChangeText={setAnswer}
    />
    <Button title="Submit" onPress={checkAnswer} />
    </View>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    question: {
        fontSize: 24,
        marginBottom: 20,
        color: "#fff"
    },
    input: {
        borderBottomWidth: 1,
        width: 100,
        textAlign: 'center',
        fontSize: 20,
        marginBottom: 20,
        color: "#fff"
    },
});

export default MathGame;
