// Author: Jack Kilgore
// Date: 6 December, 2021 

let distort_s
let state
let canvas
let seed
let tmp
let SEED_RES = [2,2]
let CANVAS_RES = [800,500]
// let CANVAS_RES = [1920,1080]
// let CANVAS_RES = [4096,2160]
let M_2PI = 6.283185307179586
let FPS = 60

// const capturer = new CCapture({
// 	framerate: FPS,
// 	format: "png",
// 	name: "movie",
// 	quality: 100,
// 	verbose: true,
//   });
  

function preload() {
	distort_s = loadShader('assets/basic.vert',
							'assets/distort.frag')
}

function setup() {
	frameRate(FPS)
	pixelDensity(1)
	can = createCanvas(CANVAS_RES[0],CANVAS_RES[1])

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
			if(random(1) < -1.00) {
				rand = floor(random(0,256))
				rand1 = floor(random(rand - 5,rand + 5))
				rand2 = floor(random(rand1 - 5,rand1 + 5))
				seed[i][j] = color(rand,rand1,rand2,255)
			} else {
				rand = floor(random(0,256))
				seed[i][j] = color(rand,rand,rand,255)
			}
		}
	}
	// seed[SEED_RES[0]/2][SEED_RES[1]/2] = color(61,119,194,255)

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
	
	state.push()
	state.translate(-state.width/2, -state.height/2)
	state.image(tmp, 0, 0);
	state.pop()

}

let frameCount = 0
let delta_time = 1.0/FPS
let time = 0 * delta_time
function draw() {
	// if (frameCount === 0) capturer.start()

	// Set Uniforms
	distort_s.setUniform('u_resolution', [screen.width, screen.height])
	distort_s.setUniform('u_state', state)
	distort_s.setUniform('u_timeS', time)

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

	time += delta_time

	// DRAW
	background(30)
	image(screen,0,0,width,height)

	// // Save
	// capturer.capture(can.canvas)

	// if(frameCount % 60 === 0 && frameCount > 0) {
	// 	capturer.stop()
	// 	capturer.save()
	// 	capturer.start();
	// }
	// frameCount += 1

}

function keyReleased() {
	// if(key === 's') {
	// 	noLoop()
	// 	capturer.stop()
	// 	capturer.save()
	// }
}