let distort_s
let lerp_s
let cubic_s
let state0
let state1
let state2
let state3
let seed
let tmp
let SEED_RES = [16,9]
// let CANVAS_RES = [800,500]
// let CANVAS_RES = [1920,1080]
let CANVAS_RES = [3840,2160]
// let CANVAS_RES = [7680,4320] // 8k
let FRAMERATE = 60
let M_2PI = 6.283185307179586
let bang = 0
let NUM_LFOS = 5
let lfos
let test_state

const capturer = new CCapture({
	framerate: FRAMERATE,
	format: "webm",
	name: "interp_4",
	quality: 80,
	// verbose: true,
	autoSaveTime: 1.0,
  });

function copy_state(state_in, state_out) {
	state_out.push()
	state_out.translate(-state_out.width/2, -state_out.height/2)
	state_out.image(state_in, 0, 0);
	state_out.pop()

	return state_out
}

function preload() {
	distort_s = loadShader('assets/basic.vert',
							'assets/distort.frag')
	lerp_s = loadShader('assets/basic.vert',
							'assets/interp_textures.frag')
	cubic_s = loadShader('assets/basic.vert',
							'assets/cubic_interp.frag')
}

function setup() {
	pixelDensity(1)
	frameRate(FRAMERATE)
	global_canvas = createCanvas(CANVAS_RES[0],CANVAS_RES[1])

	// This will run the shader
	screen = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)
	screen.textureMode(NORMAL)

	// This will maintain state
	state0 = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)
	state0.textureMode(NORMAL)

	state1 = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)
	state1.textureMode(NORMAL)

	state2 = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)
	state2.textureMode(NORMAL)

	state3 = createGraphics(CANVAS_RES[0],CANVAS_RES[1], WEBGL)
	state3.textureMode(NORMAL)

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
			rand1 = floor(random(rand - 1,rand + 1))
			rand2 = floor(random(rand1 - 1,rand1 + 1))
			seed[i][j] = color(rand,rand,rand,255)
		}
	}
	// seed[SEED_RES[0]/2][SEED_RES[1]/2] = color(61,119,194,255)

	tmp = createGraphics(CANVAS_RES[0], CANVAS_RES[1]);
	// Load seed image into the state
	tmp.loadPixels();
	let scale = [SEED_RES[0] / state0.width, SEED_RES[1] / state0.height];
	for (i = 0; i < tmp.width; i++) {
	  for (j = 0; j < tmp.height; j++) {
		tmp.set(i, j, seed[floor(i * scale[0])][floor(j * scale[1])]);
	  }
	}
	tmp.updatePixels();
	
	state0 = copy_state(tmp,state0)
	state1 = copy_state(tmp,state1) // TODO ZERO THESE OUT
	state2 = copy_state(tmp,state2)
	state3 = copy_state(tmp,state3)
}

let delta_time = 1.0/FRAMERATE
let time = 1 * delta_time

// Use state to compute the global screen
function compute(state_in, state_out) {
	// Compute lfos
	lfos[0] = sin(time*M_2PI*0.1)
	lfos[1] = sin(time*M_2PI*0.11)
	// Set Uniforms
	distort_s.setUniform('u_resolution', [state_in.width, state_in.height])
	distort_s.setUniform('u_state', state_in)
	distort_s.setUniform('u_timeS', time)
	distort_s.setUniform('u_lfos', lfos[0])
	//distort_s.setUniform('u_bang', bang)

	// Run shader: use state to create some output 
	screen.shader(distort_s)
	screen.push()
	screen.translate(-screen.width/2, -screen.height/2)
	screen.rect(0,0,width,height)
	screen.pop()

	// // Store screen in state
	state_out.push()
	state_out.translate(-state_out.width/2, -state_out.height/2)
	state_out.image(screen, 0, 0);
	state_out.pop()

	time += delta_time

	return state_out
}

function lin_interp(stateA, stateB, interp_amount) {
	lerp_s.setUniform('u_resolution', [screen.width, screen.height])
	lerp_s.setUniform('u_texA', stateA)
	lerp_s.setUniform('u_texB', stateB)
	lerp_s.setUniform('u_interp_amount', interp_amount)

	// Run shader: use state to create some output 
	screen.shader(lerp_s)
	screen.push()
	screen.translate(-screen.width/2, -screen.height/2)
	screen.rect(0,0,width,height)
	screen.pop()
}

function cubic_interp(stateA, stateB, stateC, stateD, interp_amount) {
	cubic_s.setUniform('u_resolution', [screen.width, screen.height])
	cubic_s.setUniform('u_texA', stateA)
	cubic_s.setUniform('u_texB', stateB)
	cubic_s.setUniform('u_texC', stateC)
	cubic_s.setUniform('u_texD', stateD)
	cubic_s.setUniform('u_interp_amount', interp_amount)

	// Run shader: use state to create some output 
	screen.shader(cubic_s)
	screen.push()
	screen.translate(-screen.width/2, -screen.height/2)
	screen.rect(0,0,width,height)
	screen.pop()
}



interp_dur = FRAMERATE * 0.07 //0.14
curr_interp_frame = 0
init_frame = true
capture_now = true

function draw() {
	if (init_frame) {

		// Capture logic
		if (capture_now) {
			capturer.start()
		}

		state1 = compute(state0,state1)


		// CUBIC
		state2 = compute(state1,state2)
		state3 = compute(state2,state3)


		init_frame = false
	}
	if (curr_interp_frame > (interp_dur - 1)) {
		// LINEAR

		// state0 = copy_state(state1,state0);

		// state1 = compute(state0,state1)


		// CUBIC
		state0 = copy_state(state1,state0);
		state1 = copy_state(state2,state1);
		state2 = copy_state(state3,state2);

		state3 = compute(state2,state3)

		curr_interp_frame = 0
	}
	// lin_interp(state0,state1,curr_interp_frame / interp_dur)
	// some error here, only colors interpolating but not geometry HMMM
	cubic_interp(state0,state1,state2,state3,curr_interp_frame / interp_dur)
	

	// DRAW
	background(30)
	image(screen,0,0,width,height)

	curr_interp_frame += 1
	

	// // CAPTURE
	if(capture_now) {
		capturer.capture(global_canvas.canvas)
	}

}
function keyReleased() {
	if(key === 'g') {
		capturer.start()
		capture_now = true
	}

	if(key === 's') {
		// noLoop()
		capturer.stop()
		capturer.save()
		capture_now = false
	}
}