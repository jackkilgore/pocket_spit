// Author: Jack Kilgore
// Date: 6 December, 2021 

#define M_PI 3.1415926535897932384626433832795
#define M_2PI 6.283185307179586

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D u_state;
uniform vec2 u_resolution;
uniform float u_timeS;

vec2 rotate2D(vec2 v, vec2 pivot, float angle) {
	return
	  (v - pivot)
	  * mat2(
		  vec2(cos(angle), -sin(angle)),
		  vec2(sin(angle),cos(angle)))
	  + pivot;
}

// Sweet Spot ([0,1],[0,1])
// Any value above 1 will clamp instead of wrap
// Credits to kybyr for the function name
vec2 wormhole(vec2 pos, float distx, float disty, vec2 wrap_celing) {
	vec2 incr = 1./u_resolution;
	return vec2(mod(pos.x + incr.x*distx,wrap_celing.x), mod(pos.y+incr.y*disty,wrap_celing.y));
}

// I think this is broken
// Reason: output is different if you iterate this multiple times
vec2 quantize(vec2 rot) {
	rot *= u_resolution;
	rot = rot - fract(rot);
	rot /= u_resolution;
	return rot;
}

// Laplace
// Blobby: a higher value has bigger blobs
// Sweet Spot: (0.0,1000]
// Default: 10.0
// Scale: kind of mysterious. Higher takes longer to see and bigger blobs. Lower is more zoomed out
// Default: 1.5
// Sweet Spot: [0.2,4.0]
vec4 laplace(vec2 pos, float blobby, float scale) {
	pos = pos/scale; // neat
	vec2 incr = 1./(u_resolution.xy*blobby);
	vec4 sum = vec4(0.);
	sum += texture2D(u_state,pos) * -1.0;

	// Wrapping logic
	float left = incr.x*2.;
	float right = incr.x*2.;
	float up = incr.y;
	float down = incr.y;
	if (pos.x - left < 0.) {
	left = 0.;
	}
	if (pos.x + right > 1.) {
	right = 0.;
	}
	if (pos.y + up > 1.) {
	up = 0.;
	}
	if (pos.y - down < 0.) {
	down = 0.;
	}
	sum += 
	texture2D(u_state,pos 
				- vec2(left,0.)
	) * 0.2;
	sum += 
	texture2D(u_state,pos 
				+ vec2(right,0.)
	) * 0.2;
	sum += 
	texture2D(u_state,pos 
				- vec2(0.,down)
	) * 0.2;
	sum += 
	texture2D(u_state,pos 
				+ vec2(0.,up)
	) * 0.2;

	sum += 
	texture2D(u_state,pos 
				- vec2(left,down)
	) * 0.05;
	sum += 
	texture2D(u_state,pos 
				- vec2(left,-up)
	) * 0.05;
	sum += 
	texture2D(u_state,pos 
				+ vec2(right,up)
	) * 0.05;
	sum += 
	texture2D(u_state,pos 
				+ vec2(right,-down)
	) * 0.05;
	return sum;
}

vec4 neighbor_influence(vec4 my_color, float weight, vec2 neighborhood, float blobby, float scale) {
	vec4 neighbors = weight * laplace(neighborhood,blobby,scale);
	return my_color - neighbors;
}

float modulate_sine(float orig, float weight, float freq, float phase, int polarity) {
	float siner;
	if (polarity == -1) {
		siner = (sin(M_2PI*u_timeS*freq + phase) - 1.) * 0.5;
	} else if (polarity == 1) {
		siner = (sin(M_2PI*u_timeS*freq + phase) + 1.) * 0.5;
	} else {
		siner = sin(M_2PI*u_timeS*freq + phase);
	}
	return orig + weight * siner;
}

void main( void ) {

	// Get the color of the current pixel (color_0). 
	//
	vec2 pos_0 = gl_FragCoord.xy/u_resolution.xy;
	pos_0.y = 1.0 - pos_0.y;
	vec4 color_0 = texture2D(u_state, pos_0);

	// Universal rotation; influenced by color_0. 
	float theta = 0.001;
	
	// Get the next color.
	//
	vec2 pos_1 = pos_0;

	// The mix here affectively acts like a zoom on a camera.
	float zoom_amount_1 = 0.005;
	pos_1 = mix(pos_1, vec2(0.5,0.5), zoom_amount_1);

	// Rotation
  	pos_1 = rotate2D(pos_1, vec2(0.5,0.5), theta);

  	vec4 color_1 = texture2D(u_state, pos_1);

	// Perform Euler's Rule.
	//
	float dt = 0.2;
	gl_FragColor = color_0 + dt * (color_1 - color_0);

}