# LocoThrottleJS

[![Join the chat at https://gitter.im/k4kfh/LocoThrottleJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/k4kfh/LocoThrottleJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

#PLEASE READ THIS FIRST PARAGRAPH BEFORE DOING ANYTHING WITH THIS!
This project is still HEAVILY under development as of 6/4 2015. I am working on getting a mostly-realistic physics system, then I will likely release the first dev version. Right now, the only reason it's on GitHub is to allow people to help me with the physics system, and to keep track of my changes for my own sake. I eventually hope to make this so intuitive anyone can download/use it, but that day is not today. When a version that is even remotely usable is available, I will update this README. Until then, you're welcome to try it, just know that it probably will not do a danged thing right! :P

## What is LocoThrottleJS

### Short answer:
It's a software to make controlling model trains more realistic, challenging, prototypically accurate, and most of all, more FUN! It allows you to realistically notch the throttle, handle the air brakes, deal with momentum, feel the behavior of different loads on your train, and even follow a prototypical prime mover startup process! It's all built to be universal; it runs in a web browser and connects to your layout using JMRI. It is DCC-system agnostic, and it will offer minimal functionality with ANY DCC decoder, and WORLDS of new functions with "supported" DCC decoders. Read on to find out what "supported" means.

### Long answer:

## What is the goal of the program?
To offer every model railroader an experience as close as they can get to driving the prototype locomotive. I want you to feel if you got any closer to the real thing, you'd either be driving a real train, or using Bruce Kingsley's "Ultimate Throttle". I want that experience, and I want to share it with everyone else.

## Why did you make this?
If you know about how real diesel locomotives work, you know there's much more to driving one than a simple speed knob and a direction switch. Model trains, however, not so much. They have their speed adjusted with a single value, which is rather unrealistic, and makes getting a model train moving "too easy" compared to the real deal. After seeing Bruce Kingsley's "Ultimate DCC Throttle" project, I was inspired to try and make such an experience more accessible to the model railroading community.

## What exactly does it do?
Instead of offering a single speed slider, like nearly every model railroad throttle does, LocoThrottleJS gives you the real thing. Want to make your train move? You'll have to release the brakes, and notch up the throttle. It's just like driving a real locomotive! We are constantly improving the physics system, and I have plans to add a track-grade sensing option (probably for layouts using Lenz's new RailCOM standard for readback, but we're not sure yet), and make the train behave differently based on the weight of the cars behind it.

## How does it work?
LocoThrottleJS is a web app. It's built guarunteed to work in Google Chrome (that's what I use to test it) but there's no reason it shouldn't work in other browsers. It runs entirely client side, and uses WebSockets to communicate with your layout via the popular JMRI software. If you can control your layout with JMRI, chances are you can use LocoThrottleJS with it.

I designed the program from the ground up to be modular: the core of the program is completely decoder-agnostic. There is only one file that is decoder specific, and it acts as a translator for the rest of the program to talk to your DCC decoder. That means it's super easy to enable your decoder to do more than just speed and direction control.

## I'm a model railroader and a geek. How can I help?
One of the hardest things for this project (short of the physics engine) is supporting all the different decoder models, and possible sound file configurations out there. If you have a decoder/sound project that isn't supported to absolute perfection, chances are I could use your input! I obviously don't have access to every DCC decoder/sound project, so I can only support the ones I can actually test. That's where the community comes in!

## I'm a model railroader but I'm not fluent in geek speak. How can I help?
Get together with some geeks, and help support more decoders and sound files! If you have the decoder, chances are there is someone willing to work with you to support it, as long as you're willing to give them some information and let them test things with your decoder. The more decoders we support, the more people can get the best experience from this software! You don't have to be a computer nerd to help out with that!

# I found a problem!
Thank you! Post it in the "Issues" section here, and myself and other developers will try to work with you to get the issue with the program solved. We WANT you to tell us what's wrong!

# I have an idea for a feature!
Cool! Post that in the "Issues" section here too! If enough people are interested, we'll try and implement it. Better yet, if you're a dev, implement it yourself, and we'll probably be much more likely to add it.
