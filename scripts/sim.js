/*
Notching Objects

notch is the top level object for all this, and it contains "state" and "set()" which are pretty self explanatory

set() is called with a number as it's only argument. If a user tries to raise the notch by more than one, then the function will return the existing notch. The function will always return the actual notch.
*/
notch = new Object();
notch.state = 0 //Notch defaults to 0, which is idling.
notch.set = function(newNotch) {
    //First, we need to check and make sure we're not adjusting the notch by more than 1.
    var differenceInNotch = Math.abs(notch.state - newNotch)
    if (differenceInNotch == 1) {
        //The user is only moving the notch 1 click, so we can continue with setting it
        notch.state = newNotch;
        
        //and finally we return the new notch
        return notch.state;
    }
    else {
        //User is trying to move the notch by more than 1 click, which can't happen. We simply return the existing notch, which causes the slider to move back, and notify them.
        Materialize.toast("<i class='material-icons left'>error</i>You can't adjust the notch by more than 1 click at a time!", 5000)
        return notch.state;
    }
}

//We also go ahead and define the reverser so the math works
reverser = 0; //NEUTRAL not FWD

sim = new Object();
sim.direction = 1 //1 means forward, -1 means reverse. This is the ACTUAL direction, which is not necessarily the reverser's direction.
sim.time = {
    speed : 1,
}

