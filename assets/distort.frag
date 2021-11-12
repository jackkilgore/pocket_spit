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

	vec4 new_pix;
	// Return state
	if (u_bang == 0) {
		new_pix = texture2D(u_state, pos);
	}
	// Do feedback chain here:
	else {
		// Rotate by theta. 
		// Notice how we are attempting to replace time dependent rotation with state depenendent.
		float theta = 0.1;
		vec2 rot_pos = rotateUVmatrix(pos, vec2(0.5,0.5), theta);
		new_pix = texture2D(u_state, rot_pos);
	}

    gl_FragColor = new_pix;

}