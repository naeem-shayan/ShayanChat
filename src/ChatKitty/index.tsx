import ChatKitty from '@chatkitty/core';

export const chatkitty = ChatKitty.getInstance(
  '58eb6b30-0e3a-4747-9322-00e94f3b4f51',
);

export function channelDisplayName(channel: any, id: any) {
  if (channel.type === 'DIRECT') {
    //return channel.members.map((member: any) => member.displayName).join(', ');
    return channel.members.filter((member: any) => member.id != id)[0]
      ?.displayName;
  } else {
    return channel.name;
  }
}

export function checkUserStatus(channel: any, id: any) {
  if (channel.type === 'DIRECT') {
    return channel.members.filter((member: any) => member.id != id)[0]?.presence
      .online;
  }
}
