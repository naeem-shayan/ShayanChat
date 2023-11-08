export const sendPushNotification = async (token: any, data: any,) => {
    const FIREBASE_API_KEY = "AAAAAjTI5Dw:APA91bEfu1s5g62yLOQrVG4YP6TiSlrsZyIKNv8thVRewvfqv1EYn7kfVPNxYBlJbWJf7y9f2NW8R52DJC9AiH7hC3F7QwZt-ifrCCabgGchYAvGf9Qx3gGslzCjteA-6qTvz5qVwnV7"
    const message = {
      registration_ids: [
        `${token}`,
      ],
      notification: {
        title: data?.title,
        body: data?.body,
        vibrate: 1,
        sound: 1,
        show_in_foreground: true,
        priority: "high",
        content_available: true,
      },
      data,
    }
  
    let headers = new Headers({
      "Content-Type": "application/json",
      Authorization: "key=" + FIREBASE_API_KEY,
    })
  
    let response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers,
      body: JSON.stringify(message),
    })
    response = await response.json()
  }