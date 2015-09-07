





//this function runs with no arguments on page load
function init(event) {
    console.log("Running init()")
    if (event == "pageload") {
        //this runs on page load
        
    }
    else if (event == "connect") {
        //this runs on connection to layout
        updateHTML("layoutTrackPower_state")
        document.getElementById("connstatus").innerHTML = "Connected!"
        document.getElementById("connstatus").style.color = "green"
        
    }
    else if (event == "throttleacquired") {
        //this runs when you actually request a throttle
        //this screws with the HTML to make it known that a throttle is acquired
        document.getElementById("throttle_sel_button").className = "btn disabled waves-effect";
        document.getElementById("throttle_sel_button").innerHTML = "Throttle already Acquired";
        document.getElementById("throttlename").innerHTML = throttleName
        //eventually need to add something to disable form input fields, but that will come later
        
    }
    
}


//every time a variable is updated this function is called with updateHTML(variable name as a string)
//you can put your custom code to update your page HTML for that variable in there
//this can be called with:
//layoutTrackPower_state
//locoBrake
//notch
//reverser
function updateHTML(variable) {
    if (variable == "notch") {
        
        if(notch == 0) {
            var HTMLnotch
            HTMLnotch = "0 (Idling)"
        }
    //this changes the wording to "Run 1" instead of just 1. It's not essential but I like it :P
        else {
            HTMLnotch = "Run " + notch
        }
        //document.getElementById("notchindicator").innerHTML = "Current Notch: " + HTMLnotch
        
    }
    else if (variable == "layoutTrackPower_state") {
        document.getElementById("trkpowerswitch").checked = layoutTrackPower_state
            
        
    }
    else if (variable == "locoBrake") {
        //document.getElementById("locoBrakeIndicator").innerHTML = locoBrake + "%"
    }
    else if (variable == "reverser") {
        if (reverser == 1) {
            //document.getElementById("reverserIndicator").innerHTML = "Current Reverser Setting: FORWARD"
        }
        if (reverser == 0) {
            //document.getElementById("reverserIndicator").innerHTML = "Current Reverser Setting: NEUTRAL"
        }
        if (reverser == -1) {
            //document.getElementById("reverserIndicator").innerHTML = "Current Reverser Setting: REVERSE"
        }
    }
    else if (variable == "speedMPH") {
        document.getElementById("speedometer").innerHTML = (Math.round((Math.abs(speedMPH))*10))/10
    }
    else if (variable == "compressor") {
        //update compressor checkbox
        if (document.getElementById("compressor").checked != compressor) {
            document.getElementById("compressor").checked = compressor
        }
    }
    else if (variable == "bell") {
        //update bell HTML
        if (document.getElementById("bell").checked != bell) {
            document.getElementById("bell").checked = bell
        }
    }
    else if (variable == "engine") {
        document.getElementById("engineOnOff").checked = engine
    }
}





//this runs every time a notch is not allowed, with the argument being "timing" if the notch is disallowed because of ProtoEngine's timing
function notchDisallowed(args) {
    if (args == "timing") {
        alert("You can't notch this locomotive until you wait a little bit for the engine to catch up!")
    }
}


//this is what handles the checkbox crap, more documentation coming soon
function handleCBchange(cb, whatisit) {
    if (whatisit == "bell") {
        if (bell != cb.checked) {
            setBell(cb.checked)
        }
    }
    else if (whatisit == "compressor") {
        if (compressor != cb.checked) {
            setCompressor(cb.checked)
            Materialize.toast("handleCBchange() ran setCompressor", 4000)
        }
    }
    else if (whatisit == "light") {
        if (headlight != cb.checked) {
            setHeadlight(cb.checked)
        }
    }
    else if (whatisit == "trackpower") {
        if (layoutTrackPower_state != cb.checked) {
            //trkpower function needs to be updated to use bool instead of "on" and "off" as params, that's stupid
            trkpower(cb.checked)
        }
    }
    else if (whatisit == "primemover") {
        if (engine != cb.checked) {
            setEngine(cb.checked)
        }
    }
}

function handleSlider(slider, whatisit) {
    if (whatisit == "notch") {
        //this is rather complex and clunky
        var newNotch = slider.value
        setNotch(newNotch)
        document.getElementById("notch").value = notch

    }
}

function handleRadio(radio, whatisit) {
    if (whatisit == "reverser") {
        var hypotheticalReverser
        //figure out what we're trying to set it to
        if (document.getElementById("rv-forward").checked == true) {
            //we're trying to set this to forward
            hypotheticalReverser = "forward"
            debugToast("hypotheticalReverser = " + hypotheticalReverser, 4000)
        }
        else if (document.getElementById("rv-neutral").checked == true) {
            //we're trying to put it in neutral
            hypotheticalReverser = "neutral"
            debugToast("hypotheticalReverser = " + hypotheticalReverser, 4000)
        }
        else if (document.getElementById("rv-reverse").checked == true) {
            //we're trying to put it in reverse
            hypotheticalReverser = "reverse"
            debugToast("hypotheticalReverser = " + hypotheticalReverser, 4000)
        }
        if (true) {
            var reverserReturn = setReverser(hypotheticalReverser)
            if (reverserReturn == true) {
                //we set the reverser successfully!
                debugToast("Set reverser successfully to " + reverser, 4000)
            }
            if (reverserReturn == false) {
                //we did not set it successfully for some reason
                debugToast("reverserReturn = false", 4000)
                if (reverser == 1) {
                    //set checkbox to show forward
                    document.getElementById("rv-forward").checked = true
                    Materialize.toast("You can't set the reverser right now!", 4000)
                }
                else if (reverser == 0) {
                    //set checkbox to show neutral
                    document.getElementById("rv-neutral").checked = true
                    Materialize.toast("You can't set the reverser right now!", 4000)
                }
                else if (reverser == -1) {
                    //set checkbox to show reverse
                    document.getElementById("rv-reverse").checked = true
                    Materialize.toast("You can't set the reverser right now!", 4000)
                }
            }
        }
    }
}


//this is a function I made to make a sort of "verbose mode" for the JS toast alerts. I put in lots of Materialize.toast alerts, but when I don't want to hear everything they're annoying. So if you set debugToastMode = false, then the debug alerts cease and only the normal toasts come.
debugToastMode = false
function debugToast(toast, time) {
    if (debugToastMode == true) {
        Materialize.toast("Debug: " + toast, time)
    }
}

function updateGauge(gaugeName, gaugeValue) {
    document.getElementById(gaugeName).value = gaugeValue
    debugToast("updateGauge() just updated " + gaugeName + " to indicate " + gaugeValue + ".")
}