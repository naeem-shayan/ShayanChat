//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../Contants/Colors';
import {mvs} from '../Config/metrices';
import moment from 'moment';

// create a component
const ChatWrap = ({item, user, ...props}: any) => {
  return (
    <View
      style={
        item.senderId === user?.id ? styles.userMessage : styles.otherMessage
      }>
      {props.children}
      <View
        style={{
          ...styles.infoContainer,
          justifyContent:
            item.senderId === user?.id ? 'flex-end' : 'flex-start',
        }}>
        <Text style={styles.time}>{moment(item?.dateSent).format('LT')}</Text>
        {user?.id == item?.senderId && (
          <Icon
            size={mvs(18)}
            name={
              item?.properties?.status == 'sending'
                ? 'clock-time-nine-outline'
                : item?.deliveredIds?.length > 1
                ? 'check-all'
                : 'check'
            }
            color={item?.readIds?.length > 1 ? Colors.firstColor : 'lightgray'}
            style={styles.status}
          />
        )}
      </View>
    </View>
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
    maxWidth: '70%',
    //minWidth: mvs(60)
    //backgroundColor: Colors.firstColor,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    marginVertical: 4,
    maxWidth: '70%',
    //minWidth: mvs(60)
    //backgroundColor: 'lightgray',
  },
  status: {alignSelf: 'flex-end', marginHorizontal: mvs(5)},
  messageText: {
    color: '#000000',
    padding: 8,
    // backgroundColor: '#e0e0e0',
  },
  messageContainer: {
    borderRadius: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    paddingVertical: mvs(2),
    alignItems: 'center',
  },
  time: {
    fontSize: mvs(12),
  },
});

//make this component available to the app
export default ChatWrap;
