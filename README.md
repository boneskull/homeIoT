# Machine Learning, Real-Time Web & IoT: A Marriage Made in Heaven
## Voice Controlled Lights Over the Web
### About

This solution demonstrates how you can control physical devices through natural voice commands over the Web in real-time. In this example I used a reading lamp, but as you'll see, it can be any electric device, really.

To make this demonstration possible, I used the IBM Watson speech-to-text Bluemix service, AMQP over WebSocket from Kaazing for event-driven real-time monitoring, and Belkin WeMo Switch in conjunction with IFTTT for controlling the switch remotely.

Here's the high-level overview of most of the moving pieces:

![Simplified architecture diagram](/img/HomeIoTDiagram1.png)

And here's the complete diagram, this time with the real-time monitoring included as well:

![Architecture diagram](/img/HomeIoTDiagram2.png)

### Show Me

In the animated GIF below I give voice commands through the browser on the left. When I press the "talk" button, the red light comes on. You can see the voice commands interpreted by the IBM Bluemix Watson service, and displayed in the browser under the red light.

On the right hand side you see two browser Windows, a Chrome and a Safari, both monitoring the state of the house. The controller and the monitoring browsers are connected through a long-lasting WebSocket connection, leveraging the publicly available Kaazing WebSocket AMQP sandbox service.

Last, to control the actual physical lights, I used [Belkin's WeMo Switch](http://www.belkin.com/us/p/P-F7C027/). Lights are turned on/off by sending control messages through [IFTTT (If This Than That)](http://ifttt.com/).

![Real-Time Home IoT Demo](/img/RealTimeHomeIoT.gif)

**Technologies used:**

- [IBM Watson speech-to-text Bluemix service](https://console.ng.bluemix.net/catalog/services/speech-to-text)
- Kaazing
 - [WebSocket cloud service - AMQP](http://kaazing.org/blog/public-websocket-sandbox/)
 - [Kaazing WebSocket Gateway Unified Client](https://github.com/kaazing/universal-client) - AMQP 0-9-1: for real-time pub/sub communication over WebSocket
- [Belkin WeMo Switch](http://www.belkin.com/us/p/P-F7C027/)
- [IFTTT - If This Than That](http://ifttt.com/)
- Node.js
- Docker

## IBM Watson Speech-to-Text
To run this demo, you have to acquire Bluemix service credentials for the [Watson Speech2Text service](https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html). To do so, sign up for Bluemix (free trial account), locate the Watson Speech2Text service, and select Add Credentials.

![Bluemix service credentials](/img/BluemixWatsonSpeech2TextCredentials.png)

The best way to learn more about the Watson Speech-to-Text service is by checking out this [pretty incredible demo](https://speech-to-text-demo.mybluemix.net/).

## Technical Challenges with Microphone Access
I wanted to make this example as generic as possible, so the client controlling the light, as well as the monitoring experience are all Web clients. As a result of (or despite) it, I ran into a handful of challenges along the way.

### Google Chrome Microphone Access over HTTPS only
[As of Chrome 47](https://developers.google.com/web/updates/2015/10/chrome-47-webrtc?hl=en), `getUserMedia()` requests are only allowed from secure origins: HTTPS or localhost. Therefore, for this demonstration to work, we use a self-signed certificate, located in the `/keys` directory. As a result, in Chrome, you'll have to step through the certificate-related warnings:

### No Access to Microphone from Mobile Safari
[Safari on iOS](http://mobilehtml5.org/) doesn't support `getUserMedia()`, thus HTML5 apps have no access to the microphone. The part of the demo requiring microphone has to be run from a desktop browser, e.g. Chrome.

## Event-driven Real-time Communication Using AMQP Pub/Sub Over WebSocket

The communication between the controller browser and the monitoring browser takes place through a permanent WebSocket connection. For this experiment, I used [Kaazing's universal client](https://github.com/kaazing/universal-client), and selected AMQP 0-9-1 as the pub/sub protocol on top.

**Note:** The two APIs/protocols Kaazing currently offers as part of their universal client implementation is AMQP and JMS. I picked AMQP, as Kaazing hosts a publicly available pretty much unlimited AMQP service for general consumption (but not a JMS one).

![Kaazing Unversal Client](/img/KaazingUniversalClients.png)

Kaazing hosts a freely available server that they call *sandbox*. The URL to access their service is: `wss://sandbox.kaazing.net/amqp091`. To try it out, take a look at the [JavaScript AMQP messaging example](http://kaazing.org/demos/ampq091-messaging-javascript).

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
![ifttt](/img/ifttt.png)

To connect the Wemo Switch to IFTTT, you have to walk through the following steps:

1. **Choose Trigger Channel**: select Maker. The Maker channel allows you to use an HTTP/REST call to trigger the switch event.
![iftttt-wemo](/img/ifttt-wemo1.png)

2. **Choose a Trigger**: As we picked Maker in Step 1., here the only option available to us is **Receive a web request**.
![iftttt-wemo](/img/ifttt-wemo2.png)

3. **Complete Trigger Fields**: Here we have to provide a name for the event. For us it makes sense to include the name of the room, and whether we switch the light On or Off. For example: KitchenSwitchOn
![iftttt-wemo](/img/ifttt-wemo3.png)

4. **Choose Action Channel**: We got to the triggered event part. Here, by searching for *wemo*, you get to see all the Belkin WeMo devices. I use the WeMo Switch, highlighted in the picture.
![iftttt-wemo](/img/ifttt-wemo4.png)

5. **Choose an Action**: For the WeMo Switch there are 5 actions to choose from: turn on, turn off, turn on then off, turn off then on, and toggle on/off. As we'll send explicit on/off messages to our device, we select *Turn on* for the KitchenSwitchOn event.
![iftttt-wemo](/img/ifttt-wemo5.png)

6. **Complete Action Fields**: In this step we have to select which switch we want to activate. I named my switch *Peter Kitchen*.
![iftttt-wemo](/img/ifttt-wemo6.png)

7. **Create and connect**: Confirm the title of the recipe, and click *Create Recipe*.
![iftttt-wemo](/img/ifttt-wemo7.png)

### Resetting the Wemo Switch to Factory Defaults
As I was playing with the router settings of the Wemo Switch, it turned out the biggest challenge was resetting it to factory defaults. The instructions are talking about the reset button, but it took me a looong time that the reset button is well hidden on the top (or bottom, depending on how your 110V socket is installed) of the device.
I tried hard, really hard, to get it to connect to my iPhone's Personal Hotspot WiFi, but no luck. Since I use it quite a bit on the go while I do demos, I ended up connecting it to my (T-)mobile hotspot.

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
