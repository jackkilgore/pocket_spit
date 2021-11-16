let distort_s
let state
let seed
let tmp
let SEED_RES = [10,10]
let CANVAS_RES = [640,480]
let bang = 0

let camera
let snapshot

function preload() {
	distort_s = loadShader('assets/basic.vert',
							'assets/distort.frag')
}
function setup() {
	pixelDensity(1)
	createCanvas(CANVAS_RES[0],CANVAS_RES[1])
	camera = createCapture(VIDEO)
	camera.hide()

	// This will run the shader
	screen = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)
	screen.textureMode(NORMAL)

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
	tmp.image(camera)
	
	state.push()
	state.translate(-state.width/2, -state.height/2)
	state.image(tmp, 0, 0);
	state.pop()
}

let counter = 1000
function draw() {
	// Trigger running every second.
	if (int(millis()) % 1000 < 100) {
		state.push()
		state.translate(-state.width/2, -state.height/2)
		state.image(tmp, 0, 0);
		state.pop()
	}

	if (random(0,1) < 0.008) {
		bang = 1
		counter = 0
	}

	if(counter < 200) {
		bang = 1
	}

	// Set Uniforms
	distort_s.setUniform('u_resolution', [screen.width, screen.height])
	distort_s.setUniform('u_state', state)
	distort_s.setUniform('u_timeS', millis()/1000)
	distort_s.setUniform('u_bang', bang)

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
	background(30)
	image(screen,0,0,width,height)

}

function keyReleased() {
	// tmp.tint(255,110)
	// tmp.image(camera,0,0)
	state.push()
	state.translate(-state.width/2, -state.height/2)
	state.image(camera, 0, 0)
	state.pop()
}