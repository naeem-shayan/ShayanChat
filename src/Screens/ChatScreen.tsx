import React, {useContext, useEffect, useState} from 'react';
import {Avatar, Bubble, GiftedChat} from 'react-native-gifted-chat';

import {chatkitty, channelDisplayName} from '../ChatKitty';
import Loading from '../Components/loading';
import {AuthContext} from '../Context/authProvider';

export default function ChatScreen({route}: any) {
  const {user}: any = useContext(AuthContext);
  const {channel} = route.params;

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
  }

  function renderBubble(props: any) {
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
    return <Avatar {...props} onPressAvatar={avatarUser => {}} />;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={handleSend}
      user={mapUser(user)}
      renderBubble={renderBubble}
      renderAvatar={renderAvatar}
    />
  );
}

function mapMessage(message: any) {
  return {
    _id: message.id,
    text: message.body,
    createdAt: new Date(message.createdTime),
    user: mapUser(message.user),
  };
}

function mapUser(user: any) {
  return {
    _id: user.id,
    name: user.displayName,
    avatar: user.displayPictureUrl,
  };
}
