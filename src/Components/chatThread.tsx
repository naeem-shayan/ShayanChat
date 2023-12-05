import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Colors from '../Contants/Colors';
import moment from 'moment';
//@ts-ignore
import UserAvatar from 'react-native-user-avatar';
import { mvs } from '../Config/metrices';

const ChatThread = ({item, name, onPress, user, ...props}: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* <Image
        source={{
          uri:
            item?.members?.filter((mem: any) => mem?.id !== user?.id)[0]
              ?.displayPictureUrl ||
            'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png',
        }}
        style={styles.image}
      /> */}
      <UserAvatar size={50} name={name} />
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
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={{
              ...styles.message,
              fontWeight: item?.unreadMessagesCount > 0 ? 'bold' : 'normal',
            }}>
            {item?.lastMessage}
          </Text>
          {item?.unreadMessagesCount > 0 && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageCounter}>
                {item?.unreadMessagesCount}
              </Text>
            </View>
          )}
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
    fontSize: mvs(18),
    fontWeight: '700',
    lineHeight: 31.5,
    width: mvs(180),
    fontFamily: 'Poppins-Regular',
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
