gauge = new Object();

gauge.createAll = function() {
    if (train.all[0] != undefined) {
        gauge.speedometer.create();
        gauge.rpm.create();
        gauge.fuel.create();
    }
}

gauge.speedometer = function(value) {
    //This is just a wrapper so we can add additional functions that trigger if we need to
    gauge.speedometer.object.setValue(value)
}

gauge.speedometer.create = function() {
    //Pulls options from lead locomotive's prototype.gauges object
    var options = train.all[ui.cab.currentLoco].prototype.gauges.speedometer;
    options.renderTo = "gauge.speedometer";
    gauge.speedometer.object = new Gauge(options);
    gauge.speedometer.object.draw();
}

gauge.rpm = function(value) {
    var oldValue = gauge.rpm.object.getValue()
    //This is just a wrapper so we can add additional functions that trigger if we need to.
    
    //This if statement saves resources by not updating the gauge if the value hasn't actually changed. We need this since the physics engine updates this function with a new value every 100ms.
    if (oldValue != value) {
        gauge.rpm.object.setValue(value)
    }
}

gauge.rpm.create = function() {
    //Pulls options from lead locomotive's prototype.gauges object
    var options = train.all[ui.cab.currentLoco].prototype.gauges.rpm;
    options.renderTo = "gauge.rpm";
    gauge.rpm.object = new Gauge(options);
    gauge.rpm.object.draw();
}

gauge.fuel= function(value) {
    var oldValue = gauge.rpm.object.getValue()
    //This is just a wrapper so we can add additional functions that trigger if we need to.
    
    //This if statement saves resources by not updating the gauge if the value hasn't actually changed. We need this since the physics engine updates this function with a new value every 100ms.
    if (oldValue != value) {
        gauge.fuel.object.setValue(value)
    }
}

gauge.fuel.create = function() {
    //Pulls options from lead locomotive's prototype.gauges object
    var options = train.all[ui.cab.currentLoco].prototype.gauges.fuel;
    options.renderTo = "gauge.fuel";
    gauge.fuel.object = new Gauge(options);
    gauge.fuel.object.draw();
}