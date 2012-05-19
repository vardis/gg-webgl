GG.MathUtils = function() {
	return {
		PI : 3.14159265358979323846,

		degToRads : function(degrees) {
			return this.PI * degrees / 360.0;
		},

		radsToDeg : function(rads) {
			return 180.0 * rads / this.PI;
		}
	}
}();

