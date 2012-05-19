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
	}
};
			
var gl, canvas;
			
String.prototype.times = function(n) {
    return Array.prototype.join.call({length:n+1}, this);
};
			


		