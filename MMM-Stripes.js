Module.register('MMM-Stripes',{

    defaults: {
        ledCount:   64,
        type:  'ws281x',
        gpio: 18,
        animationSpeed: 20,
        animationCycles: 2,
        flashOnAlert: true,
        flashColor: 'red',
        flashCycles: 2,
    },

    start: function() {
        Log.info('[' + this.name + '] Starting');
        this.sendSocketNotification('INITIATE', this.config);
    },

    notificationReceived: function(notification, payload) {
        // Support for PILIGHTS Module:
        if (notification === 'PILIGHTS_SEQUENCE') {
            var color = payload.replace('_pulse', '');
            this.sendSocketNotification('pulse', color);
        // Pulse on alerts shown in the UI:
        } else if (notification === 'SHOW_ALERT' && this.config.flashOnAlert) {
            this.sendSocketNotification('alert');
        }
        
    }
});
