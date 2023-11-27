// src/components/AudioVideoCallScreen.js
import QB from 'quickblox-react-native-sdk';
import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  NativeEventEmitter,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {callSession} from '../Actions/userAction';
import Colors from '../Contants/Colors';
import WebRTCView from 'quickblox-react-native-sdk/RTCView';
import {useIsFocused} from '@react-navigation/native';

const CallScreen = ({route, navigation}: any) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const {opponentId, incomming, session} = route?.params;
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);
  const [sessionId, setSessionId] = useState(session?.id);
  const [timeInterval, setTimeInterval] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [call, setCall] = useState<any>(null);
  const [isVolumeMuted, setVolumeMuted] = useState(false);

  //@ts-ignore
  const emitter = new NativeEventEmitter(QB.webrtc);

  const user = useSelector((state: any) => state.user);

  useEffect(() => {
    if (isFocused) {
      const params = {
        opponentsIds: [opponentId],
        type: QB.webrtc.RTC_SESSION_TYPE.VIDEO,
      };
      QB.webrtc
        .call(params)
        .then(function (session) {
          setSessionId(session?.id);
          dispatch(callSession(session));
        })
        .catch(function (e) {});
    }
  }, [isFocused]);

  function eventHandler(event: any) {
    const {
      type, // type of the event (i.e. `@QB/CALL` or `@QB/REJECT`)
      payload,
    } = event;
    const {
      userId, // id of QuickBlox user who initiated this event (if any)
      session, // current or new session
    } = payload;
    if (type == '@QB/CALL_END' || type == '@QB/HANG_UP') {
      navigation.goBack();
    } else if (type == '@QB/ACCEPT') {
      setCall(session);
      //startTimer();
    }
  }

  useEffect(() => {
    emitter.addListener(QB.webrtc.EVENT_TYPE.CALL_END, eventHandler);
    emitter.addListener(QB.webrtc.EVENT_TYPE.ACCEPT, eventHandler);
    return () => {
      emitter.removeAllListeners(QB.webrtc.EVENT_TYPE.CALL_END);
      emitter.removeAllListeners(QB.webrtc.EVENT_TYPE.ACCEPT);
    };
  }, []);

  const toggleVolume = () => {
    const audioOutputParams = {
      output: isVolumeMuted
        ? QB.webrtc.AUDIO_OUTPUT.LOUDSPEAKER
        : QB.webrtc.AUDIO_OUTPUT.EARSPEAKER,
    };
    QB.webrtc
      .switchAudioOutput(audioOutputParams)
      .then(() => {
        setVolumeMuted(!isVolumeMuted);
        /* audio should now go through loudspeaker */
      })
      .catch(e => {
        /* handle error */
      });
    // Add logic to mute/unmute video
  };

  const toggleVideo = () => {
    const enableVideoParams = {sessionId: call?.id, enable: isVideoMuted};
    QB.webrtc
      .enableVideo(enableVideoParams)
      .then(res => {
        setVideoMuted(!isVideoMuted);
      })
      .catch(e => {
        console.log('Error:', e);
      });
  };

  const toggleAudio = () => {
    const enableAudioParams = {
      sessionId: call?.id,
      // userId: call?.opponentsIds[0],
      enable: isAudioMuted,
    };
    QB.webrtc
      .enableAudio(enableAudioParams)
      .then(() => {
        setAudioMuted(!isAudioMuted);
        /* muted audio successfully */
      })
      .catch(e => {
        console.log('error:', e);
        /* handle error */
      });
  };

  const endCall = () => {
    // Add logic to end the call
    const hangUpParams = {
      sessionId: sessionId,
      userInfo: {
        // custom data can be passed using this object
        // only [string]: string type supported
      },
    };
    QB.webrtc
      .hangUp(hangUpParams)
      .then(function (session) {
        /* handle session */
        //stopTimer();
        setCall(null);
      })
      .catch(function (e) {
        /* handle error */
        console.log('ON_END_Error:', e);
      });
  };

  const startTimer = () => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);

    setTimeInterval(intervalId);
  };

  const stopTimer = () => {
    setTimer(0);
    clearInterval(timeInterval);
  };

  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      <View style={{...styles.localCam, height: call ? '50%' : '100%'}}>
        <WebRTCView
          mirror={true}
          sessionId={call?.id}
          style={styles.video}
          userId={user?.id}
        />
      </View>
      {call && (
        <View style={styles.remoteCam}>
          <WebRTCView
            sessionId={call?.id}
            style={styles.video}
            userId={call?.opponentsIds[0]}
          />
        </View>
      )}
      {/* <View style={styles.localUserContainer}>
        <WebRTCView
          mirror={true}
          sessionId={call?.id}
          style={styles.video}
          userId={user?.id}
        />
      </View>
      {call && (
        <View style={styles.remoteUserContainer}>
          <WebRTCView
            sessionId={call?.id}
            style={styles.video}
            userId={call?.opponentsIds[0]}
          />
        </View>
      )} */}
      {!call && (
        <View style={styles.iconContainer}>
          <Icon name="call" size={100} color={Colors.firstColor} />
          <Text style={{color: Colors.white}}>
            {call ? 'In Call' : 'Calling'}
          </Text>
          {/* {call && <Text style={styles.timer}>{formatTime(timer)}</Text>} */}
        </View>
      )}
      <View style={styles.bottomBar}>
        {call && (
          <TouchableOpacity onPress={toggleAudio} style={styles.iconButton}>
            <Icon
              name={isAudioMuted ? 'mic-off' : 'mic'}
              size={36}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={endCall} style={styles.endCallButton}>
          <Icon name="call-end" size={36} color="#fff" />
        </TouchableOpacity>

        {call && (
          // <TouchableOpacity onPress={toggleVolume} style={styles.iconButton}>
          //   <Icon
          //     name={isVolumeMuted ? 'volume-up' : 'volume-off'}
          //     size={36}
          //     color="#fff"
          //   />
          // </TouchableOpacity>
          <TouchableOpacity onPress={toggleVideo} style={styles.iconButton}>
            <Icon
              name={isVideoMuted ? 'videocam-off' : 'videocam'}
              size={36}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  remoteUserContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  localUserContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 26,
    //left: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  iconButton: {
    // marginRight: 24,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 36,
  },
  acceptCallButton: {
    backgroundColor: 'lightgreen',
    padding: 16,
    borderRadius: 36,
  },
  iconContainer: {
    top: 100,
    alignItems: 'center',
    position: 'absolute',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  video: {
    flex: 1,
  },
  localCam: {
    height: '50%',
    width: '100%',
    backgroundColor: 'red',
  },
  remoteCam: {
    height: '50%',
    width: '100%',
    backgroundColor: 'blue',
  },
});

export default CallScreen;
