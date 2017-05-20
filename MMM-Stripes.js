/* global Module */

/* Magic Mirror
 * Module: MMM-Stripes
 *
 * By Paul-Vincent Roll http://paulvincentroll.com
 * MIT Licensed.
 */

Module.register('MMM-Stripes',{

    defaults: {
        ledCount: 60,
        type:  'ws281x',
        gpio: 18
    },

    start: function() {
        Log.info('[' + this.name + '] Starting');
        this.sendSocketNotification('INITIATE', this.config);
    },

    notificationReceived: function(notification, payload) {
        if (notification === 'PILIGHTS_SEQUENCE') {
            this.sendSocketNotification('SEQUENCE', payload);
        }
    }
});
