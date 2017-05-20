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

            } else if (notification === 'SEQUENCE') {
            }
        },
        
    start: function () {
        console.log('[Stripes] Starting node_helper');
        this.animationStarted = false;
        this.webServer()
    },
    
    webServer: function () {
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: true }));

        this.expressApp.get('/Stripes', (req, res) => {
            if (typeof req.query.animation !== 'undefined'){
                var cycles = Number(req.query.cycles) || 2;
                var speed = Number(req.query.speed) || 10;
                var animation = {func: null, param:{}};
                switch (req.query.animation) {
                    case 'rainbow': 
                        animation.func = this.rainbow
                        break;
                    case 'fill': 
                        animation.param.color = req.query.color ? String(req.query.color) : "#ffffff";
                        animation.func = this.fill
                        break;
                }
                if (animation.func){
                    this.animate(animation.func, cycles, speed, animation.param, (state) => {
                        if (state == true){
                            res.status(200).send({code: 200, status: 'Animation started!'});
                        } else {
                            res.status(409).send({code: 409, status: 'Sorry, another animation is currently in progress...'});
                        }
                    });
                } else {
                    res.status(404).send({code: 404, status: 'Requested animation could not be found.'});
                }
        
                
            } else {
                res.status(501).send({code: 501, status: 'Not sure what you want...'});
            }
            
           })
    },
    
    loadLEDs: function () {
        if (this.config.type == 'ws281x') {
            this.leds = require("rpi-ws281x-native");
            this.pixelData = new Uint32Array(this.config.ledCount);
            this.leds.init(this.config.ledCount, {gpioPin: this.config.device});
        }
        // Turn Strip off:
        this.clearStrip();
    },
    
    setStrip: function (color) {
        if (color instanceof Color){
            if (this.config.type == 'ws281x') {
                for (var i = 0; i < this.config.ledCount; i++) {
                    this.pixelData[i] = color.hex().replace('#', '0x');
                }
            }
        } else {
            console.log('[Stripes] The color has to be an instance of Color!');
        }
    },
    
    setLED: function (led, color) {
        if (color instanceof Color){
            if (this.config.type == 'ws281x') {
                this.pixelData[led] = color.hex().replace('#', '0x');
            }
        } else {
            console.log('[Stripes] The color has to be an instance of Color!');
        }
    },
    
    clearStrip: function () {
        this.setStrip(Color.rgb(0,0,0));
        this.renderStrip()
    },
    
    renderStrip: function () {
        if (this.config.type == 'ws281x') {
            this.leds.render(this.pixelData);
        }
    },

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
    
    stop: function (clear) {
        if (this.animationStarted == true) {
            clearInterval(this.animationInterval);
            this.animationStarted = false;
            if (clear){ this.clearStrip() };
        } else {
            console.log('[Stripes] No active animation. Stop failed.');
        }
    },
    
    rainbow: function () {
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
    
    fill: function () {
            this.setLED(this.currentAnimationStep, Color(this.currentAnimationParam.color));
            this.renderStrip();
            this.currentAnimationStep += 1;
            if ( (this.currentAnimationStep / this.config.ledCount) >= 1 ) {
                this.stop(false)
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
    }

});
