import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, SafeAreaView } from "react-native";
import auth from '@react-native-firebase/auth';
import Colors from '../Contants/Colors';


const SignupScreen = (props) => {
  const [name, setName]=useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [credientalError, setCredientalError] = useState('');

  const validateName =(name:string)=>{
    if(!name){
      setNameError("Enter Your Name");
      return false;
    }
    if(name.length<5){
      setNameError("Name should be at least 5 characters");
      return false;
    }
    else {
      setNameError('');
      return true;
    }
  }

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Enter Your Email");
      return false;
    }
    const validEmailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!validEmailPattern.test(email)) {
      setEmailError("invalid email");
      return false;
    }
    else {
      setEmailError('');
      return true;
    }
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Enter Your Password");
      return false;
    }
    if (password.length < 5) {
      setPasswordError("Password must be at least 5 characters");
      return false;
    }
    else {
      setPasswordError('');
      return true;
    }
  }

  const signup = () => {
    const isValidName = validateName(name);
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);
    if (!isValidEmail || !isValidPassword || !isValidName) {
      return;
    }
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('User account created & signed in!', userCredential);
        const user = userCredential.user;
        if (user) {
          user.updateProfile({
            displayName: name,
          });
        }
        props.navigation.navigate("ChatScreen")
      })
      .catch(error => {
        
        if (error.code === 'auth/email-already-in-use') {
          setCredientalError("Email already in use")
        }
        else if (error.code === 'auth/invalid-email') {
          setCredientalError("Invalid credentials");
        }
       else{
        setCredientalError(error.code)
       }
      });
  }

  return (
  <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../../assests/images/logo.jpg")}
          style={styles.image}
        />
        <Text style={styles.title}>Signup Here</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Enter your Name'
            placeholderTextColor={Colors.placeholderColor}
            selectionColor={Colors.selectionColor}
            value={name}
            onChangeText={text => setName(text)}
          />
          {
            nameError && <Text style={styles.errors}>{nameError}</Text>
          }
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Enter your Email'
            placeholderTextColor={Colors.placeholderColor}
            selectionColor={Colors.selectionColor}
            value={email}
            keyboardType='email-address'
            onChangeText={text => setEmail(text)}
          />
          {
            emailError && <Text style={styles.errors}>{emailError}</Text>
          }
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Enter your Password'
            placeholderTextColor={Colors.placeholderColor}
            selectionColor={Colors.selectionColor}
            value={password}
            secureTextEntry
            onChangeText={text => setPassword(text)}
          />
          {
            passwordError && <Text style={styles.errors}>{passwordError}</Text>
          }
        </View>
        {
            credientalError && <Text style={styles.errors}>{credientalError}</Text>
          }
        <TouchableOpacity style={styles.signupButton} onPress={signup}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "white"
  },
  image: {
    backgroundColor: "transparent",
    resizeMode: "cover",
    marginBottom: "10%"
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.textColor,
    marginBottom: "10%",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 32,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 60,
    borderColor: Colors.firstColor,
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    color: Colors.textColor
  },
  signupButton: {
    width: "90%",
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.firstColor,
    backgroundColor: Colors.secondColor,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "5%"
  },
  signupText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  errors: {
    color: Colors.errorColor,
    fontSize: 15,
  }
})

export default SignupScreen