sim.accel = function() {
    //This FOR loop goes through every train element. If there are none, it just does nothing.
    for(i = 0; i < train.all.length; i++) {
        //First, we need to find out what type of element we're dealing with.
        if (train.all[i].prototype.type == "locomotive") {
            //We are dealing with a locomotive.
            
            //First thing we need to do is deal with engine RPM and notching.
            //From there, we'll calculate fuel stuff, and then deal with tractive effort.
            
            /*
            Before we do anything we need to check and see if the engine is started.
            The first IF statement here checks to see if the locomotive that this FOR loop is dealing with is the locomotive being controlled by ui.cab. If it is, then we move on to start the engine.
            */
            if (ui.cab.currentLoco == i) {
                //If we're dealing with the currentLoco here...
                if (ui.cab.engine.start.state != train.all[ui.cab.currentLoco].dcc.f.engine.state) {
                    //If the engine state is DIFFERENT than the one indicated by the switch...
                    train.all[ui.cab.currentLoco].dcc.f.engine.set(ui.cab.engine.start.state); //Set it to match the switch position
                    if (ui.cab.engine.start.state == true) {
                        train.all[ui.cab.currentLoco].prototype.engineRunning = 1;
                    }
                    else if (ui.cab.engine.start.state == false) {
                        train.all[ui.cab.currentLoco].prototype.engineRunning = 0;
                    }
                }
            }
            
            if (train.all[i].prototype.engineRunning == 1) {
                train.all[i].prototype.realtime.rpm = train.all[i].prototype.notchRPM[notch.state] //This uses the notch (global variable) to lookup the rpm in an array of RPMs by notches.
            }
            else if (train.all[i].prototype.engineRunning == 0) {
                //If the engine is off...
                train.all[i].prototype.realtime.rpm = 0;
            }
            gauge.rpm(train.all[i].prototype.realtime.rpm) //Now we update the gauge using the value we just found
            
            /*
            Now we can calculate tractive effort based on notch and speed. This is done using a function (left open to developers of prototype objects) from inside the train object's prototype subobject.
            */
            var elementSpeed = train.all[i].prototype.realtime.speed
            var trainPosition = i; //This is passed as an argument so the function can see ALL of its parent object's attributes
            var te = train.all[i].prototype.calc.te(elementSpeed, trainPosition)
            train.all[i].prototype.realtime.te = te * train.all[i].prototype.engineRunning; //We multiply by engineRunning so if we're not running it's 0
            
            /*
            PRIME MOVER NOTCHING SOUNDS
            
            First, we must check and see if the notch has changed at all since the last physics engine cycle.
            */
            if (train.all[i].prototype.engineRunning == 1) {
                if (train.all[i].dcc.f.notch.state != notch.state) {
                    //We know it's changed, now we have to figure out which direction (up or down) to move it.
                    var difference = notch.state - train.all[i].dcc.f.notch.state; //This will equal 1 or -1, telling us the direction to notch
                    //console.log("Difference in notch: " + difference)
                    if (difference == 1) {
                    train.all[i].dcc.f.notch.up();
                    }
                    else if (difference == -1) {
                        train.all[i].dcc.f.notch.down();
                    }
                }
                else {
                //console.log("No notch difference found")
                }
            }
            
            /*
            FUEL USAGE
            The first two lines of this calculation are simple.
            Line 1 looks at the array to find the gal/hr fuel usage for this notch.
            Line 2 sets the fuel usage per hour for the element to the number we just found
            
            Line 3 gets complexish. It divides fuel usage by (60 * 10 * the time ratio) We divide by 60*10 so we can get the fuel usage per normal physics engine cycle. sim.time.speed is in there because if time is moving 2x as fast, it's 2x the fuel usage per sim cycle.
            
            Line 4 subtracts the usage per cycle (calculated in line 3) from the fuel tank to give us the new fuel value.
            
            Line 5 begins an IF statement that updates the fuel gauge if we're on locomotive 0.
            */
            var fuelUsage = train.all[i].prototype.fuel.usage[notch.state];
            train.all[i].prototype.realtime.fuel.usagePerHour = fuelUsage;
            train.all[i].prototype.realtime.fuel.usagePerCycle = (fuelUsage / (36000)) * sim.time.speed * train.all[i].prototype.engineRunning;
            train.all[i].prototype.realtime.fuel.status = train.all[i].prototype.realtime.fuel.status - train.all[i].prototype.realtime.fuel.usagePerCycle;
            //This IF makes sure we don't end up with a negative fuel amount.
            if (train.all[i].prototype.realtime.fuel.status < 0) {
                train.all[i].prototype.realtime.fuel.status = 0;
            }
            if (i == ui.cab.currentLoco) {
                gauge.fuel(train.all[ui.cab.currentLoco].prototype.realtime.fuel.status)
            }
            if (train.all[i].prototype.realtime.fuel.status <= 0) {
                //If we're out of fuel...
                var locoName = train.all[i].roster.name;
                train.all[i].dcc.f.engine.set(false); //Turn off engine sounds, which sets running to 0, making the TE of this loco nothing
                //This if statement checks if we've already notified the user, and if we haven't, it does.
                if (train.all[i].prototype.realtime.fuel.notifiedOfEmptyTank == false) {
                    Materialize.toast("<i class='material-icons left'>warning</i>" + locoName + " has run out of fuel!")
                    train.all[i].prototype.realtime.fuel.notifiedOfEmptyTank = true;
                }
            }
            
            /*
            Air compressor sounds
            
            This handles both the simulation calculations and the sound, all in the same lines of code.
            
            First we figure out if it's running at all.
            Then we calculate the flow rate.
            */
            var dumpValve = train.all[i].prototype.realtime.air.reservoir.main.dump; //check if the dump valve is open
            //console.log("DUMP VALVE : " + dumpValve)
            if ((train.all[i].prototype.realtime.air.reservoir.main.psi.g <= train.all[i].prototype.air.compressor.limits.lower) && (dumpValve == false)) {
                
                
                
                //If the compressor needs the prime mover running, make sure it is.
                if (train.all[i].prototype.air.compressor.needsEngine == true) {
                    
                    if (train.all[i].prototype.engineRunning == 1) {
                        //If the engine is running, this code executes
                        train.all[i].prototype.realtime.air.compressor.running = 1;
                        //If we're dealing with the cabbed locomotive
                        if (i == ui.cab.currentLoco) {
                            light.compressor(true);
                        }
                        
                    }
                    else {
                        train.all[i].prototype.realtime.air.compressor.running = 0;
                        light.compressor(false);
                    }
                }
                else if (train.all[i].prototype.air.compressor.needsEngine == false) {
                    train.all[i].prototype.realtime.air.compressor.running = 1;
                        //If we're dealing with the cabbed locomotive
                        if (i == ui.cab.currentLoco) {
                            light.compressor(true);
                        }
                }
                
            }
            else if ((train.all[i].prototype.realtime.air.reservoir.main.psi.g >= train.all[i].prototype.air.compressor.limits.upper)&& (dumpValve == false)) {
                train.all[i].prototype.realtime.air.compressor.running = 0;
                
                //If user is in this locomotive's cab
                if (i == ui.cab.currentLoco) {
                    light.compressor(false);
                }
            }
            
            //the compressor won't run when the dump valve is open, that's a waste
            if (dumpValve == true) {
                train.all[i].prototype.realtime.air.compressor.running = 0;
                if (i == ui.cab.currentLoco) {
                    light.compressor(false)
                }
            }
            
            //Another IF for the sound stuff
            if (train.all[i].prototype.realtime.air.compressor.running == 1) {
                //first check if the state has changed. If it hasn't we do nothing to avoid excessive loconet packets.
                if (train.all[i].dcc.f.compressor.state == false) {
                    train.all[i].dcc.f.compressor.set(true);
                }
            }
            else {
                //check to see if the state actually changed to avoid excess loconet packets
                if (train.all[i].dcc.f.compressor.state == true) {
                    train.all[i].dcc.f.compressor.set(false);
                }
            }
            
            /*
            COMPRESSOR AND AIR RESERVOIR(S)
            
            This is calculated using an algebraically twisted version of Boyle's law. We basically find how much volume (at atmosphere pressure) has been crammed into a fixed space, so instead of decreasing volume and keeping mass of air the same, we are increasing mass of air and keeping tank volume constant.
            
            Steps:
            1. Find compressor output flow rate (in cubic feet per physics cycle).
            2. Find volume of atmosphere-pressure air that is in the tank.
            3. Account for the steady leak rate specified in the prototype file.
            
            More information on all this to come.
            */
            
            //Find flow rate of compressor output
            var rpm = train.all[i].prototype.realtime.rpm; //this is just to make it more readable than this giant long object name
            var CfmRpmRatio = train.all[i].prototype.air.compressor.flowrate;
            var isRunning = train.all[i].prototype.realtime.air.compressor.running //NOTE: This makes the flow rate 0 when the compressor is off
            train.all[i].prototype.realtime.air.compressor.flowrate.cfm = rpm * CfmRpmRatio * isRunning
            train.all[i].prototype.realtime.air.compressor.flowrate.perCycle = (rpm * CfmRpmRatio * isRunning) / 600; //we divide this by 600 to change it from cubic feet per minute to cubic feet per 100ms (since sim.js recalculates every 100ms)
            
            //Add flowrate (in cubic feet per cycle) to the airVolumeInTank variable.
            var flowratePerCycle = train.all[i].prototype.realtime.air.compressor.flowrate.perCycle //This is just a shorthand variable to clean the code up, doesn't change anything
            train.all[i].prototype.realtime.air.reservoir.main.atmAirVolume = train.all[i].prototype.realtime.air.reservoir.main.atmAirVolume + flowratePerCycle;
            
            //Subtract leak rate in cubic feet before calculating pressure
            var volumeInTank = train.all[i].prototype.realtime.air.reservoir.main.atmAirVolume;
            var leakRate = train.all[i].prototype.air.reservoir.main.leakRate; //this is loss in cubic feet per cycle
            var volumeInTank = volumeInTank - leakRate; //lose air from leak
            train.all[i].prototype.realtime.air.reservoir.main.atmAirVolume = volumeInTank;
            
            //Make sure the volume isn't below capacity (otherwise we'll have a vacuum and unless you have some kind of space train that won't happen)
            if (train.all[i].prototype.realtime.air.reservoir.main.atmAirVolume < train.all[i].prototype.air.reservoir.main.capacity) {
                //if the volume is less than the minimum (the capacity) then fix it
                train.all[i].prototype.realtime.air.reservoir.main.airVolumeInTank = train.all[i].prototype.air.reservoir.main.capacity;
            }
            
            //Find volume of normal-pressure air that's been stuffed into the tank.
            //we create some shorthand variables to make this more readable
            var tankCapacity = train.all[i].prototype.air.reservoir.main.capacity;
            var airVolumeInTank = train.all[i].prototype.realtime.air.reservoir.main.atmAirVolume;
            air.reservoir.main.updatePSI(i)
            
            //If we are dealing with the current cab locomotive, we need to update the gauge.
            if (ui.cab.currentLoco == i) {
                //if we're in this locomotive
                gauge.air.reservoir.main(train.all[i].prototype.realtime.air.reservoir.main.psi.g)
            }
            
            
            /*
            Adding up rolling resistance for this element alone
            */
            train.all[i].prototype.realtime.rollingResistance = sim.direction * -1 * train.all[i].prototype.coefficientOf.rollingResistance * train.all[i].prototype.weight
            //This IF statement makes sure we dont accidentally have it pull the train backwards if it's sitting still.
            if (train.all[i].prototype.realtime.speed == 0) {
                train.all[i].prototype.realtime.rollingResistance = 0
            }
            
            /*
            GRADE RESISTANCE
            
            This feature is not really practical unless you have sensors in every car/locomotive, but it could be made practical with some careful occupancy detection and a little scripting, so I'm going ahead and adding it. By default, the grade is set at 0%, so this has no effect, but if you change it then the math will be right.
            
            This math courtesy of Mr. Al Krug
            */
            var tonnage = train.all[i].prototype.weight * 0.0005 //This finds the tonnage of the INDIVIDUAL element that we're dealing with right now, not the whole train.
            var gradePercent = train.all[i].prototype.realtime.grade; //1% grade would be 1, not 0.01!
            var gradeResistance = -1 * gradePercent * tonnage * 20 //20 is for 20lbs per ton per % (Al Krug), -1 is to make it a negative since it's RESISTANCE.
            train.all[i].prototype.realtime.gradeResistance = gradeResistance;
            
            
        }
        else if (train.all[i].prototype.type == "rollingstock") {
            //We are dealing with rolling stock.
            
        }
    }
}


