const OSC_PORT_IN = 12001 // osc port
const OSC_PORT_OUT = 12003
let socket
let SLIDER_1_VAL_OSC = 0.001
let SLIDER_1_VAL_JSON = 0.001

https://github.com/genekogan/p5js-osc/blob/master/p5-basic/sketch.js
function receiveOsc(address, value) {

	if (PARAMS['PARAM_MODE'] !== param_mode.osc)
		return

	
	console.log("received OSC: " + address + ", " + value)

	if (value.length === 1) {
		value = value[0]
	}

	// Update parameters (maybe make a dictionary where they key is the address)
	// A coproduct for keys would be neat
	for(let index = 0; index < PARAMS.params.length; index++) {
		if (PARAMS.params[index].address === address) {
			PARAMS.params[index].value = value
		}
	}

    SLIDER_1_VAL_OSC = value[0]
}

function sendOsc(address, value) {
	console.log("Sent OSC: ", address, value)
	socket.emit('message', [address].concat(value))
}

function setupOsc(oscPortIn, oscPortOut) {
	socket = io.connect('http://localhost:8080/', { port: 8080, rememberTransport: true, transports : ['websocket'] })
	socket.on('connect', function() {
		socket.emit('config', {
			server: { port: oscPortIn,  host: 'localhost'},
			client: { port: oscPortOut, host: 'localhost'}
		});
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1))
			}
		} else {
			receiveOsc(msg[0], msg.splice(1))
		}
	});
}