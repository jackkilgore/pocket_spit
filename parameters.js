
var UniformObj = {
	name: undefined,
	value: undefined
}

function Uniform(name,init_value=0) {
	let uniform = Object.create( UniformObj );
	uniform.name = name
	uniform.value = init_value

    return uniform
}

// DEFINE UNIFORMS HERE
function UniformDict() {
	uniform_dict = {}
	let uniform_temp

	uniform_temp = Uniform("u_resolution",[-1,-1])
	uniform_dict[uniform_temp.name] = uniform_temp

	uniform_temp = Uniform("u_state",[[-1]])
	uniform_dict[uniform_temp.name] = uniform_temp

	uniform_temp = Uniform("u_timeS",0.0)
	uniform_dict[uniform_temp.name] = uniform_temp

	uniform_temp = Uniform("u_slider_1",0.0)
	uniform_dict[uniform_temp.name] = uniform_temp

    uniform_temp = Uniform("u_slider_speed",0.0)
	uniform_dict[uniform_temp.name] = uniform_temp

    uniform_temp = Uniform("u_slider_rot",0.0)
	uniform_dict[uniform_temp.name] = uniform_temp
	
	return uniform_dict
}


var ParamObj = {
	name: undefined,
	value: undefined,
	address: undefined,
	display_name: undefined,
    
}

// 3 possible contexts will write to Param
// 1) OSC
// 2) JSON
// 3) Direct. manual setting
function Param(name,init_value=0,address=undefined,display_name=undefined) {
	let param = Object.create( ParamObj );
	param.name = name
	if (param.display_name === undefined)
		param.display_name = param.name
    else
        param.display_name = display_name
	param.value = init_value
	param.address = address
    return param
}

// ENUMS
const param_mode = {
    osc: 'osc',
    json: 'json',
    none: 'none',
};

const pnames = {
    slider_1: 0,
    slider_speed: 1,
    slider_rot: 2,
    slider_grit: 3,
    slider_horiz: 4,
    slider_vert: 5,
    slider_damp: 6,
    trig: 7
}

// DEFINE PARAMTERS HERE
function ParamDict() {
	param_dict = {
        PARAM_MODE: param_mode.none,
        params: [],
        getParam: function(pname) { return this.params[pname]}
    }

	let OSC_NAMESPACE = '/pocketspit'
	let param_temp

	param_temp = Param('slider_1',0.0001,OSC_NAMESPACE + '/slider_1')
	param_dict['params'][pnames.slider_1] = param_temp

    param_temp = Param('slider_speed',0.0001,OSC_NAMESPACE + '/slider_speed')
	param_dict['params'][pnames.slider_speed] = param_temp

    param_temp = Param('slider_rot',0.0001,OSC_NAMESPACE + '/slider_rot')
	param_dict['params'][pnames.slider_rot] = param_temp

    param_temp = Param('slider_grit',0.0001,OSC_NAMESPACE + '/slider_grit')
	param_dict['params'][pnames.slider_grit] = param_temp

    param_temp = Param('slider_horiz',0.0001,OSC_NAMESPACE + '/slider_horiz')
	param_dict['params'][pnames.slider_horiz] = param_temp

    param_temp = Param('slider_vert',1.0001,OSC_NAMESPACE + '/slider_vert')
	param_dict['params'][pnames.slider_vert] = param_temp

    param_temp = Param('slider_damp',0.001,OSC_NAMESPACE + '/slider_damp')
	param_dict['params'][pnames.slider_damp] = param_temp

    param_temp = Param('trig',false,OSC_NAMESPACE + '/trig')
	param_dict['params'][pnames.trig] = param_temp

	return param_dict
}

var ParamBuffObj = {
	buff: undefined,
	name: undefined,
	pushParam: function(param_val) {
		this.buff.push(param_val)
	}
}

// Everything defined here will be saved by JSON.stringify. The rest will be hidden
function ParamBuff(name) {
    let obj = Object.create( ParamBuffObj );
	obj.name = name
	obj.buff = []
    return obj
}

// GLOBALS
UNIFORMS = UniformDict()
PARAMS = ParamDict()

PARAMS['PARAM_MODE'] = param_mode.osc
