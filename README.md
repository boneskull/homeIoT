# Cognitive Real-Time IoT: A Marriage Made in Heaven
## Voice Controlled Lights Over the Web
### Introduction

This example demonstrates how you can control physical devices through natural voice commands over the Web in real time. For the physical device I used a reading lamp, but as you'll see, it can be any electric device, really.

In my simple scenario I control the lights in 4 rooms of a house.
I use a Web app on my computer to give free form voice commands (it could be a mobile app just as easily). The voice command is then converted to text in the cloud by IBM's cognitive engine, Watson. After processing the text, I identify the action(s) that need(s) to be taken. The action is then submitted to control the lights, and is published to the monitoring clients for real-time monitoring.

Let's cut to the chase and watch what it all looks like:

<a href="https://www.youtube.com/watch?v=CaxVSgmtYtU"><img src="/img/video.png"
alt="A cognitive real-time IoT Demo" width="600"/></a>

To make this demonstration happen, I used the <a href="https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html">IBM Watson speech-to-text Bluemix service</a>, <a href="http://kaazing.com">AMQP over WebSocket from Kaazing</a> for event-driven real-time monitoring, and the <a href="http://www.belkin.com/us/p/P-F7C027/">Belkin WeMo Switch</a> in conjunction with <a href="http://ifttt.com>IFTTT</a> for controlling the switch remotely.

Here's the high-level overview of most of the moving pieces (without monitoring):

<img width="800" src="/img/HomeIoTDiagram1.png">

When I press the "talk" button in the browser window, the red light comes on, indicating that recording is in progress. The voice data is streamed over a WebSocket connection to the [IBM Bluemix Watson speech-to-text service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html), and the resulting string is returned to the browser, displayed under the red light.

<img width="600" src="/img/speech.png">

