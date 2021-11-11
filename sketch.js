let distort_s
let movie
let buffer
let seed
let SEED_RES = [600,500]

function preload() {
	distort_s = loadShader('assets/basic.vert',
							'assets/distort.frag')
}
function setup() {
	pixelDensity(1)
	createCanvas(600,500)
	noStroke()

	screen = createGraphics(600,500, WEBGL)
	screen.pixelDensity(1)
	screen.noStroke()

	buffer = createGraphics(600,500)
	seed = []
	for (i = 0; i < SEED_RES[0]; i++) {
		seed[i] = []
		for (j = 0; j < SEED_RES[1]; j++) {
			rand = floor(random(0,256))
			seed[i][j] = color(rand,rand,rand,255)
		}
	}

	let scale = [SEED_RES[0]/buffer.width, SEED_RES[1]/buffer.height] 
	for (i = 0; i < buffer.width; i++) {
		for (j = 0; j < buffer.height; j++) {
			buffer.set(i,j,seed[floor(i*scale[0])][floor(j*scale[1])])
		}
	}
	buffer.updatePixels()
}

function draw() {
	background(220)
	distort_s.setUniform('u_resolution', [width, height])
	distort_s.setUniform('u_buffer', buffer)
	distort_s.setUniform('u_timeS', millis()/1000)
	// distort_s.setUniform('u_seed', seed)
	// distort_s.setUniform('u_seed_res', SEED_RES)

	screen.shader(distort_s)
	screen.rect(0,0,width,height)
	image(screen,0,0,width,height)

	buffer.copy(screen,
		0,0,
		screen.width,screen.height,
		0,0,
		buffer.width,buffer.height)
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight)
}