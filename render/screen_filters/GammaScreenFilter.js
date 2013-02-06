GG.GammaScreenFilter = function (spec) {
	spec = spec || {};
	if (typeof spec == "number") {
		this.gamma = spec;
	} else {
		this.gamma = spec.gamma != undefined ? spec.gamma : 2.2;
	}		
};

GG.GammaScreenFilter.prototype.constructor = GG.GammaScreenFilter;

GG.PostProcessChain.registerScreenFilter('gamma', GG.GammaScreenFilter);

GG.GammaScreenFilter.prototype.inject = function (programSource) {
	programSource.uniform('float', 'u_gamma')
		.addMainBlock("color.rgb = pow(color.rgb, vec3(u_gamma));");
};

GG.GammaScreenFilter.prototype.setUniforms = function (program) {
	gl.uniform1f(program.u_gamma, 1.0 / this.gamma);
};