Once the action is figured out, the client recording the human voice publishes it both to the [Belkin WeMo](http://wemo.com) device(s), and to the monitoring client(s). The former is performed in the form of HTTP REST calls through [IFTTT](http://iftt.com), the latter as WebSocket messages over AMQP pub/sub, using the cloud-hosted AMQP WebSocket server by [Kaazing](http://kaazing.com).

Here's the complete diagram, this time with the real-time monitoring included as well:

<img width="800" src="/img/HomeIoTDiagram2.png">


The WebSocket connections, marked as WSS on the diagrams above for WebSocket Secure, are long lasting full-duplex connections, supporting low-latency streaming of data.

**Technologies used:**

- [IBM Watson speech-to-text Bluemix service](https://console.ng.bluemix.net/catalog/services/speech-to-text)
- Kaazing
 - [WebSocket cloud service - AMQP](http://kaazing.org/blog/public-websocket-sandbox/)
 - [Kaazing WebSocket Gateway Unified Client](https://github.com/kaazing/universal-client) - AMQP 0-9-1: for real-time pub/sub communication over WebSocket
- [Belkin WeMo Switch](http://www.belkin.com/us/p/P-F7C027/)
- [IFTTT - If This Than That](http://ifttt.com/)
- Node.js
- Docker

## Getting Started with IBM Watson Speech-to-Text
To run this demo, you have to acquire Bluemix service credentials for the [Watson Speech2Text service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html). To do so, sign in to (or sign up for) Bluemix (free trial account), locate the Watson Speech2Text service, and select Add Credentials.

![Bluemix service credentials](/img/BluemixWatsonSpeech2TextCredentials.png)

The best way to learn more about the Watson Speech-to-Text service is by checking out this [pretty incredible demo](https://speech-to-text-demo.mybluemix.net/).

## Technical Challenges with Microphone Access
I wanted to make this example as generic as possible, so the client controlling the light, as well as the monitoring experience are all Web clients. As a result of (or despite) it, I ran into a handful of challenges along the way.

### No Access to Microphone from Mobile Safari
[Safari on iOS](http://mobilehtml5.org/) doesn't support `getUserMedia()`, thus HTML5 apps have no access to the microphone. The part of the demo requiring microphone has to be run from a desktop browser, e.g. Chrome.

### Google Chrome Microphone Access over HTTPS only
[As of Chrome 47](https://developers.google.com/web/updates/2015/10/chrome-47-webrtc?hl=en), `getUserMedia()` requests are only allowed from secure origins: HTTPS or localhost. Therefore, for this demonstration to work, we use a self-signed certificate, located in the `/keys` directory. As a result, in Chrome, you'll have to step through the certificate-related warnings. Warnings like this are reason for caution when seen out there in the wild west, but here it simply indicates that the certificate wasn't signed by one of the certificate authorities known to the browser:

<img width="600" src="/img/chromeSelfSignedCert.png">

## Event-driven Real-time Communication Using AMQP Pub/Sub Over WebSocket

The communication between the controller browser and the monitoring browser takes place through a permanent WebSocket connection. For this experiment, I used [Kaazing's universal client](https://github.com/kaazing/universal-client), and selected AMQP 0-9-1 as the pub/sub protocol on top.

**Note:** The two APIs/protocols Kaazing currently offers as part of their universal client implementation is AMQP and JMS. I picked AMQP, as Kaazing hosts a publicly available pretty much unlimited AMQP service for general consumption (but not a JMS one).

![Kaazing Unversal Client](/img/KaazingUniversalClients.png)

Kaazing hosts a freely available server that they call *sandbox*. The URL to access their service is: `wss://sandbox.kaazing.net/amqp091`. To try it out, take a look at the [JavaScript AMQP messaging example](http://kaazing.org/demos/ampq091-messaging-javascript).


**Shameless plug**: If you want to learn more about the WebSocket technology, protocol layering, pub/sub and more, check out my book, [The Definitive Guide to HTML5 WebSocket](http://petermoskovits.com/posts/websocket-book.html).

<a href="http://petermoskovits.com/posts/websocket-book.html"><img width="200" src="/img/websocketbook.png"></a>


### About the AMQP/WebSocket code

Let's take a brief look at how the event-driven communication takes place between the browser clients.
Upon successful loading of the HTML document, the browser connects to the WebSocket server:

```
client.connect(url, username, password, topicP, topicS, noLocal, handleMessage, handleWebSocketError, logWebSocketMessage, onWebSocketConnected);
```

The last four parameters in the above `client.connect()` are callback functions invoked when a new message arrives, an error occurs, logging is needed, and the WebSocket connection has been established, respectively.

As an example, here's what `onWebSocketConnected()` looks like. It initializes the

```
var onWebSocketConnected = function () {
  initHome();
};
```

The value of the other parameters looks as follows:

```
// WebSocket connection info
var url = 'wss://sandbox.kaazing.net/amqp091';
var username = 'guest';
var password = 'guest';
var topicP = 'demo_exchange';
var topicS = 'demo_exchange';
var noLocal = true;
var client = UniversalClientDef('amqp');
```

To send messages, the `client.sendMessage(msg)` function has to be invoked. The purpose of this call is to inform all the interested (monitoring) clients about the latest state of the lights in our home.

## Controlling the light with WeMo & IFTTT

To control (power it on/off, that is) the light (or any other electric device)
<img src="/img/ifttt.png">

To connect the Wemo Switch to IFTTT, you have to walk through the following steps:

1. **Choose Trigger Channel**: select Maker. The Maker channel allows you to use an HTTP/REST call to trigger the switch event.
<img width="600" src="/img/ifttt-wemo1.png">

2. **Choose a Trigger**: As we picked Maker in Step 1., here the only option available to us is **Receive a web request**.
<img width="600" src="/img/ifttt-wemo2.png">

3. **Complete Trigger Fields**: Here we have to provide a name for the event. For us it makes sense to include the name of the room, and whether we switch the light On or Off. For example: KitchenSwitchOn
<img width="600" src="/img/ifttt-wemo3.png">

4. **Choose Action Channel**: We got to the triggered event part. Here, by searching for *wemo*, you get to see all the Belkin WeMo devices. I use the WeMo Switch, highlighted in the picture.
![iftttt-wemo](/img/ifttt-wemo4.png)

5. **Choose an Action**: For the WeMo Switch there are 5 actions to choose from: turn on, turn off, turn on then off, turn off then on, and toggle on/off. As we'll send explicit on/off messages to our device, we select *Turn on* for the KitchenSwitchOn event.
![iftttt-wemo](/img/ifttt-wemo5.png)

6. **Complete Action Fields**: In this step we have to select which switch we want to activate. I named my switch *Peter Kitchen*.
![iftttt-wemo](/img/ifttt-wemo6.png)

7. **Create and connect**: Confirm the title of the recipe, and click *Create Recipe*.
![iftttt-wemo](/img/ifttt-wemo7.png)

### Connecting the IFTTT Maker channel with a REST call
During the creation of the IFTTT recipe, IFTTT doesn't give you the URL you need to invoke to trigger the action. To get the URL, point your browser to ```https://ifttt.com/maker```.

![IFTTT key and URL](/img/iftttMakerChannel.png)

The two URLs to trigger the action look like this:
```https://maker.ifttt.com/trigger/KitchenSwitchOff/with/key/<your key>```
```https://maker.ifttt.com/trigger/KitchenSwitchOn/with/key/<your key>```

If you want to test it from the command line, here's the curl command for your convenience:

```curl -X POST https://maker.ifttt.com/trigger/KitchenSwitchOff/with/key/<your key>```

#### The latency of controlling the WeMo Switch
As you can see in the recording above, the monitoring dashboard and the control screen keep in sync with amazing accuracy. Kaazing made their name in the industry by providing virtually unlimited horizontal scale, while keeping the latency to an absolute minimum.

When it comes to controlling the light, the picture is a quite different.

From a network connectivity perspective there are 3 ways to control your WeMo Switch. The method you use affect the latency big time.
- _**WeMo mobile app**, while **on the same LAN/WiFi**_: The latency is not noticeable, it feels real-time. My feel is that it's in the 100-200ms range.
- _**WeMo mobile app**, remotely **through the public Web/cloud**_: For this test I connected my phone through a different WiFi. The control request goes out to the Belkin cloud first, and then comes back into the house. The latency is in the ballpark of 1-2 seconds.
- _**REST call**, through **IFTTT Maker Channel**_: When invoking the URLs above, the latency is in the 5-10 second range. It's hard to tell whether the latency is introduced on the Belkin side or by IFTTT, but it's very noticeable. This is the one you see in the video above.

### Miscellanous

#### Resetting the WeMo Switch to Factory Defaults
As I was playing with the router settings of the WeMo Switch, it turned out the biggest challenge was resetting it to factory defaults. The instructions are talking about the reset button, but it took me a looong time to realize that the reset button is well hidden on the top (or bottom, depending on how your 110V socket is installed) of the device.

Even after a successful reset, connecting to the WiFi router has been a painful (and repetitive) experience. Users are complaining about it in the forums quite a bit.

#### Personal Hotspot as the WiFi router for WeMo
Also, I tried it hard, really hard, to get the WeMo to connect to my iPhone's Personal Hotspot WiFi, but no luck. Since I use the WeMo quite a bit on the go while I do demos, I ended up connecting it to my (T-)mobile hotspot.

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
