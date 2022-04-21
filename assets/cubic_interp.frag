#define M_PI 3.1415926535897932384626433832795
#define M_2PI 6.283185307179586

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform sampler2D u_texC;
uniform sampler2D u_texD;
uniform vec2 u_resolution;
uniform float u_interp_amount;


// INTERPOLATES BETWEEN y1 and y2
vec4 cubic_interp(
   vec4 y0,vec4 y1,
   vec4 y2,vec4 y3,
   float mu)
{
   vec4 a0,a1,a2,a3;
   float mu2;

   mu2 = mu*mu;
   a0 = y3 - y2 - y0 + y1;
   a1 = y0 - y1 - a0;
   a2 = y2 - y0;
   a3 = y1;

   return(a0*mu*mu2+a1*mu2+a2*mu+a3);
}

void main( void ) {

	// Get the color of the current pixel (color_0). 
	//
	vec2 pos_0 = gl_FragCoord.xy/u_resolution.xy;
	pos_0.y = 1.0 - pos_0.y;

	vec4 color_0 = texture2D(u_texA, pos_0);

  	vec4 color_1 = texture2D(u_texB, pos_0);

    vec4 color_2 = texture2D(u_texC, pos_0);

    vec4 color_3 = texture2D(u_texD, pos_0);

    color_0 = vec4(abs(color_3.xyz - color_0.xyz),1.0);
    color_1 = vec4(abs(color_1.xyz - color_0.xyz),1.0); // diff
    color_2 = vec4(abs(color_2.xyz - color_1.xyz),1.0);
    color_3 = vec4(abs(color_0.xyz - color_3.xyz),1.0);

    gl_FragColor = cubic_interp(color_0,color_1,color_2,color_3,u_interp_amount)  * 1.0;


}