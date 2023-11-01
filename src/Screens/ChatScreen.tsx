import React, {useContext, useEffect, useState} from 'react';
import {
  Actions,
  ActionsProps,
  Avatar,
  Bubble,
  GiftedChat,
} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  chatkitty,
  channelDisplayName,
  checkUserStatus,
  participant,
} from '../ChatKitty';
import Loading from '../Components/loading';
import Colors from '../Contants/Colors';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {Image, LogBox, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import ImageView from 'react-native-image-viewing';
import CustomHeader from '../Components/header';
import messaging from '@react-native-firebase/messaging';
import {sendPushNotification} from '../Contants/SendPush';
import User from '../Components/user';
//@ts-ignore
import UserAvatar from 'react-native-user-avatar';
import {useIsFocused} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import QB from 'quickblox-react-native-sdk';
import {NativeEventEmitter} from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function ChatScreen({route, navigation}: any) {
  const {channel, dialog, user, name} = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('');
  const [visible, setIsVisible] = useState(false);
  const [participantDetails, setParticipantDetails] = useState<any>(null);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [loadEarlier, setLoadEarlier] = useState(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [messagePaginator, setMessagePaginator] = useState<any>(null);
  const [friend, setFriend] = useState<any>({});

  const insets = useSafeAreaInsets();
  //@ts-ignore
  const emitter = new NativeEventEmitter(QB.chat);

  LogBox.ignoreAllLogs();

  const fetchChat = () => {
    const getDialogMessagesParams: any = {
      dialogId: dialog?.id,
      sort: {
        ascending: false,
        field: QB.chat.MESSAGES_SORT.FIELD.DATE_SENT,
      },
      markAsRead: true,
    };

    QB.chat
      .getDialogMessages(getDialogMessagesParams)
      .then(function (result) {
        // result.messages - array of messages found
        // result.skip - number of items skipped
        // result.limit - number of items returned per page
        const msgs: any = result?.messages?.map((el: any) => ({
          ...el,
          _id: el?.id,
          user: {_id: el?.senderId, name: el?.name},
          text: el?.body,
        }));
        setMessages(msgs);
        setLoading(false);
      })
      .catch(function (e) {
        // handle error
      });
  };

  useEffect(() => {
    fetchChat();
  }, []);

  useEffect(() => {
    if (user) {
      const collectionRef = firestore()
        .collection('Users')
        .doc(`${dialog?.userId}`);
      const unsubscribe = collectionRef.onSnapshot(querySnapshot => {
        setFriend(querySnapshot.data());
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  async function receivedNewMessage(event: any) {
    const {type, payload} = event;
    // handle new message
    // type - event name (string)
    // payload - message received (object)
    //@ts-ignore
    setMessages((currentMessages: any) =>
      GiftedChat.append(currentMessages, [
        {
          ...payload,
          _id: payload?.id,
          user: {_id: payload?.senderId, name: payload?.name},
          text: payload?.body,
        },
      ]),
    );
    QB.chat.getDialogMessages({dialogId: dialog?.id, markAsRead: true});
  }

  function messageStatusHandler(event: any) {
    // handle message status change
    //console.log('MSG_STATUS:', JSON.stringify(event, null, 8));
  }

  function systemMessageHandler(event: any) {
    // handle system message
    //console.log('MSG_Handler:', JSON.stringify(event, null, 8));
  }

  function userTypingHandler(event: any) {
    // handle user typing / stopped typing event
    //console.log('MSG_Typing:', JSON.stringify(event, null, 8));
  }

  useEffect(() => {
    emitter.addListener(
      QB.chat.EVENT_TYPE.RECEIVED_NEW_MESSAGE,
      receivedNewMessage,
    );
  
    emitter.addListener(
      QB.chat.EVENT_TYPE.MESSAGE_DELIVERED,
      messageStatusHandler,
    );
  
    emitter.addListener(QB.chat.EVENT_TYPE.MESSAGE_READ, messageStatusHandler);
  
    emitter.addListener(
      QB.chat.EVENT_TYPE.RECEIVED_SYSTEM_MESSAGE,
      systemMessageHandler,
    );
  
    emitter.addListener(QB.chat.EVENT_TYPE.USER_IS_TYPING, userTypingHandler);
  
    emitter.addListener(
      QB.chat.EVENT_TYPE.USER_STOPPED_TYPING,
      userTypingHandler,
    );

    return emitter.removeAllListeners('')
  },[])

  async function handleSend(pendingMessages: any) {
    const message = {
      dialogId: dialog?.id,
      body: pendingMessages[0].text,
      saveToHistory: true,
    };

    QB.chat
      .sendMessage(message)
      .then(function () {
        /* send successfully */
      })
      .catch(function (e) {
        /* handle error */
      });
    sendPushNotification(friend?.deviceToken, {
      title: user?.fullName,
      body: pendingMessages[0].text,
    });
  }

  async function handleLoadEarlier() {
    if (!messagePaginator.hasNextPage) {
      setLoadEarlier(false);
      return;
    }
    setIsLoadingEarlier(true);
    const nextPaginator = await messagePaginator.nextPage();
    setMessagePaginator(nextPaginator);
    setMessages(currentMessages =>
      GiftedChat.prepend(currentMessages, nextPaginator.items.map(mapMessage)),
    );
    setIsLoadingEarlier(false);
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
            // sendPushNotification(participantDetails?.properties?.deviceToken, {
            //   title: user?.displayName,
            //   body: 'image',
            // });
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

  const renderAvatar = (props: any) => {
    const {currentMessage} = props;
    return <UserAvatar size={30} name={name} />;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: Colors.white}}
      edges={{bottom: 'maximum'}}>
      <CustomHeader
        title={friend?.fullName}
        showBack
        status={friend?.is_online ? 'online' : 'offline'}
        userStatus
        onBackPress={() => navigation.goBack()}
      />
      <GiftedChat
        bottomOffset={insets.bottom}
        messages={messages}
        onSend={handleSend}
        loadEarlier={loadEarlier}
        user={{
          _id: user?.id,
        }}
        // isLoadingEarlier={isLoadingEarlier}
        // onLoadEarlier={handleLoadEarlier}
        renderBubble={renderBubble}
        renderAvatar={renderAvatar}
        //renderActions={renderActions}
      />
      <ImageView
        images={[{uri: currentImage}]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
    </SafeAreaView>
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
    _id: user?.senderId,
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
