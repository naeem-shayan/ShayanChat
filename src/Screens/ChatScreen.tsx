import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LogBox,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageView from 'react-native-image-viewing';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CustomHeader from '../Components/header';
import Loading from '../Components/loading';
import Colors from '../Contants/Colors';
import {sendPushNotification} from '../Contants/SendPush';
//@ts-ignore
import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import QB from 'quickblox-react-native-sdk';
import {NativeEventEmitter} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {PERMISSIONS, request} from 'react-native-permissions';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import RBSheet from 'react-native-raw-bottom-sheet';
import Video from 'react-native-video';
import ChatImage from '../Components/chatImage';
import ChatVideo from '../Components/chatVideo';
import LoadingOver from '../Components/loadingOver';
import AudioPlayer from '../Components/player';
import AudioRecording from '../Components/recording';
import {mvs} from '../Config/metrices';
import {
  replaceObjectById,
  sendMessage,
  updateObjectById,
} from '../Contants/Utils';

const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.1);

export default function ChatScreen({route, navigation}: any) {
  const {dialog, user, name} = route.params;
  const player = useRef(null);
  const refRBSheet = useRef<RBSheet>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('');
  const [sending, setSending] = useState(false);
  const [visible, setIsVisible] = useState(false);
  const [friend, setFriend] = useState<any>({});
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [video, setVideo] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [start, setStart] = useState(null);
  //@ts-ignore
  const emitter = new NativeEventEmitter(QB.chat);
  LogBox.ignoreAllLogs();

  const [newMessage, setNewMessage] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState<any>(null);
  const [seconds, setSeconds] = useState<any>(0);
  const [minutes, setMinutes] = useState<any>(0);

  useEffect(() => {
    TrackPlayer?.setupPlayer();
  }, []);

  const toggleRecording = (sent: boolean, seconds: string, minutes: string) => {
    setIsRecording(!isRecording);
    stopRecording(sent);
    setSeconds(seconds);
    setMinutes(minutes);
  };

  const startRecording = async () => {
    try {
      await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      if (isRecording) {
        await stopRecording(true);
        setIsRecording(false);
        return;
      }
      await audioRecorderPlayer?.startRecorder();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async (sent: boolean) => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      sent &&
        sendMessage({
          messageType: 'audio',
          newMessage: result,
          user,
          setMessages,
          dialog,
          setNewMessage,
          friend,
          setSending,
          minutes,
          seconds,
        });
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const renderItem = ({item}: any) => {
    if (item?.properties?.type == 'photo') {
      return (
        <ChatImage
          msg={item}
          setImage={setCurrentImage}
          setIsVisible={setIsVisible}
          user={user}
        />
      );
    } else if (item?.properties?.type == 'video') {
      return (
        <ChatVideo
          msg={item}
          setVideo={setVideo}
          setModalVisible={setModalVisible}
          user={user}
        />
      );
    } else if (item?.properties?.type == 'audio') {
      return (
        <AudioPlayer
          msg={item}
          user={user}
          start={start}
          setStart={setStart}
        />
      );
    } else {
      return (
        <View
          style={
            item.senderId === user?.id
              ? styles.userMessage
              : styles.otherMessage
          }>
          {user?.id == item?.senderId && (
            <Icon
              size={mvs(20)}
              name={
                item?.properties?.status == 'sending'
                  ? 'clock-time-nine-outline'
                  : item?.deliveredIds?.length > 1
                  ? 'check-all'
                  : 'check'
              }
              color={item?.readIds?.length > 1 ? 'blue' : 'gray'}
              style={styles.status}
            />
          )}
          <Text
            style={{
              ...styles.messageText,
              color:
                item.senderId === user?.id ? Colors.white : Colors.textColor,
            }}>
            {item.body}
          </Text>
        </View>
      );
    }
  };

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
        setMessages(result?.messages);
        result?.messages?.forEach((element: any) => {
          if (element?.readIds?.length < 2) {
            const markMessageReadParams: any = {
              message: {
                id: element.id,
                dialogId: element.dialogId,
                senderId: element.senderId,
              },
            };
            QB.chat.markMessageRead(markMessageReadParams);
          }
        });
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
    setMessages(async (currentMessages: any) => {
      const newMsges = await replaceObjectById(
        payload?.properties?.id,
        payload,
        currentMessages,
      );
      setMessages([...newMsges]);
    });
    QB.chat.markMessageRead({message: payload});
  }

  function messageStatusHandler(event: any) {
    const {type, payload} = event;
    // handle message status change
    if (payload?.userId !== user?.id) {
      setMessages(async (currentMessages: any) => {
        const newMsges = await updateObjectById(
          payload?.messageId,
          payload?.userId,
          type,
          currentMessages,
        );
        setMessages([...newMsges]);
      });
    }
  }

  function systemMessageHandler(event: any) {
    // handle system message
    // console.log('MSG_Handler:', JSON.stringify(event, null, 8));
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

  const handleSendMessage = (type: string) => {
    if (type == 'text') {
      sendMessage({
        messageType: 'text',
        newMessage,
        user,
        setMessages,
        dialog,
        setNewMessage,
        friend,
        setSending,
        minutes: 0,
        seconds: 0,
      });
    }
    if (type == 'photo') {
      refRBSheet?.current?.close();
      sendMessage({
        messageType: 'poto',
        newMessage: 'Attachment',
        user,
        setMessages,
        dialog,
        setNewMessage,
        friend,
        setSending,
        minutes: 0,
        seconds: 0,
      });
    }
    if (type == 'video') {
      refRBSheet?.current?.close();
      sendMessage({
        messageType: 'poto',
        newMessage: 'Attachment',
        user,
        setMessages,
        dialog,
        setNewMessage,
        friend,
        setSending,
        minutes: 0,
        seconds: 0,
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: Colors.white}}
      edges={{bottom: 'maximum'}}>
      {loading && <LoadingOver />}
      <CustomHeader
        title={friend?.fullName}
        displayActions
        onCall={() =>
          navigation.navigate('Call', {
            opponentId: friend?.id,
            incomming: false,
            session: {},
          })
        }
        showBack
        status={friend?.is_online ? 'online' : 'offline'}
        userStatus
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={messages}
          inverted
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.messageList}
        />
        <View style={styles.inputContainer}>
          {mediaUri && (
            <Image
              source={{uri: mediaUri}}
              style={styles.previewImage}
              resizeMode="cover"
            />
          )}
          <RBSheet
            ref={refRBSheet}
            closeOnDragDown={true}
            closeOnPressMask={true}
            customStyles={{
              container: {
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                height: 'auto',
                marginTop: mvs(20),
              },
            }}>
            <Text style={styles.actionIconText}>Choose file to send</Text>
            <View style={styles.actionIconContainer}>
              <Pressable
                style={styles.actionIconWrapper}
                onPress={() => handleSendMessage('photo')}>
                <FontAwesomeIcon
                  name="image"
                  color={Colors.white}
                  size={mvs(30)}
                />
              </Pressable>
              <Pressable
                style={styles.actionIconWrapper}
                onPress={() => handleSendMessage('video')}>
                <FontAwesomeIcon
                  name="file-video-o"
                  color={Colors.white}
                  size={mvs(30)}
                />
              </Pressable>
            </View>
          </RBSheet>
        </View>
      </View>
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
      <View style={styles.inputMainContainer}>
        {isRecording ? (
          <AudioRecording toggleRecording={toggleRecording} />
        ) : (
          <>
            <Ionicons
              name="attach"
              color={Colors.firstColor}
              size={mvs(30)}
              style={{marginRight: mvs(5)}}
              onPress={() => refRBSheet?.current?.open()}
            />
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={newMessage}
              onChangeText={text => setNewMessage(text)}
            />
          </>
        )}
        <TouchableOpacity
          onPress={() => {
            newMessage.length > 0
              ? handleSendMessage('text')
              : startRecording();
          }}>
          <Icon
            name={isRecording || newMessage.length > 0 ? 'send' : 'microphone'}
            size={30}
            color={Colors.firstColor}
            style={styles.microphone}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
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
  container: {
    flex: 1,
    padding: 16,
  },
  messageList: {
    flex: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginVertical: 4,
    maxWidth: '70%',
    backgroundColor: Colors.firstColor,
    borderRadius: 8,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    marginVertical: 4,
    maxWidth: '70%',
    borderRadius: 8,
    backgroundColor: 'lightgray',
  },
  messageText: {
    color: '#000000',
    padding: 8,
    // backgroundColor: '#e0e0e0',
  },
  media: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  microphone: {
    marginLeft: mvs(10),
  },
  sendButtonText: {
    color: '#ffffff',
  },
  status: {alignSelf: 'flex-end', marginHorizontal: mvs(5)},
  inputMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: mvs(10),
  },
  actionIconText: {
    textAlign: 'center',
    marginTop: mvs(10),
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
    color: Colors.textColor,
  },
  actionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  actionIconWrapper: {
    backgroundColor: Colors.firstColor,
    height: mvs(70),
    width: mvs(70),
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: mvs(20),
    margin: mvs(15),
  },
});
