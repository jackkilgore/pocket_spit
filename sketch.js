let distort_s
let state
let canvas
let seed
let tmp
let SEED_RES = [10,10]
let CANVAS_RES = [800,500]
let bang = 0

function preload() {
	distort_s = loadShader('assets/basic.vert',
							'assets/distort.frag')
}
function setup() {
	pixelDensity(1)
	canvas = createCanvas(CANVAS_RES[0],CANVAS_RES[1], WEBGL)

	// This will run the shader
	screen = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)

	// This will maintain state
	state = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)

	// Build a random seed image
	seed = []
	for (i = 0; i < SEED_RES[0]; i++) {
		seed[i] = []
		for (j = 0; j < SEED_RES[1]; j++) {
			rand = floor(random(0,256))
			seed[i][j] = color(rand,rand,rand,255)
		}
	}

	tmp = createGraphics(CANVAS_RES[0], CANVAS_RES[1]);
	
	// Load seed image into the state
	tmp.loadPixels();
	let scale = [SEED_RES[0] / state.width, SEED_RES[1] / state.height];
	for (i = 0; i < tmp.width; i++) {
	  for (j = 0; j < tmp.height; j++) {
		tmp.set(i, j, seed[floor(i * scale[0])][floor(j * scale[1])]);
	  }
	}
	tmp.updatePixels();
	
	
	//tmp.line(0, 0, tmp.width, tmp.height)
	
	state.push()
	state.translate(-state.width/2, -state.height/2)
	state.image(tmp, 0, 0);
	state.pop()

	// Undocumented function. Does it work?
	state_tex = canvas.getTexture(state)
	state_tex.setInterpolation(NEAREST, NEAREST)
	state_tex.setWrapMode(CLAMP, CLAMP);
}

let counter = 1000
function draw() {
	// Trigger running every second.
	if (int(millis()) % 100 < 100) {
		// state.push()
		// state.translate(-state.width/2, -state.height/2)
		// state.image(tmp, 0, 0);
		// state.pop()
		bang = 1
	}

	// Set Uniforms
	distort_s.setUniform('u_resolution', [screen.width, screen.height])
	distort_s.setUniform('u_timeS', millis()/1000)
	distort_s.setUniform('u_bang', bang)
	distort_s.setUniform('u_state', state)

	// Run shader: use state to create some output
	screen.shader(distort_s)
	screen.push()
	screen.translate(-screen.width/2, -screen.height/2)
	screen.rect(0,0,width,height)
	screen.pop()

	state.push()
	state.translate(-state.width/2, -state.height/2)
	state.image(screen, 0, 0);
	state.pop()

	bang = 0
	counter += 1

	// DRAW
	background(220)
	push()
	translate(-state.width/2, -state.height/2)
	image(screen,0,0,width,height)
	pop()
}