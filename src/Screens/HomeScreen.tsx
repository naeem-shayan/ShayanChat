import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Divider, List} from 'react-native-paper';

import {chatkitty, channelDisplayName} from './../ChatKitty';
import Loading from '../Components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatThread from '../Components/chatThread';
import Colors from '../Contants/Colors';

export default function HomeScreen({navigation}: any) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const isFocused = useIsFocused();

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
      setUser(userData);
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getData();
    let isCancelled = false;
    chatkitty.listChannels({filter: {joined: true}}).then((result: any) => {
      if (!isCancelled) {
        setChannels(result.paginator.items);

        if (loading) {
          setLoading(false);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isFocused, loading]);

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => item.id.toString()}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({item}: any) => (
          <ChatThread
            item={item}
            user={user}
            name={channelDisplayName(item, user?.id)}
            onPress={() => navigation.navigate('Chat', {channel: item})}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
    paddingHorizontal: 15,
  },
  listTitle: {
    fontSize: 22,
  },
  listDescription: {
    fontSize: 16,
  },
});
