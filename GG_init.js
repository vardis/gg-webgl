var GG = {
	version : "1.0",
	context : null,
	PI : 3.14159265358979323846,

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
		GG.TEX_UNIT_DIFFUSE_MAP  = 0,
		GG.TEX_UNIT_NORMAL_MAP   = 1,
		GG.TEX_UNIT_SPECULAR_MAP = 2,
		GG.TEX_UNIT_ALPHA_MAP    = 3,
		GG.TEX_UNIT_GLOW_MAP     = 4,
		GG.TEX_UNIT_SHADOW_MAP   = 5
	}
	
};

			
var gl, canvas;
			
String.prototype.times = function(n) {
    return Array.prototype.join.call({length:n+1}, this);
};
			


		