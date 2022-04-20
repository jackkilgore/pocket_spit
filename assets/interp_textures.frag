#define M_PI 3.1415926535897932384626433832795
#define M_2PI 6.283185307179586

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform vec2 u_resolution;
uniform float u_interp_amount;




vec4 cos_interp(
   vec4 y1,vec4 y2,
   float mu)
{
   float mu2;

   mu2 = (1.0 - cos(mu*M_PI))/2.0;
   return(y1*(1.0-mu2)+y2*mu2);
}



void main( void ) {

	// Get the color of the current pixel (color_0). 
	//
	vec2 pos_0 = gl_FragCoord.xy/u_resolution.xy;
	pos_0.y = 1.0 - pos_0.y;

	vec4 color_0 = texture2D(u_texA, pos_0);


  	vec4 color_1 = texture2D(u_texB, pos_0);

	gl_FragColor = mix(color_0,color_1, u_interp_amount); 
    // gl_FragColor = cos_interp(color_0,color_1,u_interp_amount);
    // gl_FragColor = vec4(abs(color_1.xyz - color_0.xyz),1.0); // diff


}