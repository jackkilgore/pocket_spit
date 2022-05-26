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
uniform float u_slider_1, u_slider_speed, u_slider_rot, u_slider_grit, u_slider_damp, u_slider_blob, u_slider_vert, u_slider_horiz;

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
	float left = incr.x*2.*blobby;
	float right = incr.x*2.*blobby*1.1;
	float up = incr.y*blobby*0.9;
	float down = incr.y*blobby*1.2;
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
	// pos_0.x = 1.0 - pos_0.x;
	vec4 color_0 = texture2D(u_state, pos_0);


	// remove symmetry
	// if(color_0.x > 0.1) {
	// 	pos_0.x = 1.0 - pos_0.x;
	// }

	// Universal rotation; influenced by color_0. 
	float theta = M_2PI * 0.101 * color_0.x *  u_slider_rot * 0.25;
	// theta = modulate_sine(0.0, theta , 34.000189, 1.01, 0) *  u_slider_rot;
	
	// Get the next color (color_1), influenced by color_0.
	//
	vec2 pos_1 = pos_0;

	// The mix here affectively acts like a zoom on a camera.
	float zoom_amount_1 = 0.01 * u_slider_speed * 0.25;
	zoom_amount_1 = modulate_sine(zoom_amount_1, 0.0, 1.00989, 0.01, 0);
	pos_1 = mix(pos_1, vec2(color_0.x,color_0.y), zoom_amount_1);

	// Rotation
  	pos_1 = rotate2D(pos_1, vec2(pos_1.x,pos_1.y), theta);

  	vec4 color_1 = texture2D(u_state, pos_1);


	// Get the next color (color_2), influenced by color_1.
	//
	float dist_x_mod_freq =  0.0012 * color_1.y;
	float dist_x_mod_weight = 1. * color_1.w;
	float dist_x = u_slider_horiz * -4.0 * 0.25; 
	dist_x = modulate_sine(dist_x,dist_x_mod_weight, dist_x_mod_freq,0.0,-1);

	float dist_y_freq = 0.00005 + (color_1.z * 0.001 - 0.005);
	float dist_y_weight = 0.1;
	float dist_y = u_slider_vert * 4.0 * 0.25; 
	dist_y = modulate_sine(dist_y,dist_y_weight,dist_y_freq, 0.0, 1);

	vec2 wrap_ceiling = vec2(1.0,pos_1.x + color_1.x);
	vec2 pos_2 = wormhole(pos_1, dist_x,dist_y,wrap_ceiling);

	// Rotation
	pos_2 = rotate2D(pos_2, vec2(sin(pos_2.x),sin(pos_2.y)), theta * color_1.y);
	
	// Another "zoom".
	float zoom_mod_2_freq = 0.001;
	float zoom_mod_2_weight = 0.1*(2.0 * color_1.x - 1.0);
	float zoom_amount_2 = 0.1;
	zoom_amount_2 = modulate_sine(zoom_amount_2,zoom_mod_2_weight,zoom_mod_2_freq,0.0,0);
	pos_2 = mix(pos_2, vec2(pos_1.x,pos_1.y), zoom_amount_2);

	vec4 color_2 = texture2D(u_state, pos_2);

	// Mix color_1 and color_2. This is the basis for our new pixel color.
	//
	float mix_amount = sin(u_timeS*M_2PI * (0.07 + (1.15 * (color_2.x - 0.5)))* (1.+u_slider_grit) )*1.5010009 * u_slider_grit;
	vec4 color_0_next = mix(color_2,color_1,mix_amount);


	// color_0_next will be influenced by some specified neighborhood.
	//
	float blob_factor = 1.0; // * u_slider_blob; //* ( u_slider_1); // 0.2 or 100.2 2.0 * abs(sin(u_timeS*M_2PI * 0.04))
	float scale_factor = 300.2* (u_slider_blob); //  + (10.2 * (color_0_next.x - 0.5)); //* (u_slider_1);  //
	vec2 neighborhood = pos_0;
	// neighborhood.y = 1.0 - neighborhood.y;

	float neighbors_weight = 1. * u_slider_damp;
	float neighbors_weight_mod_freq = 0.0021;
	float neighbors_weight_mod_weight = 0.4;
	// neighbors_weight = modulate_sine(neighbors_weight,
	// 					neighbors_weight_mod_weight,
	// 					neighbors_weight_mod_freq,
	// 					0.0,
	// 					0
	// 				);
	color_0_next = neighbor_influence(color_0_next,neighbors_weight,
			neighborhood,
			blob_factor,
			scale_factor
	);
	

	// COLORING
	
	// color_0_next.y = color_0_next.y - color_0_next.x * color_1.y * 0.007;
	// color_0_next.z = color_0_next.z + color_0_next.x * color_2.y * 0.007;

	// //
	float VAR = 0.00; //color_0.x;
	float DAMP = 1.0 * u_slider_damp;
	// // Dampen colors

	// if(abs(color_0_next.z - color_0_next.x) > VAR * 1.) {
	// 	color_0_next.z -= DAMP * (color_0_next.z - color_0_next.x);
	// } 

	// if(abs(color_0_next.y - color_0_next.x) > VAR * 1.) {
	// 	color_0_next.y -= DAMP * (color_0_next.y - color_0_next.x);
	// }



	// We have finally derived the new pixel color.
	// Perform Euler's Rule.
	//
	float dt = color_0_next.x; // dependent on the original pixel
	float dt_mod_weight = 1.01 * (1. - u_slider_1);
	float dt_mod_freq = 0.0000891 * abs(sin(color_0.y));
	dt = modulate_sine(dt,dt_mod_weight,dt_mod_freq, 0.0,1);
	gl_FragColor = color_0 + dt * (color_0_next - color_0);
	// gl_FragColor *= 0.01;

}