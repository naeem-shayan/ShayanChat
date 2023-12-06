//import liraries
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { mvs } from '../Config/metrices';
import Colors from '../Contants/Colors';

// create a component
const ChatText = ({item, user}: any) => {
  return (
    <View
      style={{
        ...styles.messageContainer,
        backgroundColor:
          user?.id == item?.senderId ? Colors.firstColor : 'lightgray',
      }}>
      <Text
        style={{
          ...styles.messageText,
          color: item.senderId === user?.id ? Colors.white : Colors.textColor,
        }}>
        {item.body}
      </Text>
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
export default ChatText;
