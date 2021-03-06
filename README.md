# MMM-Stripes
MagicMirror module to control a led strip attached to a Raspberry Pi.


## Requirements

Currently this module is only able to control 'ws281x' stripes. Neopixels or any other WS2812 stripe should work fine. I will try to add support for other chips as soon as the basic functions are ready.

## Module installation

### Cloning the module and installing the dependencies

```bash
cd ~/MagicMirror/modules
git clone https://github.com/paviro/MMM-Stripes.git
sudo apt-get install scons
cd MMM-Stripes
npm install
```

### Add the module to MM

Open the file `~/MagicMirror/config/config.js` and add the following to your modules section:

```javascript
modules: [
    {
        module: 'MMM-Stripes',
        config: {
            ledCount: 60,
            type: 'ws281x',
            gpio: 18
        }
    }
]
```


## Module Configuration Options

<table width="100%">
    <thead>
        <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th width="100%">Description</th>
        </tr>
    <thead>
    <tbody>
        <tr>
            <td><code>ledCount</code></td>
            <td>Integer</td>
            <td><code>60</code></td>
            <td>Number of LEDs on your strip.</td>
        </tr>
        <tr>
            <td><code>gpio</code></td>
            <td>String</td>
            <td><code>18</code></td>
            <td>The GPIO-Pin your strip is connected to. Must support PMW!</td>
        </tr>
         <tr>
                <td><code>animationSpeed</code></td>
                <td>Integer</td>
                <td><code>20</code></td>
                <td>Animation speed.</td>
        </tr>
         <tr>
                <td><code>animationCycles</code></td>
                <td>Integer</td>
                <td><code>2</code></td>
                <td>Animation duration.</td>
        </tr>
         <tr>
                <td><code>flashOnAlert</code></td>
                <td>boolean</td>
                <td><code>true</code></td>
                <td>Trigger a pulse animation when a notification is shown.</td>
        </tr>
        <tr>
            <td><code>flashColor</code></td>
            <td>text</td>
            <td><code>red</code></td>
            <td>Color of the flash (blue, rgb(25,200,200), #F04B23).</td>
        </tr>
        <tr>
            <td><code>flashCycles</code></td>
            <td>Integer</td>
            <td><code>2</code></td>
            <td>Animation duration.</td>
        </tr>
    </tbody>
</table>


## Trigger from another module
Currently supports messages send for [MMM-PiLights](https://github.com/jc21/MMM-PiLights) and notifications shown in the default alert module.
More will be added.

## API Endpoint
```
http://yourmagicmirror/Stripes/animation?name=rainbow&cycles=100000
http://yourmagicmirror/Stripes/animation?name=fill&color=blue
http://yourmagicmirror/Stripes/animation?name=pulse&color=red&cycles=4
http://yourmagicmirror/Stripes/animation/cancel
http://yourmagicmirror/Stripes/set?color=blue
http://yourmagicmirror/Stripes/set?color=rgb(25,200,200)
http://yourmagicmirror/Stripes/set?r=25&g=200&b=200
http://yourmagicmirror/Stripes/set?wheel=20
```

### CURL Example

```bash
curl -X GET "http://yourmagicmirror/Stripes/animation?name=rainbow"
```


