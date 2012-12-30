var GG = {
	version : "1.0",
	context : null,
	PI : 3.14159265358979323846,
	PI_OVER_2 : 3.14159265358979323846 / 2.0,

	joinArrays : function(arrays) {
		var joined = [];
		for (var i = 0; i < arrays.length; i++) {
			joined = joined.concat(arrays[i]);
		}
		return joined;
	},

	cloneDictionary : function(dict) {
		var clone = {};
		for (var k in dict) {
			clone[k] = dict[k];
		}
		return clone;
	},

	init : function () {
		GG.clock = new GG.Clock();		
		
		GG.renderer = new GG.Renderer();
        GG.mouseInput = new GG.MouseInput();
        GG.mouseInput.initialize();
        GG.keyboardInput = new GG.KeyboardInput();
        GG.keyboardInput.initialize();
	}
	
};

var canvas = document.getElementById(window.GG_CANVAS_ID || 'canvasGL');				
var contextName = window.GG_CONTEXT_NAME || "experimental-webgl";
var gl = canvas.getContext(contextName);

GG.context = gl;
GG.canvas = canvas;

gl.viewportWidth  = canvas.width;
gl.viewportHeight = canvas.height;


GG.RENDER_POINTS     = 1;
GG.RENDER_LINES      = 2;
GG.RENDER_LINE_LOOP  = 3;
GG.RENDER_LINE_STRIP = 4;
GG.RENDER_TRIANGLES  = 5;

GG.MAX_DIFFUSE_TEX_UNITS = 8;
GG.TEX_UNIT_DIFFUSE_MAP_0  = 0;
GG.TEX_UNIT_DIFFUSE_MAP_1  = 1;
GG.TEX_UNIT_DIFFUSE_MAP_2  = 2;
GG.TEX_UNIT_DIFFUSE_MAP_3  = 3;
GG.TEX_UNIT_DIFFUSE_MAP_4  = 4;
GG.TEX_UNIT_DIFFUSE_MAP_5  = 5;
GG.TEX_UNIT_DIFFUSE_MAP_6  = 6;
GG.TEX_UNIT_DIFFUSE_MAP_7  = 7;
GG.TEX_UNIT_DIFFUSE_MAPS  = [
	GG.TEX_UNIT_DIFFUSE_MAP_0,
	GG.TEX_UNIT_DIFFUSE_MAP_1,
	GG.TEX_UNIT_DIFFUSE_MAP_2,
	GG.TEX_UNIT_DIFFUSE_MAP_3,
	GG.TEX_UNIT_DIFFUSE_MAP_4,
	GG.TEX_UNIT_DIFFUSE_MAP_5,
	GG.TEX_UNIT_DIFFUSE_MAP_6,
	GG.TEX_UNIT_DIFFUSE_MAP_7
];

GG.TEX_UNIT_NORMAL_MAP   = GG.TEX_UNIT_DIFFUSE_MAP_7 + 1;
GG.TEX_UNIT_SPECULAR_MAP = GG.TEX_UNIT_NORMAL_MAP    + 1;
GG.TEX_UNIT_ALPHA_MAP    = GG.TEX_UNIT_SPECULAR_MAP  + 1;
GG.TEX_UNIT_GLOW_MAP     = GG.TEX_UNIT_ALPHA_MAP     + 1;
GG.TEX_UNIT_SHADOW_MAP   = GG.TEX_UNIT_GLOW_MAP      + 1;
GG.TEX_UNIT_ENV_MAP      = GG.TEX_UNIT_SHADOW_MAP    + 1;			
			
String.prototype.times = function(n) {
    return Array.prototype.join.call({length:n+1}, this);
};



		