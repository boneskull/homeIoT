<h1>Cognitive Real-Time IoT</h1>
<h2>Voice Controlled Lights Over the Web</h2>
<h3>Introduction</h3>

This example demonstrates how you can control physical devices through natural voice commands over the Web in real time. For the physical device I used a reading lamp, but as you'll see, it can be any electric device, really.

In my simple scenario I control the lights in 4 rooms of a house.
I use a Web app on my computer to give free form voice commands (it could be a mobile app just as easily). The voice command is then converted to text in the cloud by IBM's cognitive engine, Watson. After processing the text, I identify the action(s) that need(s) to be taken. The action is then submitted to control the lights, and is published to the monitoring clients for real-time monitoring.

Let's cut to the chase and watch what it all looks like:

<a href="https://www.youtube.com/watch?v=CaxVSgmtYtU"><img src="/img/video.png"
alt="A cognitive real-time IoT Demo" width="600"/></a>

<h2>Behind the Scenes</h2>

To make this demonstration happen, I used the <a href="https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html">IBM Watson speech-to-text Bluemix service</a>, <a href="http://kaazing.com">AMQP over WebSocket from Kaazing</a> for event-driven real-time monitoring, and the <a href="http://www.belkin.com/us/p/P-F7C027/">Belkin WeMo Switch</a> in conjunction with <a href="http://ifttt.com">IFTTT</a> for controlling the switch remotely.

Here's the high-level overview of most of the moving pieces (without monitoring):

<img width="800" src="/img/HomeIoTDiagram1.png">

When I press the "talk" button in the browser window, the red light comes on, indicating that recording is in progress. The voice data is streamed over a WebSocket connection to the <a href="https://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html">IBM Bluemix Watson speech-to-text service</a>, and the resulting string is returned to the browser, displayed under the red light.

<img width="600" src="/img/speech.png">

Once the action is figured out, the client recording the human voice publishes it both to the <a href="http://wemo.com">Belkin WeMo</a> device(s), and to the monitoring client(s). The former is performed in the form of HTTP REST calls through <a href="http://iftt.com">IFTTT</a>, the latter as WebSocket messages over AMQP pub/sub, using the cloud-hosted AMQP WebSocket server by <a href="Kaazing">http://kaazing.com</a>.

Here's the complete diagram, this time with the real-time monitoring included as well:

<img width="800" src="/img/HomeIoTDiagram2.png">


The WebSocket connections, marked as WSS on the diagrams above for WebSocket Secure, are long lasting full-duplex connections, supporting low-latency streaming of data.

To learn more about how I integrated Watson Text-to-Speech, event-driven pub/sub communication over WebSocket, how I connected the Belkin WeMo light switch along with latency characteristics, <a href="http://petermoskovits.com/posts/cognitive-realtime-iot">check out my detailed blog post</a>.
