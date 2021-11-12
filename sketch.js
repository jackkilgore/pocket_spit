let distort_s
let state
let seed
let SEED_RES = [2,2]
let CANVAS_RES = [800,500]
let bang = 0

function preload() {
	distort_s = loadShader('assets/basic.vert',
							'assets/distort.frag')
}
function setup() {
	pixelDensity(1)
	createCanvas(CANVAS_RES[0],CANVAS_RES[1])

	// This will run the shader
	screen = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)

	// This will maintain state
	state = createGraphics(CANVAS_RES[0],CANVAS_RES[1])

	// Build a random seed image
	seed = []
	for (i = 0; i < SEED_RES[0]; i++) {
		seed[i] = []
		for (j = 0; j < SEED_RES[1]; j++) {
			rand = floor(random(0,256))
			seed[i][j] = color(rand,rand,rand,255)
		}
	}

	// Load seed image into the state
	state.loadPixels()
	let scale = [SEED_RES[0]/state.width, SEED_RES[1]/state.height] 
	for (i = 0; i < state.width; i++) {
		for (j = 0; j < state.height; j++) {
			state.set(i,j,seed[floor(i*scale[0])][floor(j*scale[1])])
		}
	}
	state.updatePixels()
}

function draw() {
	// Metro: trigger event every second.
	if (int(millis()) % 1000 < 100) {
		bang = 1
	}

	background(220)
	// Set Uniforms
	distort_s.setUniform('u_resolution', [screen.width, screen.height])
	distort_s.setUniform('u_state', state)
	distort_s.setUniform('u_timeS', millis()/1000)
	distort_s.setUniform('u_bang', bang)

	// Run shader: use state to create some output
	screen.shader(distort_s)
	screen.rect(0,0,width,height)

	// Write screen output to ~the~ screen.
	image(screen,0,0,width,height)

	// Write screen output to state.
	// FAILURE: This doesn't seem to be copying anything new into state.
	state.copy(screen,
		-screen.width/2,-screen.height/2,
		screen.width,screen.height,
		0,0,
		state.width,state.height)
	state.updatePixels()
	
	bang = 0
}