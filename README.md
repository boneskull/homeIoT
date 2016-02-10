# Voice Controlled Lights Over the Web
### A Real-Time IoT Solution

This example demonstrates how you can control physical devices, such as lights, through natural voice commands over the Web.

![Real-Time Home IoT Demo](/img/RealTimeHomeIoT.gif)

**Technologies used:**

- [IBM Watson speech-to-text Bluemix service](https://console.ng.bluemix.net/catalog/services/speech-to-text)
- [Kaazing AMQP Sandbox cloud service](http://kaazing.org/blog/public-websocket-sandbox/)
- [Kaazing WebSocket Gateway Unified Client](https://github.com/kaazing/universal-client) - AMQP 0-9-1: for real-time pub/sub communication over WebSocket
- Node.js
- Docker

## IBM Watson Speech-to-Text
To run this demo, you have to acquire Bluemix service credentials for the Watson Speech2Text service. To do so, sign up for Bluemix (free trial account), locate the Watson Speech2Text service, and select Add Credentials.

![Bluemix service credentials](/img/BluemixWatsonSpeech2TextCredentials.png)

## Technical Challenges with Microphone Access
### Google Chrome Microphone Access over HTTPS only
[As of Chrome 47](https://developers.google.com/web/updates/2015/10/chrome-47-webrtc?hl=en), `getUserMedia()` requests are only allowed from secure origins: HTTPS or localhost. Therefore, for this demonstration to work, we use a self-signed certificate, located in the `/keys` directory.

### No Access to Microphone from Mobile Safari
[Safari on iOS](http://mobilehtml5.org/) doesn't support `getUserMedia()`, thus HTML5 apps have no access to the microphone. The part of the demo requiring microphone has to be run from a desktop browser, e.g. Chrome.

## Docker commands

```
$> docker run -p 8001:3001 -e "WATSON_BLUEMIX_UN=<your_un>" -e "WATSON_BLUEMIX_PW=<your_pw>"  pmoskovi/homeiot
```

E.g.:

```
$> docker run -p 8001:3001 -e "WATSON_BLUEMIX_UN=9b6f1d7f-93fd-4901-8178-c02fc1b52081" -e "WATSON_BLUEMIX_PW=CsNg1PiQzz0z"  pmoskovi/homeiot
```
Be sure to use the _IP address assigned to your VirtualBox VM_, the _port_ specified above (8001 in our example), as well as _https_ as the protocol in the address bar.

If you're not sure what your IP address is, run the following command:
```
$> docker-machine ip default
192.168.99.100
```
**https://192.168.99.100:8001**

The command that was used to build the Docker image:

```
$> docker build -t pmoskovi/homeiot .
```

![Interface to issue voice commands](/img/ControlLights.png)
![Interface to monitor the system](/img/MonitorLights.png)
