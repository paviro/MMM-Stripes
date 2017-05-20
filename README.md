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
    </tbody>
</table>


## Trigger from another module
Not yet supported.

## API Endpoint

`http://magicmirror/Stripes?animation=animationname`

###CURL Example

```bash
curl -X GET "http://magicmirror/Stripes?animation=rainbow&cycles=20"
```


