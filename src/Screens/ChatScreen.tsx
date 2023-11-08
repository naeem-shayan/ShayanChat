import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Actions,
  ActionsProps,
  Avatar,
  Bubble,
  GiftedChat,
} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../Components/loading';
import Colors from '../Contants/Colors';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  LogBox,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import ImageView from 'react-native-image-viewing';
import CustomHeader from '../Components/header';
import {sendPushNotification} from '../Contants/SendPush';
//@ts-ignore
import UserAvatar from 'react-native-user-avatar';
import {useIsFocused} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import QB from 'quickblox-react-native-sdk';
import {NativeEventEmitter} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {mvs} from '../Config/metrices';
import Video from 'react-native-video';
import {createThumbnail} from 'react-native-create-thumbnail';
import ChatVideo from '../Components/chatVideo';
import LoadingOver from '../Components/loadingOver';

export default function ChatScreen({route, navigation}: any) {
  const {channel, dialog, user, name} = route.params;
  const player = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('');
  const [sending, setSending] = useState(false);
  const [visible, setIsVisible] = useState(false);
  const [loadEarlier, setLoadEarlier] = useState(false);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [messagePaginator, setMessagePaginator] = useState<any>(null);
  const [friend, setFriend] = useState<any>({});
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [video, setVideo] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
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
      .then(async result => {
        const msgs: any = await Promise.all(
          result?.messages?.map(async (el: any) => {
            return {
              ...el,
              _id: el?.id,
              user: {_id: el?.senderId, name: el?.name},
              text: el?.body,
              type: el?.properties?.type,
              url: el?.properties?.url || '',
            };
          }),
        );
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
      let id =
        dialog?.occupantsIds[0] === user.id
          ? dialog?.occupantsIds[1]
          : dialog?.occupantsIds[0];
      const collectionRef = firestore().collection('Users').doc(`${id}`);
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
    // type - event name (string)
    // payload - message received (object)
    setMessages((currentMessages: any) =>
      GiftedChat.append(currentMessages, [
        {
          ...payload,
          _id: payload?.id,
          user: {_id: payload?.senderId, name: payload?.name},
          text: payload?.body,
          createdAt: payload?.createdAt,
          type: payload?.properties?.type,
          url: payload?.properties?.url || '',
        },
      ]),
    );
    QB.chat.markMessageRead({message: payload});
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
    if (isFocused) {
      emitter.addListener(
        QB.chat.EVENT_TYPE.RECEIVED_NEW_MESSAGE,
        receivedNewMessage,
      );

      emitter.addListener(
        QB.chat.EVENT_TYPE.MESSAGE_DELIVERED,
        messageStatusHandler,
      );

      emitter.addListener(
        QB.chat.EVENT_TYPE.MESSAGE_READ,
        messageStatusHandler,
      );

      emitter.addListener(
        QB.chat.EVENT_TYPE.RECEIVED_SYSTEM_MESSAGE,
        systemMessageHandler,
      );

      emitter.addListener(QB.chat.EVENT_TYPE.USER_IS_TYPING, userTypingHandler);

      emitter.addListener(
        QB.chat.EVENT_TYPE.USER_STOPPED_TYPING,
        userTypingHandler,
      );

      return () => {
        emitter.removeAllListeners(QB.chat.EVENT_TYPE.RECEIVED_NEW_MESSAGE);
        emitter.removeAllListeners(QB.chat.EVENT_TYPE.MESSAGE_DELIVERED);
        emitter.removeAllListeners(QB.chat.EVENT_TYPE.MESSAGE_READ);
        emitter.removeAllListeners(QB.chat.EVENT_TYPE.RECEIVED_SYSTEM_MESSAGE);
        emitter.removeAllListeners(QB.chat.EVENT_TYPE.USER_IS_TYPING);
        emitter.removeAllListeners(QB.chat.EVENT_TYPE.USER_STOPPED_TYPING);
      };
    }
  }, [isFocused]);

  async function handleSend(pendingMessages: any) {
    const message = {
      dialogId: dialog?.id,
      body: pendingMessages[0].text,
      properties: {
        type: 'text',
      },
      saveToHistory: true,
    };

    QB.chat.sendMessage(message);
    sendPushNotification(friend?.deviceToken, {
      title: user?.fullName,
      body: pendingMessages[0].text,
    });
  }

  async function handleSendFile(type: any) {
    const result: any = await launchImageLibrary({mediaType: type});
    if (!result?.didCancel) {
      setSending(true);
      const contentUploadParams = {
        url: result?.assets[0]?.uri, // path to file in local file system
        public: false,
      };
      QB.content
        .upload(contentUploadParams)
        .then(async (file: any) => {
          const { uid } = file;
          const contentGetFileUrlParams = { uid };
          const url = await QB.content.getPrivateURL(contentGetFileUrlParams);
          // create a message
          const message = {
            dialogId: dialog?.id,
            body: 'Attachment',
            saveToHistory: true,
            properties: {
              type: file?.contentType.includes('image')
                ? 'image'
                : file?.contentType.includes('video')
                ? 'video'
                : 'file',
              url: url,
            },
          };
          //send a message
          QB.chat.sendMessage(message);
          setSending(false);
          sendPushNotification(friend?.deviceToken, {
            title: user?.fullName,
            body: 'Attachment',
          });
        })
        .catch(function (e) {
          setSending(false);
          /* handle file upload error */
        });
    }
  }

  function renderActions(props: Readonly<ActionsProps>) {
    return (
      <Actions
        {...props}
        options={{
          ['Send Image']: () => handleSendFile('image'),
          ['Send Video']: () => handleSendFile('video'),
          Cancel: (props: any) => {
            console.log('Cancel');
          },
        }}
        icon={() => (
          <Icon name="attachment" size={28} color={Colors.firstColor} />
        )}
        onSend={args => console.log(args)}
      />
    );
  }

  function renderBubble(props: any) {
    const {currentMessage} = props;
    if (currentMessage?.type == 'image') {
      return (
        <TouchableOpacity
          onPress={() => {
            setCurrentImage(currentMessage?.url);
            setIsVisible(true);
          }}>
          <Image
            source={{uri: currentMessage?.url}}
            height={150}
            width={200}
            borderRadius={mvs(20)}
          />
        </TouchableOpacity>
      );
    } else if (currentMessage?.type == 'video') {
      return (
        <ChatVideo
          msg={currentMessage}
          setVideo={setVideo}
          setModalVisible={setModalVisible}
        />
      );
    } else {
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
        renderActions={renderActions}
      />
      <ImageView
        images={[{uri: currentImage}]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Pressable
              style={[styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Icon name="close" color={Colors.white} size={mvs(30)} />
            </Pressable>
            <Video
              source={{uri: video}}
              style={{flex: 1}}
              resizeMode="contain" // You can adjust this as needed
              //controls={true} // Display video controls
              paused={false} // Start the video playing
              controls={true}
              onLoadStart={() => setVideoLoading(true)}
              onLoad={() => setVideoLoading(false)} // Callback when remote video is buffering
              onError={() => setModalVisible(false)}
            />
            {videoLoading && (
              <ActivityIndicator
                style={styles.videoLoader}
                size={'large'}
                color={Colors.white}
              />
            )}
          </View>
        </View>
      </Modal>
      {sending && <LoadingOver/>}
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
  video: {
    height: 150,
    width: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    height: '100%',
    width: '100%',
    //margin: 20,
    backgroundColor: '#000',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 35,
    //alignItems: 'center'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    position: 'absolute',
    top: mvs(20),
    right: mvs(20),
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    height: 'auto',
    backgroundColor: 'red',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  videoLoader: {position: 'absolute', alignSelf: 'center', marginTop: mvs(350)},
});
