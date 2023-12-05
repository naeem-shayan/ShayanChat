import Slider from '@react-native-community/slider';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';

const AudioPlayer = ({msg, user, start, setStart}: any) => {
  const progress = useProgress();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const durationString = msg?.properties?.duration || '00:00';
  const [minutesString, secondsString] = durationString.split(':');
  const minutes = parseInt(minutesString, 10);
  const seconds = parseInt(secondsString, 10);

  useEffect(() => {
    if (isPlaying && progress.position > 0) {
      setAudioLoading(false);
      if (progress.position >= progress.duration) {
        TrackPlayer.reset();
        setIsPlaying(false);
        setStart(null);
      }
    }
  }, [progress.position]);

  const onStartPlay = async (id: any) => {
    setStart(id);
    setIsPlaying(false);
    setAudioLoading(true);
    await TrackPlayer.reset();
    await TrackPlayer.add({
      url: `${msg?.properties?.url}`,
      artist: `${id}`,
      id: `${id}`,
      title: 'Chat Audio Playing',
      genre: 'Phish',
    });
    await TrackPlayer.play();
    setIsPlaying(true);
  };

  const onPausePlay = async () => {
    await TrackPlayer.pause();
    setIsPlaying(false);
  };

  const onPlay = async () => {
    await TrackPlayer.play();
    setIsPlaying(true);
  };

  const handleSeek = async (value: any) => {
    await TrackPlayer.seekTo(value);
  };

  return (
    <View
      style={
        msg.senderId === user?.id
          ? styles.container
          : {
              ...styles.container,
              alignSelf: 'flex-start',
              backgroundColor: 'lightgray',
            }
      }>
      {msg?.body == 'loading' ? (
        <ActivityIndicator color={Colors.white} size={'small'} />
      ) : (
        <>
          {audioLoading && start == msg?.id ? (
            <ActivityIndicator
              color={
                msg.senderId === user?.id ? Colors.white : Colors.firstColor
              }
              size={'small'}
            />
          ) : (
            <>
              {start == msg?.id ? (
                <Icon
                  name={isPlaying ? 'pause' : 'play'}
                  size={30}
                  color={
                    msg.senderId === user?.id ? Colors.white : Colors.firstColor
                  }
                  onPress={isPlaying ? onPausePlay : onPlay}
                />
              ) : (
                <Icon
                  name="play"
                  size={30}
                  color={
                    msg.senderId === user?.id ? Colors.white : Colors.firstColor
                  }
                  onPress={() => onStartPlay(msg?.id)}
                />
              )}
            </>
          )}
          <Slider
            style={styles.slider}
            thumbTintColor={
              msg.senderId === user?.id ? Colors.white : Colors.firstColor
            }
            minimumValue={0}
            maximumValue={progress.duration}
            value={start == msg?.id ? progress.position : 0}
            step={0.5}
            onValueChange={handleSeek}
          />
          {start == msg?.id && (
            <Text
              style={{
                ...styles.duration,
                color:
                  msg.senderId === user?.id ? Colors.white : Colors.firstColor,
              }}>
              {`${minutes < 10 ? `0${minutes}` : minutes} : ${
                seconds < 10 ? `0${seconds}` : seconds
              }`}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.firstColor,
    width: '60%',
    height: mvs(50),
    borderRadius: mvs(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: mvs(16),
    alignSelf: 'flex-end',
    marginVertical: 4,
  },
  slider: {
    width: '100%',
    marginLeft: mvs(10),
  },
  duration: {
    fontSize: mvs(12),
    position: 'absolute',
    bottom: mvs(6),
    right: mvs(24),
    fontWeight: 'bold',
  },
});

export default AudioPlayer;
