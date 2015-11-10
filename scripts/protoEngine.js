//this contains high level locomotive functions, usually (at least mostly) decoder agnostic. These functions call functions from decoder.js in order to communicate with the locomotive

var actualDirection;
actualDirection = 0;


function setReverser(direction, ignoreNotch) {
    //this if statement replaces the sendcmd function, since its more effective to do custom code here
    if (locoAddress != undefined) {
    var pastReverser = reverser
    var reverserSet = false
    //causes the "ignore the current notch" parameter to default to false, in case a dev forgets it
    if (ignoreNotch == undefined) {
        var ignoreNotch = false
    }
    //basically the same code (with different directions) under 3 different if statements for possible directions
    if (direction == "forward") {
        if (notch == 0) {
            reverser = 1
            console.log("Set reverser to FORWARD")
            reverserSet = true
            updateHTML("reverser")
        }
        else if (ignoreNotch == true) {
            reverser = 1
            console.log("Set reverser to FORWARD")
            reverserSet = true
            updateHTML("reverser")
            }
        
    }
    else if (direction == "reverse") {
        if (notch == 0) {
            reverser = -1
            console.log("Set reverser to REVERSE")
            reverserSet = true
            updateHTML("reverser")
        }
        else if (ignoreNotch == true) {
            reverser = -1
            console.log("Set reverser to REVERSE")
            reverserSet = true
            updateHTML("reverser")
            }
        
    }
    
    else if (direction == "neutral") {
        if (notch == 0) {
            reverser = 0
            console.log("Set reverser to NEUTRAL")
            reverserSet = true
            updateHTML("reverser")
        }
        else if (ignoreNotch == true) {
            reverser = 0
            console.log("Set reverser to NEUTRAL")
            reverserSet = true
            updateHTML("reverser")
            }
        
        
    }
    return reverserSet
    }
    else {
        Materialize.toast("You haven't requested a throttle yet! We can't send any commands to a locomotive until you...um...tell us which one...which you do by requesting a throttle... :P", 4000)
        return false
    }
}

//this is the new high level setnotch function
function setNotch(newNotch) {
    notchDiffABS = Math.abs(notch - newNotch) //this finds the difference between the new and old notches
    if (notchDiffABS == 1) {
        //it's okay to notch up
        notchDiffReal = newNotch - notch //we use this number, negative or positive, to determine which DIRECTION to notch it
        if (notchDiffReal == 1) {
            //notch up
            setNotchCrude("up")
        }
        else if (notchDiffReal == -1) {
            //notch down
            setNotchCrude("down")
        }
    }
    else {
        Materialize.toast("You can only move the throttle one notch at a time.", 4000)
    }
}

//this is the high level notching system. ANYTHING that adjusts the notch should NOT USE THIS. Use setNotch() instead, which is built on top of this. Weird, but it works. It is decoder agnostic because it calls functions from decoder.js, which behave the same across decoders, but the code inside is decoder specific. This allows a simple, unified approach to make the higher level function below work with all decoders that there exists a decoder.js for
//setnotchcrude is called with setNotchCrude(up or down) and it returns the new notch as a number
function setNotchCrude(dowhat) {
    //this if statement takes the place of sendcmdLoco(), since we may be sending several commands within setNotch(). Don't want to make anyone throw their computer out the window because of 6 billion alert() functions!
    if (locoAddress != undefined) {
        if (notchAllowed == true) {
        
        //this if else if... statement checks if we're notching up, down, setting a notch as a number, or resetting the notching. //setting as a number not done yet
        
        if (dowhat == "up") {
            //be sure notches stay within acceptable range
            if(notch < train[0].maxNotch) {
                //notch the sound up, adjust the notch variable
                notch++
                sound_notch("up")
                //call that function from ui.js that can be customized to fit your specific HTML code
                updateHTML("notch")
                //reset the timing wait system of the notch thing
                notchTiming("reset")
            }
        }
        else if (dowhat == "down") {
            //be sure notches stay within acceptable range
            if(notch > 0) {
                //notch the sound down, adjust the notch variable
                notch--
                sound_notch("down")
                updateHTML("notch")
                notchTiming("reset")
                //PROTOENGINE COMMAND HERE
            }
        }
        else if (dowhat == "reset") {
            //this calls all the notching resetting functions, including resetting the sound notch if the locomotive has those
            console.log("Full notching reset by setNotch() BEGIN")
            sound_notch("reset")
            notch = 0
            updateHTML("notch")
            //PROTOENGINE COMMAND HERE
            ProtoEngine_Speed(0)
        }
            
        }
        //if notch isn't allowed, then
        else {
            //if the notch request isnt allowed because of ProtoEngine's timing settings, then run the notchDisallowed()
            notchDisallowed("timing")
        }
        
    }
    else {
        Materialize.toast("You haven't requested a throttle yet! We can't send any commands to a locomotive until you...um...tell us which one...which you do by requesting a throttle... :P", 4000)
    }
return notch;
}