/*
The crunch object

The crunch object is actually a very simple way to handle things. It's basically a collection of reusable "canned" math functions. I built this in to allow for easy addition of calculations without cluttering up code. If you know you're going to be calculating the same old thing over and over again (for example, rolling resistance) then it makes sense to tidy things up and use a function instead of littering the main physics engine function with loads of decimals and other variables.
*/
crunch = new Object();

/*
This function is quite simple. It is for calculating rolling resistance of a given body.

Call with:
crunch.rollingResistance(weight, coefficient)
Weight is the weight of the rolling thing in pounds, and coefficient is the dimensionless coefficient of rolling resistance.

The function will then return a rolling resistance value, in lbs.
*/
crunch.rollingResistance = function(weight, coefficient) {
    return (weight * coefficient)
}

/*

*/
crunch.wheelSlip = function(mass, load, coeffStatic, coeffKinetic, coeffSand, currentSlip) {
    var cube = new Object();
    //First we choose either the coefficient of kinetic friction or the coefficient of static friction, based on whether or not the wheel is already slipping.
    var coefficient
    if (currentSlip != 0) {
        coefficient = coeffKinetic;
    }
    else {
        coefficient = coeffStatic;
    }
    
    var threshold = mass * coefficient;
    
    if (load > threshold) {
        slipping = true;
        coefficient = coeffKinetic
        threshold = mass * coefficient;
        cube.netForce = load - threshold
        cube.acceleration = cube.netForce / mass //this is in feet per second
        cube.newSpeed = currentSlip + cube.acceleration
    }
    if (load <= threshold) {
        slipping = false;
    }
    
    console.log(cube)
    return slipping;
}

