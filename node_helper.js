/* global require */

/* Magic Mirror
 * Module: MMM-Stripes
 *
 * By Paul-Vincent Roll http://paulvincentroll.com
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const Color = require('color');
const bodyParser = require('body-parser');

module.exports = NodeHelper.create({
    
    start: function () {
        console.log('[Stripes] Starting node_helper');
        // Set active animations to false
        this.animationStarted = false;
        // Start API Endpoints
        this.webServer()
    },
    
    // This functions initialises the leds - more chipset implementations can be added here.
    loadLEDs: function () {
        if (this.config.type == 'ws281x') {
            this.leds = require("rpi-ws281x-native");
            this.pixelData = new Uint32Array(this.config.ledCount);
            this.leds.init(this.config.ledCount, {gpioPin: this.config.device});
        }
        // Turn Strip off:
        this.clearStrip();
        this.loadedLEDs = true;
    },
    
    // This functions sets the color of the whole LED strip
    setStrip: function (color) {
        if (color instanceof Color){
            for (var i = 0; i < this.config.ledCount; i++) {
                this.setLED(i, color);
            }
        } else {
            console.log('[Stripes] The color has to be an instance of Color!');
        }
    },
    
    // This functions sets the color of a single LED - more chipset implementations can be added here.
    setLED: function (led, color) {
        if (color instanceof Color){
            if (this.config.type == 'ws281x') {
                this.pixelData[led] = color.hex().replace('#', '0x');
            }
        } else {
            console.log('[Stripes] The color has to be an instance of Color!');
        }
    },
    
    // Function for setting RGB color to black -> OFF
    clearStrip: function () {
        this.setStrip(Color.rgb(0,0,0));
        this.renderStrip()
    },
    
    // This function renders the current pixels on the connected strip - more chipset implementations can be added here.
    renderStrip: function () {
        if (this.config.type == 'ws281x') {
            this.leds.render(this.pixelData);
        }
    },
    
    // This function starts an animation after checking if there already is another one active
    animate: function (animation, cycles, speed, param = {}, callback=null) {
        if (this.animationStarted == false) {
            this.animationCycles = cycles;
            this.currentAnimationStep = 0;
            this.currentAnimationParam = param;
            this.animationInterval = setInterval( animation.bind(this), speed )
            this.animationStarted = true;
            if (callback) {callback(true)}
        } else {
            if (callback) {callback(false)}
            console.log('[Stripes] There already is an active animation...');
        }
    },
    
    // Function for killing an active animation
    stop: function (clear) {
        if (this.animationStarted == true) {
            clearInterval(this.animationInterval);
            this.animationStarted = false;
            if (clear){ this.clearStrip() };
        } else {
            console.log('[Stripes] No active animation. Stop failed.');
        }
    },
    
    // Rainbow animation implementation
    rainbowAnimation: function () {
            for (var i = 0; i < this.config.ledCount; i++) {
                var wheelpos = (i + this.currentAnimationStep) % 384;
                this.setLED(i, this.colorwheel(wheelpos))
            }
            this.renderStrip()
            this.currentAnimationStep += 1;
            if ( (this.currentAnimationStep / 384) >= this.animationCycles ) {
                this.stop(true)
            }
    },
    
    // Fill strip animation implementation
    fillAnimation: function () {
            this.setLED(this.currentAnimationStep, Color(this.currentAnimationParam.color));
            this.renderStrip();
            this.currentAnimationStep += 1;
            if ( (this.currentAnimationStep / this.config.ledCount) >= 1 ) {
                this.stop(false)
            }
    },
    
    // Pulse animation implementation
    pulseAnimation: function () {
            var color = Color(this.currentAnimationParam.color);
            var speed = 0.09
            var newColorValues = Object()
            
            for (var i in color.object()) {
                var cosParam = color.object()[i] / 2
                var channelValue = (-cosParam * Math.cos(speed*this.currentAnimationStep) + cosParam);
                newColorValues[i] = channelValue;
            }
            
            this.setStrip(Color(newColorValues));
            this.renderStrip()
            
            this.currentAnimationStep += 1;
            if ( (this.currentAnimationStep / (2*Math.PI/speed)) >= this.animationCycles ) {
                this.stop(true)
            }
    },
    
    /* 
    Colorwheel function copied from https://github.com/pmdroid/LPD8806-node/blob/master/lib/LPD8806.js
    Pascal M - MIT License 2014
    */
    colorwheel: function (wheelpos) {
        if (wheelpos < 0){
            wheelpos = 0;
        }
        if (wheelpos > 384){
            wheelpos = 384;
        }
        if (wheelpos < 128){
            r = 127 - wheelpos % 128;
            g = wheelpos % 128;
            b = 0;
        } else if (wheelpos < 256){
            g = 127 - wheelpos % 128;
            b = wheelpos % 128;
            r = 0;
        } else {
            b = 127 - wheelpos % 128;
            r = wheelpos % 128;
            g = 0;
        }
        return new Color({r: r, g: g, b: b});
    },
    
    // Messages from the UI
    socketNotificationReceived: function (notification, payload) {
            if (notification === 'INITIATE') {
                this.config = payload;
                try {
                    console.info('[Stripes] Loading LEDs...');
                    this.loadLEDs()
                    console.log('[Stripes] LEDs appear to be working!');
                } catch (err) {
                    console.error('[Stripes] Unable to access GPIO (' + this.config.gpio + '), PWM not supported?', err.message);
                    this.leds = null;
                }

            } else if (notification === 'pulse') {
                console.log(payload);
                this.animate(this.pulseAnimation, this.config.animationCycles, this.config.animationSpeed, {color: payload});
            } else if (notification === 'alert') {
                this.animate(this.pulseAnimation, this.config.flashCycles, 20, {color: this.config.flashColor});
            }
        },
    
    // API Endpoints
    webServer: function () {
        
        var notLoadedResponse = {code: 500, status: 'LEDs not loaded. Make sure to request the UI first.'}
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: true }));
        
        this.expressApp.get('/Stripes', (req, res) => {
            res.status(202).send({code: 202, status: 'Module successfully loaded.', endpoints: ["/Stripes/animation", "/Stripes/set"]});
        });
        
        this.expressApp.get('/Stripes/set', (req, res) => {
            if (!this.loadedLEDs){
                res.status(500).send(notLoadedResponse);
            } else {
                if (req.query.r && req.query.g && req.query.b){
                    var color = Color.rgb(Number(req.query.r), Number(req.query.g), Number(req.query.b));
                } else if (req.query.color){
                    var color = Color(req.query.color);                    
                } else if (req.query.wheel){
                    var color = this.colorwheel(Number(req.query.wheel));
                }
                if (color){
                    this.setStrip(color);
                    this.renderStrip();
                    res.status(501).send({code: 200, color: color.object(), status: 'Color has been updated.'});
                } else {
                    res.status(501).send({code: 501, status: 'Please supply a color value.'});
                }
            }
        });
        
        this.expressApp.get('/Stripes/animation', (req, res) => {
            if (!this.loadedLEDs){
                res.status(500).send(notLoadedResponse);
            } else {
                if (typeof req.query.name !== 'undefined'){
                    var cycles = Number(req.query.cycles) || this.config.animationCycles;
                    var speed = Number(req.query.speed) || this.config.animationSpeed;
                    var animation = {func: null, param:{}};
                    switch (req.query.name) {
                        case 'rainbow': 
                            animation.func = this.rainbowAnimation;
                            break;
                        case 'fill':
                            animation.param.color = req.query.color ? String(req.query.color) : "#ffffff";
                            animation.func = this.fillAnimation;
                            break;
                        case 'pulse':
                            animation.param.color = req.query.color ? String(req.query.color) : "#ffffff";
                            animation.func = this.pulseAnimation; 
                    }
                    if (animation.func){
                        this.animate(animation.func, cycles, speed, animation.param, (state) => {
                            if (state == true){
                                res.status(200).send({code: 200, animation: req.query.name, status: 'Animation has been started.'});
                            } else {
                                res.status(409).send({code: 409, status: 'Sorry, another animation is currently in progress...'});
                            }
                        });
                    } else {
                        res.status(404).send({code: 404, status: 'Requested animation could not be found.'});
                    }
                    
                } else {
                    res.status(501).send({code: 501, status: 'Please supply an animation name.'});
                }
            }
            
           });
        
        this.expressApp.get('/Stripes/animation/cancel', (req, res) => {
            if (this.animationStarted){
                this.stop();
                this.clearStrip();
                res.status(202).send({code: 202, status: 'Requested animation cancellation.'});
            } else {
                res.status(501).send({code: 501, status: 'There is no active animation.'});
            }
        });
    }

});
