import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image, SafeAreaView } from "react-native";
import auth from '@react-native-firebase/auth';
import Colors from '../Contants/Colors';

const ChatScreen = (props) => {
  const handleLogout = () => {
    auth().signOut()
      .then(() => {
        props.navigation.navigate("Login");
      })
      .catch((error) => {
        console.error(error);
      });
  };
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
          <Text style={styles.title}>Chat Screen</Text>
          <Text style={{ margin: 20 }} onPress={handleLogout}>Logout</Text>
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
  errors: {
    color: Colors.errorColor,
    fontSize: 15,
  }
})

export default ChatScreen