//this can be called with "reset" every time the notch is changed so that it disallows the notch to be changed for protoEngineNotchWait's time
function notchTiming(args) {
    //first IF statement to be sure we're actually throttling a locomotive here
     if (locoAddress != undefined) {
         if(args == "reset") {
          notchAllowed = false
          setTimeout(function() {notchAllowed = true}, train[0].notchWait)
          setTimeout(function() {console.log("Notching allowed again!")}, train[0].notchWait)
         }
         else if (args == "allow") {
             notchAllowed = true
         }
         else if (args == "disallow") {
             notchAllowed = false
         }
        
     }
    //more of failsafe loco check system
    else {
        Materialize.toast("You haven't requested a throttle yet! We can't send any commands to a locomotive until you...um...tell us which one...which you do by requesting a throttle... :P", 4000)
    }
}



//this is what calculates the speed for the locomotive
//this is basically where it all goes down

//the reason all the variables have ARG in front of them is so that inside the function, we can still access global variables that have been set for information about the various things
//basically to prevent 2 variables in different scopes with the same name

//hacky global variable definitions for tinkering
train = []
train.total = {weight:0, maxHP:0, rollingResistance:0}
train.maxSpeeds = []
speedMPH = 0
train.leadLoco = undefined

function protoEngine_accel(ARGnotch, ARGreverser) {
 if (locoAddress != undefined) {
     //rewrite on 9/18/15 to use the new JSON train notation
     train.total = {"maxHP":0, "netForce":0, "rollingResistance":0, "motiveForce":0, "windResistance":0, "resistingForce":0}
     train.total.weight = 0 //reset just in case changes are made, we redo this frequently
     //parses train list and find out which ones are locomotives and which are cars
     for (i = 0; i < train.length; i++) {
         console.log("I is equal to " + i)
         var currentElement;
         currentElement = i;
         train.total.weight = train.total.weight + train[i].weight //go ahead and add this element's weight to the total
         
         if (train[currentElement].type == "rollingstock") {
             
             //TODO: Add the option for rolling stock to have motive force on a grade
             train[currentElement].motiveForce = 0; //all rolling stock has no motive force, obviously
             train.total.motiveForce = train[currentElement].motiveForce + train.total.motiveForce
             //Wind Resistance based on direction
             wind = Math.abs(speedMPH)
             if (actualDirection == 1) {
                 if (i == 0) {
                     //if we're going forward and this element is leading, we must find wind resistance
                     train.total.windResistance = train[currentElement].frontArea * ((wind^2) * 0.00256)
                 }
             }
             else if (actualDirection == -1) {
                 if (i == train.length) {
                     //find wind resistance on this element if it's last and we're going backwards
                     train.total.windResistance = actualDirection * (train[currentElement].frontArea * ((wind^2) * 0.00256))
                 }
             }
             else if (actualDirection == 0) {
                 train.total.windResistance = 0 //if we're stationary, no wind resistance
             }
             
             //Rolling Resistance
             train[currentElement].rollingResistance = actualDirection * (0.001 * train[currentElement].weight); //multiplied by actualDirection so we get the correct value, negative, positive or zero, based on direction
             
             //Net Force
             train[currentElement].netForce = (train[currentElement].motiveForce) - (train[currentElement].rollingResistance);
             train.total.netForce = train.total.netForce + train[currentElement].netForce //add this new net force value to the total net force for the whole train
         }
         
         if (train[currentElement].type == "locomotive") {
             
             //set this loco to the lead loco if we haven't gotten one yet
             if (train.leadLoco == undefined) {
                train.leadLoco = train[currentElement]
             }
             
             
             //motive force
             train[currentElement].outputHP = reverser * (train[currentElement].maxHP * (notch/8)) //find the output horsepower
             if ( (Math.abs(speedMPH) < (Math.abs(train[currentElement].tractiveEffortEquationStart))) ) {
                 //if we haven't passed the set threshold just yet
                 train[currentElement].motiveForce = reverser * (train[currentElement].startingTE * (notch/8))
                 console.log("Using starting TE")
             }
             else if (speedMPH != 0) {
                 //if we have passed it, use the VA tech equation
                 train[currentElement].motiveForce = calculateTractiveEffort((train[currentElement].outputHP), (train[currentElement].weight), (train[currentElement].efficiency), speedMPH)
                 console.log("Using VA Tech Equation")
             }
             train.total.motiveForce = train[currentElement].motiveForce + train.total.motiveForce
             
             //Wind Resistance based on direction
             //TODO - Fix this to use the equation outlined at EngineeringToolbox.com...dunno what kind of drunk crap this is using right now
             wind = Math.abs(speedMPH)
             if (actualDirection == 1) {
                 if (i == 0) {
                     //if we're going forward and this element is leading, we must find wind resistance
                     train.total.windResistance = 0.224809 * (train[currentElement].dragCoefficient * 0.5 * 1.2 * ((speedMPH * 1.60934) * (speedMPH * 1.60934)) * (158.75 * 0.092903))
                     
                     //did this using this page on 10/5/2015 (fall break 2015)
                     //http://www.engineeringtoolbox.com/drag-coefficient-d_627.html
                 }
             }
             else if (actualDirection == -1) {
                 if (i == (train.length-1)) {
                     //find wind resistance on this element if it's last and we're going backwards
                     train.total.windResistance = actualDirection * (0.224809 * (train[currentElement].dragCoefficient * 0.5 * 1.2 * ((speedMPH * 1.60934) * (speedMPH * 1.60934)) * (158.75 * 0.092903)))
                 }
             }
             else if (actualDirection == 0) {
                 train.total.windResistance = 0 //if we're stationary, no wind resistance
             }
             
             //Rolling Resistance
             train[currentElement].rollingResistance = actualDirection * (0.001 * train[currentElement].weight) //multiplied by actualDirection so we get the correct value, negative, positive or zero, based on direction
             train.total.rollingResistance = train.total.rollingResistance + train[currentElement].rollingResistance
             
         }
         
     }
     train.total.resistingForce = train.total.rollingResistance + train.total.windResistance
     train.total.netForce = train.total.motiveForce - train.total.resistingForce
     acceleration = (train.total.netForce / train.total.weight) * .681818 //this whole thing is a big f=ma problem, the trailing decimal is just a conversion from mph to ft/sec
     
     //we have to check the newSpeed value against the maximum speed for the traction motors in each locomotive
     
     
     newSpeed = speedMPH + acceleration
     
     train.physicsData = {"netForce":train.total.netForce, "rollingResistance":train.total.rollingResistance, "windResistance":train.total.windResistance, "motiveForce":train.total.motiveForce,"resistingForce":train.total.resistingForce,"notch":notch, "reverser":reverser, "weight":train.total.weight, "speed":speedMPH, "acceleration":acceleration,}
     console.log("LOG PHYSICS DATA: ");
     console.dir(train.physicsData);
     
     
     //this code is not for physics purposes, it is purely to keep the program from looping and locking up
     //it forces the speed to cross exactly 0 when changing direction, without impacting how fast it does so
     if (speedMPH > 0) { //if speed is positive right now,
         if (newSpeed < 0) { //and it's about to flip to negative
             newSpeed = 0 //make sure it crosses exactly 0 once
             console.log("Forcing zero crossing")
         }
     }
     else if (speedMPH < 0) {
         if (newSpeed > 0) {
             newSpeed = 0
             console.log("Forcing zero crossing")
         }
     }
     
     
     
     
     
     
     
     speedMPH = newSpeed //seems counterproductive but it's needed to ensure forced zero crossing, which cuts down on wasted CPU
     //update ui.js
     updateHTML("speedMPH")
     if (speedMPH < 0) {
         setModelDirection("reverse")
         actualDirection = -1
         var locoSpeed = locoSpeedCrunch(Math.abs(speedMPH))
         sendcmdLocoSpeed(locoSpeed)
     }
     else if (speedMPH > 0) {
         setModelDirection("forward")
         actualDirection = 1
         var locoSpeed = locoSpeedCrunch(Math.abs(speedMPH))
         sendcmdLocoSpeed(locoSpeed)
     }
     else {
         sendcmdLocoSpeed(0)
         actualDirection = 0
         console.log("Loco is stationary, setting speed to 0 and ignoring reverser.")
     }
     
     
     
 }
    else {
        Materialize.toast("You haven't requested a throttle yet. We can't do squat. Wait. How did you even manage to...never mind", 4000)
    
    }
}

function setModelDirection(ARGdirection) {
    if (ARGdirection == "forward") {
        sendcmd('{"type":"throttle","data":{"address":' + locoAddress + ', "forward":true, "throttle":"' + throttleName + '"}}')
        modelDirection = "forward"
    }
    else if (ARGdirection == "reverse") {
        sendcmd('{"type":"throttle","data":{"address":' + locoAddress + ', "forward":false, "throttle":"' + throttleName + '"}}')
        modelDirection = "reverse"
    }
    //console.log("Set MODEL direction to " + ARGdirection)
    
}






function protoEngine_recalc() {
    protoEngine_accel(notch, reverser)
    
}