wheel = function(trainNumber, mass, radius) {
    this.slip = new Object();
    this.slip.current = 0;
    this.slip.calc = function(load) {
        var threshold = mass * load;
        if (load > threshold) {
            var slipping = true;
        }
        else {
            var slipping = false;
        }
    }
}

//Once ALL this is loaded, we start the calculation loop, which runs every 100ms.
sim.recalcInterval = setInterval(function() {sim.accel()}, 100)

sim.f = {
    air : {
        horn : function(trainPosition, state) {
            //define a shorthand variable for the usage in cubic feet per millisecond, and for the corresponding pressure
            var usagePerMs = train.all[trainPosition].prototype.air.device.horn.usagePerMs;
            var hornOpsPressure = train.all[trainPosition].prototype.air.device.horn.operatingPressure;
            
            //if we are turning the horn on, create the interval to run every 1ms
            if (state == true) {
                //intervals are stored in .prototype.tmp.intervals
                train.all[trainPosition].prototype.tmp.intervals.horn = setInterval(function(){air.reservoir.main.take(usagePerMs, hornOpsPressure, trainPosition)}, 1)
            }
            //if we are turning the horn off, clear the interval
            else if (state == false) {
                clearInterval(train.all[trainPosition].prototype.tmp.intervals.horn);
            }
            
        },
        dump : function(trainPosition, state) {
            if (state == true) {
                train.all[trainPosition].prototype.realtime.air.reservoir.main.atmAirVolume = train.all[trainPosition].prototype.air.reservoir.main.capacity;
                train.all[trainPosition].prototype.realtime.air.reservoir.main.dump = true;
            }
            else {
                train.all[trainPosition].prototype.realtime.air.reservoir.main.dump = false;
            }
        }
    }
}

