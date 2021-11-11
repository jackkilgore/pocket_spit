#define M_PI 3.1415926535897932384626433832795
#define M_2PI 6.283185307179586

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D u_buffer;
uniform sampler2D u_seed;
uniform vec2 u_seed_res;
uniform sampler2D u_incoming;

uniform vec2 u_resolution;
uniform float u_timeS;

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

void main( void ) {
    vec2 pos = gl_FragCoord.xy/u_resolution.xy;
    vec2 movie_pos = vec2(pos.x,1.-pos.y);

	vec2 rot_pos = rotateUVmatrix(pos, vec2(0.5,0.5), 0.01 * M_2PI * u_timeS);

    vec4 last_pix = texture2D(u_buffer, rot_pos);

    gl_FragColor = last_pix;

}