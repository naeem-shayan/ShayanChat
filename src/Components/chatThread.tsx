import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Colors from '../Contants/Colors';
import moment from 'moment';

const ChatThread = ({item, name, onPress, user, ...props}: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={{
          uri: item?.members?.filter((mem: any) => mem?.id !== user?.id)[0]
            ?.displayPictureUrl || 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png',
        }}
        style={styles.image}
      />
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.userName}>
            {name}
          </Text>
          <Text style={styles.time}>
            {moment(item?.lastReceivedMessage?.createdTime).format('LT')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.message}>
            {item.lastReceivedMessage?.body}
          </Text>
          {/* <View style={styles.messageContainer}>
            <Text style={styles.messageCounter}>0</Text>
          </View> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.userStatusColor,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  contentContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
    marginHorizontal: 18,
  },
  userName: {
    color: Colors.textColor,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 31.5,
    width: 180,
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 31.5,
    color: Colors.textColor,
  },
  message: {
    color: Colors.textColor,
    fontSize: 12,
    fontWeight: '400',
    alignSelf: 'center',
    width: 206,
  },
  messageContainer: {
    height: 25,
    width: 25,
    borderRadius: 25 / 2,
    backgroundColor: Colors.firstColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageCounter: {
    color: 'white',
    // textAlign: 'center'
  },
});

export default ChatThread;