//import liraries
import React, {Component, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {mvs} from '../Config/metrices';
import {createThumbnail} from 'react-native-create-thumbnail';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../Contants/Colors';

// create a component
const ChatImage = ({msg, setImage, setIsVisible, user}: any) => {
  return (
    <TouchableOpacity
      disabled={msg?.body == 'loading'}
      onPress={() => {
        setImage(msg?.properties?.url);
        setIsVisible(true);
      }}
      style={
        msg.senderId === user?.id ? styles.userMessage : styles.otherMessage
      }>
      {msg?.body == 'loading' ? (
        <ActivityIndicator />
      ) : (
        <Image source={{uri: msg?.properties?.url}} height={150} width={200} />
      )}
    </TouchableOpacity>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginVertical: 4,
    height: 150,
    width: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    overflow: 'hidden',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    marginVertical: 4,
    height: 150,
    width: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightgray',
    overflow: 'hidden',
  },
});

//make this component available to the app
export default ChatImage;
