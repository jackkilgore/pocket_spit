const OSC_PORT_IN = 12000 // osc port
const OSC_PORT_OUT = 57121
let socket
let SLIDER_1_VAL_OSC = 0.001
let SLIDER_1_VAL_JSON = 0.001

https://github.com/genekogan/p5js-osc/blob/master/p5-basic/sketch.js
function receiveOsc(address, value) {
	// console.log("received OSC: " + address + ", " + value)
    SLIDER_1_VAL_OSC = value[0]
	// if (address == LATENT_MEAN_ADDR) {
	// 	// Update display
	// }

	// // Ehhh should we loop or have a bunch of cases?
	// for (knob of knobs) {
	// 	if (knob.address === address) {
	// 		knob.set_val(value[0])
	// 		break
	// 	}
	// }
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

var ParamBuffObj = {
	buff: undefined,
	name: undefined,
	pushParam: function(param_val) {
		this.buff.push(param_val)
	}
}

// Everything defined here will be saved by JSON.stringify. The rest will be hidden
function ParamBuff(name) {
    let obj = Object.create( ParamBuffObj );
	obj.name = name
	obj.buff = []
    return obj
}