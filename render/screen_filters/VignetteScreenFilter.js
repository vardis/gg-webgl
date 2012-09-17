GG.VignetteScreenFilter = function (spec) {
	spec                     = spec || {};
	this.u_vignetteContrast  = spec.u_vignetteContrast != undefined ? spec.u_vignetteContrast : 2.5;
	this.u_vignetteSpread    = spec.u_vignetteSpread != undefined ? spec.u_vignetteSpread : 5.0;
	
	// controls the ratio of the elliptical surface that will be black when the
	// gradient is formed
	this.u_vignetteDarkRatio = spec.u_vignetteDarkRatio != undefined ? spec.u_vignetteDarkRatio : 1.0;
	
	this.u_vignetteColor     = spec.u_vignetteColor != undefined ? spec.u_vignetteColor : [0.02, 0.02, 0.02];
};

GG.VignetteScreenFilter.prototype.constructor = GG.VignetteScreenFilter;

GG.VignetteScreenFilter.prototype.inject = function (programSource) {
	programSource.uniform('float', 'u_vignetteContrast')
		.uniform('float', 'u_vignetteSpread')
		.uniform('float', 'u_vignetteDarkRatio')
		.uniform('vec3', 'u_vignetteColor')
		.addMainBlock([	
		// creates a gradient white-to-black starting from the center
   		"float f = clamp(1.0 - u_vignetteDarkRatio*sqrt(dot(v_texCoords-vec2(0.5), v_texCoords-vec2(0.5))), 0.0, 1.0);",
   
	   // reverses the gradient
	   "float invF = 1.0 - f;",
	   
	   // u_vignetteSpreads the black regions towards the corners
	   // because invF is smaller than 1.0 and by raising it to a power
	   // we get even smaller values. Points near the borders of the image
	   // are decreasing slower as their are closer to 1.0 (being white).
	   "float p1 = pow(invF, u_vignetteContrast);",
   
	   // reverses the colors
	   "float p2 = pow(1.0 - p1, u_vignetteSpread);",
   
	   // p2 varies between 0.0 and 1.0 and it can be used to
	   // interpolate between the original image color and the
	   // shadow color
	   "vec3 vignetterFactor = mix(u_vignetteColor, vec3(1.0), p2);",
	   "color = vec4(vignetterFactor, 1.0) * color;"
	].join('\n'));
};

GG.VignetteScreenFilter.prototype.setUniforms = function (program) {
	gl.uniform1f(program.u_vignetteContrast, this.u_vignetteContrast);
	gl.uniform1f(program.u_vignetteSpread, this.u_vignetteSpread);
	gl.uniform1f(program.u_vignetteDarkRatio, this.u_vignetteDarkRatio);
	gl.uniform3fv(program.u_vignetteColor, this.u_vignetteColor);
};