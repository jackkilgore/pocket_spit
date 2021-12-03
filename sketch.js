let distort_s
let state
let seed
let tmp
let SEED_RES = [100,100]
let CANVAS_RES = [2920,1080]
let M_2PI = 6.283185307179586
let bang = 0
let NUM_LFOS = 5
let lfos
let test_state

let camera
let snapshot

function preload() {
	distort_s = loadShader('assets/basic.vert',
							'assets/distort.frag')
}

function setup() {
	pixelDensity(1)
	createCanvas(CANVAS_RES[0],CANVAS_RES[1])
	// camera = createCapture(VIDEO)
	// camera.hide()

	// This will run the shader
	screen = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)
	screen.textureMode(NORMAL)

	// This will maintain state
	state = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)

	// Initialize LFOs
	lfos = []
	for(i = 0; i < NUM_LFOS; i++) {
		lfos[i] = 0.0
	}

	// Build a random seed image
	// Karl: Try hsv
	// Pau: try post-processing filtering
	// Pau: flatten 3d color to a path through a 3d space
		// Pau: ColorGraph
		// Karl: try helix
	seed = []
	for (i = 0; i < SEED_RES[0]; i++) {
		seed[i] = []
		for (j = 0; j < SEED_RES[1]; j++) {
			rand = floor(random(0,256))
			rand1 = floor(random(rand - 5,rand + 5))
			rand2 = floor(random(rand1 - 5,rand1 + 5))
			seed[i][j] = color(rand1,rand2,rand,255)
		}
	}
	seed[SEED_RES[0]/2][SEED_RES[1]/2] = color(194,25,64,255)

	tmp = createGraphics(CANVAS_RES[0], CANVAS_RES[1]);
	// Load seed image into the state
	tmp.loadPixels();
	let scale = [SEED_RES[0] / state.width, SEED_RES[1] / state.height];
	for (i = 0; i < tmp.width; i++) {
	  for (j = 0; j < tmp.height; j++) {
		tmp.set(i, j, seed[floor(i * scale[0])][floor(j * scale[1])]);
	  }
	}
	test_state = tmp[0]
	tmp.updatePixels();
	// tmp.image(camera)
	
	state.push()
	state.translate(-state.width/2, -state.height/2)
	state.image(tmp, 0, 0);
	state.pop()
}

let counter = 1000
let seed_again = 0
function draw() {
	// Get time
	let time = millis()/1000
	// Compute lfos
	lfos[0] = sin(time*M_2PI*0.1)
	lfos[1] = sin(time*M_2PI*0.11)
	

	if (random(0,1) < 0.08) {
		bang = 1
		counter = 0
	}

	if(counter < 200) {
		bang = 1
	}
	bang = 1

	// Set Uniforms
	distort_s.setUniform('u_resolution', [screen.width, screen.height])
	distort_s.setUniform('u_state', state)
	distort_s.setUniform('u_timeS', time)
	distort_s.setUniform('u_lfos', lfos[0])
	//distort_s.setUniform('u_bang', bang)

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

	state.loadPixels()
	state.push()
	state.translate(-state.width/2, -state.height/2)

	// Reseed
	if (state[0] === test_state) {
		seed_again += 1
	} else {
		seed_again = 0
	}
	if( seed_again === 200) {
		// seed_again = 0
		// state.fill(rand,rand1,rand2,255)
		// state.noStroke()
		// state.rect(width/2,height/2,10,10)
		// state.image(tmp, 0, 0)
	}
	test_state = state[0]
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
	// state.push()
	// state.translate(-state.width/2, -state.height/2)
	// state.image(camera, 0, 0)
	// state.pop()
}