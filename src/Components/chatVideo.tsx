//import liraries
import React, {Component, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {mvs} from '../Config/metrices';
import {createThumbnail} from 'react-native-create-thumbnail';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../Contants/Colors';

// create a component
const ChatVideo = ({msg, setVideo, setModalVisible}: any) => {
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    createThumbnail({
      url: msg?.properties?.url,
      timeStamp: 10000,
    }).then(res => {
      setThumbnail(res?.path);
    });
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        setVideo(msg?.url);
        setModalVisible(true);
      }}
      style={styles.video}>
      <Image
        source={{uri: thumbnail}}
        height={150}
        width={200}
      />
      <Icon
        name="play"
        size={mvs(50)}
        color={Colors.white}
        style={{position: 'absolute'}}
      />
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
  video: {
    height: 150,
    width: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    overflow: 'hidden'
  },
});

//make this component available to the app
export default ChatVideo;
