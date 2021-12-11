#define M_PI 3.1415926535897932384626433832795
#define M_2PI 6.283185307179586

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D u_state;

uniform vec2 u_resolution;
uniform float u_timeS;
uniform int u_bang;
uniform int u_toggle;
uniform float u_lfos; 

//src: https://godotengine.org/qa/41400/simple-texture-rotation-shader
vec2 rotateUVmatrix(vec2 uv, vec2 pivot, float rotation)
{
	mat2 rotation_matrix=mat2(  vec2(sin(rotation),-cos(rotation)),
								vec2(cos(rotation),sin(rotation))
								);
	uv -= pivot;
	uv= uv*rotation_matrix;
	uv += pivot;
	return uv;
}

// I think this is correct....
// https://en.wikipedia.org/wiki/Rotation_matrix
vec2 rotate2D(vec2 v, vec2 pivot, float angle) {
	return
	  (v - pivot)
	  * mat2(
		  vec2(cos(angle), -sin(angle)),
		  vec2(sin(angle),cos(angle)))
	  + pivot;
}

// TODO add some noise
// Wrap
// wrap_celing
// Sweet Spot ([0,1],[0,1])
// Any value above 1 will clamp instead of wrap
// Default (0.2,1.2)
vec2 getNeighbor(vec2 pos, int distx, int disty, vec2 wrap_celing) {
	vec2 incr = 1./u_resolution;
	return vec2(mod(pos.x + incr.x*float(distx),wrap_celing.x), mod(pos.y+incr.y*float(disty),wrap_celing.y));
}

// I think this is broken
// Reason: output is different if you iterate this multiple times
vec2 quantize(vec2 rot) {
	rot *= u_resolution;
	rot = rot - fract(rot);
	rot /= u_resolution;
	return rot;
}

// Blobby: a higher value has bigger blobs
// Sweet Spot: [0.9,50]
// Default: 10.0
// Scale: kind of mysterious. Higher takes longer to see and bigger blobs. Lower is more zoomed out
// Default: 1.5
// Sweet Spot: [0.2,4.0]
vec4 laplace(vec2 pos, float blobby, float scale) {
	pos = pos/scale; // neat
	vec2 incr = 1./u_resolution.xy*blobby; // makes wavy PARAM TODO, bigger blobs as constant gets smaller
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

// vec4 neighbor_influence(vec2 pos, float weight) {

// }

// Alias for mix
vec2 zoom(vec2 pos, vec2 point, float amount) {
	vec2 diff = pos - point;
	return pos + ((-1.0*amount) * diff);
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

// add a noise function
void main( void ) {
	vec2 orig_pos = gl_FragCoord.xy/u_resolution.xy;
	orig_pos.y = 1.0 - orig_pos.y;

	vec2 first_move = orig_pos;
	vec4 color_2, color_1, color_0, my_next_color;

	color_0 = texture2D(u_state, orig_pos);

	// Rotate by theta. 
	float theta = M_2PI * 0.000001;
	
	float zoom_amount_1 = -0.01;
	zoom_amount_1 = modulate_sine(zoom_amount_1, 0.001, 0.0989, 0.01, -1);
	first_move = mix(first_move, vec2(color_0.x,color_0.x), zoom_amount_1);
  	first_move = rotate2D(first_move, vec2(sin(first_move.x),0.5), theta);
  	color_1 = texture2D(u_state, first_move); // stealing another pixels memory


	float blob_factor = 10. * color_1.x; //10 or 100
	float scale_factor = 4.5  * color_1.x;
	vec2 wrap_ceiling = vec2(0.11,0.2); //0.11, 0.2 (weights of noise)

	// PARAM, injects more movement
	int dist_x = 0;
	int dist_y = 1;
	vec2 neigh_pos = getNeighbor(first_move, dist_x,dist_y,wrap_ceiling);
	
	neigh_pos = rotate2D(neigh_pos, vec2(0.5,0.5), theta * color_1.y);
	
	// use to be weighted by 0.01, made it less pencil
	neigh_pos = mix(neigh_pos, vec2(color_1.x,0.5), sin(u_timeS*M_2PI * .01) * 0.01*  (2.0 * color_1.x - 1.0));

	color_2 = texture2D(u_state, neigh_pos);

	float mix_amount = sin(u_timeS*M_2PI * (0.7 + (1.15 * (color_2.x - 0.5))))*0.9;
	my_next_color = mix(color_2,color_1,mix_amount);

	float neighbors_weight = (0.3 * (sin(u_timeS * M_2PI * 0.01 + M_PI) + 1.2));

	vec4 neighbors = laplace(gl_FragCoord.xy/u_resolution.xy,blob_factor, scale_factor) * neighbors_weight;

	my_next_color -= neighbors;
  	gl_FragColor = my_next_color;
}