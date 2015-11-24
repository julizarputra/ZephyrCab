ui = {
    cab : {
        notch : {
            set : function() {
                var newNotch = document.getElementById("notch").value;
                var returned = notch.set(newNotch)
                $("#notch").val(returned)
            }
        },
        
        engine : {
            start : {
                set : function(arg) {
                    if (train.all[0] != undefined) {
                        ui.cab.engine.start.state = arg;
                        document.getElementById("ui.cab.engine.start").checked = arg;
                    }
                    else {
                        document.getElementById("ui.cab.engine.start").checked = ui.cab.engine.start.state;
                        return ui.cab.engine.start.state;
                    }
                }
            },
            state : false, //Boolean to represent the state of the engine on all the trains
        },
        
        locoName : {
            update : function(name) {
                //This function sets the locomotive name in the CAB tab
                document.getElementById("ui.locoName").innerHTML = name;
            }
        },
        
        headlight : {
            set : function(arg) {
                //Because of the way the consist system (or lack thereof, in all technicality) works, we must set the headlight on ONLY the lead locomotive. First, we check and make sure we actually HAVE a lead locomotive
                if (train.all[0] != undefined) {
                    //Turn the headlight on on the lead loco, and also change the state we have stored locally
                    train.all[0].dcc.f.headlight.set(arg);
                    ui.cab.headlight.state = arg;
                    document.getElementById("ui.cab.headlight").checked = arg;
                }
                else {
                    //If we don't have a lead loco, revert back the state we have.
                    document.getElementById("ui.cab.headlight").checked = ui.cab.headlight.state;
                }
            },
            
            state : false,
        }
    },
    
    connection : {
        status : {
            
            //Called when websockets connection is opened.
            set : function(connectionState) {
                if (connectionState == true) {
                    $("#connectionStatus").html("Connected!").css("color", "green")
                }
            }
        }
    },
    
    layout : {
        power : {
            status : {
                update : function() {
                    var status = jmri.trkpower.state
                    document.getElementById("jmri.trkpower").checked = status;
                },
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