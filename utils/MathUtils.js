GG.MathUtils = function() {
	return {
		PI : 3.14159265358979323846,

		degToRads : function(degrees) {
			return this.PI * degrees / 360.0;
		},

		radsToDeg : function(rads) {
			return 180.0 * rads / this.PI;
		},

		clamp : function (val, min, max) {
			if (val < min) return min;
			else if (val > max) return max;
			else return val;
		},

		mat4ToEuler : function (mat) {
			var sp = -mat[6];
			if ( sp <= -1.0 ) {
				var p = -GG.PI_OVER_2;

			} else if ( sp >= 1.0 ) {
				p = GG.PI_OVER_2;

			} else {
				p = Math.asin( sp ) ;
			}	

			// Check for the Gimbal lock case , giving a slight tolerance
			// for numerical imprecision
			if ( Math.abs( sp ) > 0.9999) {
				// We are looking straight up or down.
				// Slam bank to zero and just set heading
				b = 0.0;
				h = Math.atan2(-mat[8], mat[0]) ;
			} else {
				// Compute heading from m13 and m33
				h = Math.atan2(mat[2], mat[10]) ;
				// Compute bank from m21 and m22
				b = Math.atan2(mat[4], mat[5]) ;
			}
			return [h, p, b];
		},

		isPowerOf2 : function (val) {
			return (val & (val - 1)) === 0;
		},

		gaussianWeight : function(x, sigma) {
			var sigma2 = sigma * sigma;
			return (1 / Math.sqrt(2 * 3.141592 * sigma2)) * Math.exp(-((x * x) / (2.0*sigma2)));  
		},
				
		getGaussianWeights : function(size, sigma) {
			var weights = [];	
			weights[0] = GG.MathUtils.gaussianWeight(0, sigma);
			var sum = weights[0];
			for (var i = 1; i < size; i++) {
				weights[i] = GG.MathUtils.gaussianWeight(i, sigma);
				sum += 2*weights[i];
			}
		    
			for (i = 0; i < size; i++) {
				weights[i] /= sum;
			}
			return weights;
		}
	}
}();

