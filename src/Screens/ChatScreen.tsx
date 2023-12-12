import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import QB from 'quickblox-react-native-sdk';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  LogBox,
  NativeEventEmitter,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import ImageView from 'react-native-image-viewing';
import {PERMISSIONS, request} from 'react-native-permissions';
import RBSheet from 'react-native-raw-bottom-sheet';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import SheetData from '../Components/bottomSheet';
import ChatImage from '../Components/chatImage';
import ChatText from '../Components/chatText';
import ChatVideo from '../Components/chatVideo';
import ChatWrap from '../Components/chatWrap';
import CustomHeader from '../Components/header';
import Loading from '../Components/loading';
import LoadingOver from '../Components/loadingOver';
import AudioPlayer from '../Components/player';
import AudioRecording from '../Components/recording';
import VideoPlayer from '../Components/videoPlayer';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import {
  replaceObjectById,
  sendMessage,
  updateObjectById,
} from '../Contants/Utils';

const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.1);

export default function ChatScreen({route, navigation}: any) {
  const {dialogId, receipentId, name} = route.params;
  const user = useSelector((state: any) => state.user);

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
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMessages, setLoadingMessages] = useState(false);

  //@ts-ignore
  const emitter = new NativeEventEmitter(QB.chat);
  LogBox.ignoreAllLogs();

  const [newMessage, setNewMessage] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState<any>(0);
  const [minutes, setMinutes] = useState<any>(0);
  const today = moment();

  useEffect(() => {
    TrackPlayer?.setupPlayer();
  }, []);

  useEffect(() => {
    fetchChat();
  }, [currentPage]);

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

  useEffect(() => {
    if (user) {
      // let id =
      //   dialog?.occupantsIds[0] === user.id
      //     ? dialog?.occupantsIds[1]
      //     : dialog?.occupantsIds[0];
      const collectionRef = firestore()
        .collection('Users')
        .doc(`${receipentId}`);
      const unsubscribe = collectionRef.onSnapshot(querySnapshot => {
        setFriend(querySnapshot.data());
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const handleAudioChange = (seconds: any, minutes: any) => {
    let newSeconds = seconds;
    let newMinutes = minutes;
    if (seconds === 59) {
      newSeconds = 0;
      newMinutes += 1;
    } else {
      newSeconds += 1;
    }
    setSeconds(newSeconds);
    setMinutes(newMinutes);
  };

  const toggleRecording = (sent: boolean) => {
    setIsRecording(!isRecording);
    stopRecording(sent);
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
          content: result,
          user,
          messages,
          setMessages,
          dialogId,
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
        <ChatWrap item={item} user={user}>
          <ChatImage
            msg={item}
            setImage={setCurrentImage}
            setIsVisible={setIsVisible}
            user={user}
          />
        </ChatWrap>
      );
    } else if (item?.properties?.type == 'video') {
      return (
        <ChatWrap item={item} user={user}>
          <ChatVideo
            msg={item}
            setVideo={setVideo}
            setModalVisible={setModalVisible}
            user={user}
          />
        </ChatWrap>
      );
    } else if (item?.properties?.type == 'audio') {
      return (
        <ChatWrap item={item} user={user}>
          <AudioPlayer
            msg={item}
            user={user}
            start={start}
            setStart={setStart}
          />
        </ChatWrap>
      );
    } else if (item?.properties?.type == 'date') {
      return (
        <View style={styles.showDay}>
          <Text style={styles.showDayText}>
            {moment(item?.dateSent)?.isSame(today, 'day')
              ? 'Today'
              : moment(item?.dateSent)?.isSame(
                  today.clone().subtract(1, 'day'),
                  'day',
                )
              ? 'Yesterday'
              : moment(item?.dateSent)?.format('MMMM D, YYYY')}
          </Text>
        </View>
      );
    } else {
      return (
        <ChatWrap item={item} user={user}>
          <ChatText item={item} user={user} />
        </ChatWrap>
      );
    }
  };

  const fetchChat = () => {
    if (currentPage > 1) {
      setLoadingMessages(true);
    }
    const getDialogMessagesParams: any = {
      dialogId,
      sort: {
        ascending: false,
        field: QB.chat.MESSAGES_SORT.FIELD.DATE_SENT,
      },
      limit: 10,
      skip: (currentPage - 1) * 10,
      markAsRead: true,
    };
    QB.chat
      .getDialogMessages(getDialogMessagesParams)
      .then(async result => {
        // setMessages(result?.messages);
        setMessages((prevMessages: any) => {
          const updatedMessages = [...prevMessages, ...result.messages];
          return updatedMessages;
        });
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
        setLoadingMessages(false);
      })
      .catch(function (e) {
        // handle error
      });
  };

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

  const handleSendMessage = (type: string) => {
    refRBSheet?.current?.close();
    sendMessage({
      messageType: type,
      content: newMessage,
      user,
      messages,
      setMessages,
      dialogId,
      setNewMessage,
      friend,
      setSending,
      minutes: 0,
      seconds: 0,
    });
  };

  const loadMoreChat = () => {
    setCurrentPage(previousPage => previousPage + 1);
  };

  // if (loading) {
  //   return <Loading />;
  // }
  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: Colors.white}}
      edges={{bottom: 'maximum'}}>
      {/* {loading && <LoadingOver />} */}
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
          onEndReached={loadMoreChat}
          onEndReachedThreshold={5}
          ListFooterComponent={loadingMessages ? <ActivityIndicator /> : null}
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
          {
            //@ts-ignore
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
              <SheetData handleSendMessage={handleSendMessage} />
            </RBSheet>
          }
        </View>
      </View>
      <View style={styles.inputMainContainer}>
        {isRecording ? (
          <AudioRecording
            toggleRecording={toggleRecording}
            handleAudioChange={handleAudioChange}
          />
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
      <ImageView
        images={[{uri: currentImage}]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
      <VideoPlayer
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        video={video}
        onClose={() => setModalVisible(false)}
      />
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
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: mvs(10),
    paddingBottom: mvs(20),
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
    paddingHorizontal: mvs(10),
  },
  actionIconWrapper: {
    backgroundColor: Colors.firstColor,
    height: mvs(60),
    width: mvs(60),
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: mvs(20),
    marginHorizontal: mvs(5),
  },
  showDay: {
    height: mvs(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  showDayText: {
    color: 'gray',
  },
});
