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

// Wrap
vec2 getNeighbor(vec2 pos, int distx, int disty) {
	vec2 incr = 1./u_resolution;
	return vec2(mod(pos.x + incr.x*float(distx),1.0), mod(pos.y+incr.y*float(disty),1.0));
}

// I think this is broken
// Reason: output is different if you iterate this multiple times
vec2 quantize(vec2 rot) {
	rot *= u_resolution;
	rot = rot - fract(rot);
	rot /= u_resolution;
	return rot;
}

// Alpha blend. Currently unused.
vec4 blend(vec4 left, vec4 right)
{
	float alpha_left = left.a;
	float alpha_right = 1. - alpha_left;
	vec4 n_right = vec4(right.xyz, alpha_right);
	return left + n_right;
}

void main( void ) {
    vec2 pos = gl_FragCoord.xy/u_resolution.xy;
	pos.y = 1.0 - pos.y;
	vec4 new_pix_0, new_pix_1, out_pix;

	// Rotate by theta. 
	// Notice how we are attempting to replace time dependent rotation with state depenendent.
	float theta = M_2PI * 0.0007;

	vec2 neigh_pos = getNeighbor(pos, int(20. * sin(u_timeS)),1);
	neigh_pos = rotate2D(neigh_pos, vec2(0.5,0.5), theta);
	new_pix_0 = texture2D(u_state, neigh_pos);
	new_pix_1 = texture2D(u_state, pos);
	out_pix = mix(new_pix_0,new_pix_1,0.5);
    gl_FragColor = out_pix;

}