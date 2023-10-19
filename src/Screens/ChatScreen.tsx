import React, {useContext, useEffect, useState} from 'react';
import {
  Actions,
  ActionsProps,
  Avatar,
  Bubble,
  GiftedChat,
} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {chatkitty, channelDisplayName, checkUserStatus} from '../ChatKitty';
import Loading from '../Components/loading';
import {AuthContext} from '../Context/authProvider';
import Colors from '../Contants/Colors';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import CustomHeader from '../Components/header';
import messaging from '@react-native-firebase/messaging';
import {sendPushNotification} from '../Contants/SendPush';
import User from '../Components/user';

export default function ChatScreen({route, navigation}: any) {
  const {channel, user} = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startChatSessionResult = chatkitty.startChatSession({
      channel: channel,
      onMessageReceived: message => {
        //@ts-ignore
        setMessages((currentMessages: any) =>
          GiftedChat.append(currentMessages, [mapMessage(message)]),
        );
      },
    });

    chatkitty
      .listMessages({
        channel: channel,
      })
      .then((result: any) => {
        setMessages(result.paginator.items.map(mapMessage));
        setLoading(false);
      });

    return startChatSessionResult.session.end;
  }, [user, channel]);

  async function handleSend(pendingMessages: any) {
    await chatkitty.sendMessage({
      channel: channel,
      body: pendingMessages[0].text,
    });
    sendPushNotification(user?.deviceToken, {
      title: user?.displayName,
      body: pendingMessages[0].text,
    });
  }

  async function handleSendImage(params: any) {
    const result: any = await launchImageLibrary({mediaType: 'photo'});
    if (!result?.didCancel) {
      let name = JSON.stringify(new Date().getTime());
      const reference = storage().ref(`images/${name}`);
      const task = reference.putFile(result?.assets[0]?.uri);
      task.on('state_changed', taskSnapshot => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
        );
      });
      task.then(async () => {
        console.log('Image uploaded to the bucket!');
        await storage()
          .ref(`images/${name}`)
          .getDownloadURL()
          .then(async url => {
            await chatkitty.sendMessage({
              channel: channel,
              file: {
                name: result?.assets[0]?.fileName,
                size: result?.assets[0]?.fileSize,
                contentType: result?.assets[0]?.type,
                url: url,
              },
              progressListener: {
                onStarted: () => {},
                onProgress: progress => {},
                onCompleted: result => {},
              },
            });
          });
      });
    }
  }

  function renderActions(props: Readonly<ActionsProps>) {
    return (
      <Actions
        {...props}
        options={{
          ['Send Image']: handleSendImage,
          Cancel: (props: any) => {
            console.log('Cancel');
          },
        }}
        icon={() => <Icon name="camera" size={28} color={Colors.firstColor} />}
        onSend={args => console.log(args)}
      />
    );
  }

  function renderBubble(props: any) {
    const {currentMessage} = props;
    if (currentMessage?.type == 'TEXT') {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: '#d3d3d3',
            },
          }}
        />
      );
    }
    if (currentMessage?.type == 'FILE') {
      return (
        <View style={styles.imageMessage}>
          <Image source={{uri: currentMessage?.file}} style={styles.image} />
          <Text>{moment(currentMessage?.createdAt).format('LT')}</Text>
        </View>
      );
    }
  }

  const renderAvatar = (props: any) => {
    return <Avatar {...props} onPressAvatar={avatarUser => {}} />;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <CustomHeader
        title={channelDisplayName(channel, user?.id)}
        showBack
        status={checkUserStatus(channel, user?.id)}
        userStatus
        onBackPress={() => navigation.goBack()}
      />
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={mapUser(user)}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        renderActions={renderActions}
      />
    </>
  );
}

function mapMessage(message: any) {
  return {
    _id: message.id,
    text: message.body,
    createdAt: new Date(message.createdTime),
    user: mapUser(message.user),
    type: message.type,
    file: message?.file?.url,
  };
}

function mapUser(user: any) {
  return {
    _id: user?.id,
    name: user?.displayName,
    avatar: user?.displayPictureUrl,
  };
}

const styles = StyleSheet.create({
  imageMessage: {
    paddingVertical: 5,
    overflow: 'hidden',
  },
  image: {
    height: 100,
    width: 150,
    borderRadius: 10,
  },
});
