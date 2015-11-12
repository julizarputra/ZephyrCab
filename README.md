# locoThrottle.js

[![Join the chat at https://gitter.im/k4kfh/LocoThrottleJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/k4kfh/LocoThrottleJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

locoThrottle.js is an HTML/CSS/JavaScript app that is designed to simulate prototypically accurate controls for model trains. It communicates with your layout using JMRI's JSON WebSockets servlet, which is built into the JMRI web interface.

> Note: This project is still heavily under development. It is not recommended to try to use the project unless you are the adventurous type, and/or you understand JavaScript/JSON and are willing to tinker.
>
> Read more on [my blog.](http://evilgeniustech.com/tag/locothrottlejs/)

## Installation

### Prerequisites

- Understand very basic JSON/JavaScript syntax
- A simple web server. lighttpd, nginx, Apache, or JMRI's built in web server should all work fine.
- A layout connected to JMRI with the JMRI JSON WebSockets service enabled

The simplest way to install locoThrottle.js is to download the ZIP from this page and extract it onto a web server of your choice. There is no server-side code, so you do not need a sophisticated web server to run it. Once you have extracted it to a directory of your choice, see the setup procedure below.

## Setup

When you install locoThrottle.js, you'll need to edit the `bundles.json` file. This file is responsible for linking JMRI roster entries with specific models (for example, the Athearn Genesis GP15-1) and with the correct prototype locomotive (for example, the EMD SD40-2). We are working on an article on how to edit this file properly, but until then you should see the comments in the file.

## Usage

When you first log in after setting up `bundles.json`, you'll need to connect to your JMRI PC. You can do this by inputting the IP of the PC, with the port of the JMRI web interface. By default, locoThrottle.js uses port 12080, which is the default for JMRI.

![Connection Settings in locoThrottle.js](http://evilgeniustech.com/wp-content/uploads/2015/11/connectionsettings.png)

Once you have connected to your JMRI PC, you'll need to visit the "Train Settings" tab. There, you'll set up your train by adding the locomotive(s) and cars you wish to use. You need to add the cars as well if you want the load to be simulated by the physics engine.

Unfortunately, with the current rapidly changing state of the "Train Settings" and "Cab" tabs, we cannot provide instructions for these at this time. The best thing you can do is tinker with it to see what you can get working. Enjoy!
