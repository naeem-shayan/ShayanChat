//import liraries
import React, {Component, useState} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../Contants/Colors';
import QB from 'quickblox-react-native-sdk';
import WebRTCView from 'quickblox-react-native-sdk/RTCView';
import {useSelector} from 'react-redux';

// create a component
const IncommingCall = ({
  call,
  timer = 0,
  rejectCall,
  endCall,
  answerCall,
}: any) => {
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVolumeMuted, setVolumeMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);

  const user = useSelector((state: any) => state.user);

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
      })
      .catch(e => {
        /* handle error */
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

  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true}>
      <View style={styles.container}>
        <View style={styles.localCam}>
          <WebRTCView
            mirror={true}
            sessionId={call?.id}
            style={styles.video}
            userId={user?.id}
          />
        </View>
        <View style={styles.remoteCam}>
          <WebRTCView
            sessionId={call?.id}
            style={styles.video}
            userId={call?.initiatorId}
          />
        </View>
        {/* {call && (
          <View style={styles.localUserContainer}>
            <WebRTCView
              mirror={true}
              sessionId={call?.id}
              style={styles.video}
              userId={user?.id}
            />
          </View>
        )}
        {call && (
          <View style={styles.remoteUserContainer}>
            <WebRTCView
              sessionId={call?.id}
              style={styles.video}
              userId={call?.initiatorId}
            />
          </View>
        )} */}
        {!call && (
          <View style={styles.iconContainer}>
            <Icon name="phone-callback" size={100} color={Colors.firstColor} />
            <Text style={{color: Colors.white}}>
              {call ? 'In Call' : 'Incomming Call ...'}
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

          <TouchableOpacity
            onPress={call ? endCall : rejectCall}
            style={styles.endCallButton}>
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

          {!call && (
            <TouchableOpacity
              onPress={answerCall}
              style={styles.acceptCallButton}>
              <Icon name="call-end" size={36} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// define your styles
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  remoteUserContainer: {
    // position: 'absolute',
    // top: 16,
    // left: 16,
    height: '100%',
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#333',
    zIndex: -1,
  },
  localUserContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: 'red',
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
    //marginRight: 24,
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
  videoLocal: {
    width: 120,
    height: 160,
    backgroundColor: 'red',
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

//make this component available to the app
export default IncommingCall;
