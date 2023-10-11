import React, { useState } from 'react';
import { Text, TextInput, ScrollView, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import Colors from '../Components/Colors';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signup = () => {
    console.warn("email", email)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Signup Here</Text>
      <TextInput
        style={styles.input}
        placeholder='Enter your Email'
        placeholderTextColor="#FFF"
        selectionColor="#FFF"
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder='Enter your Password'
        placeholderTextColor="#FFF"
        selectionColor="#FFF"
        value={password}
        secureTextEntry
        onChangeText={text => setPassword(text)}
      />
      <TouchableOpacity style={styles.signupButton} onPress={signup}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.secondColor
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#e8e4e4",
    marginBottom: "10%"
  },
  input: {
    width: '90%',
    height: 60,
    borderColor: 'rgba(255, 255, 255, 0.40)',
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderRadius: 16,
    color: "#FFF"
  },
  signupButton: {
    width: "90%",
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%"
  },
  signupText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  }
})

export default SignupScreen