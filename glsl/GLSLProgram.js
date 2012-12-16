GG.GLSLProgram = function (spec) {
	spec                = spec || {};
	this.vertexShader   = spec.vertexShader != undefined ? spec.vertexShader : '';
	this.fragmentShader = spec.fragmentShader != undefined ? spec.fragmentShader : '';
	this.compiled       = false;
	this.gpuProgram     = null;
	this.hashKey        = 0;
};

GG.GLSLProgram.prototype.destroy = function() {
	if (this.gpuProgram) {
		gl.deleteProgram(this.gpuProgram);
	}
};

GG.GLSLProgram.prototype.isCompiled = function() {
	return this.compiled;
};

GG.GLSLProgram.prototype.compile = function() {
	this.gpuProgram = GG.ProgramUtils.createProgram(this.vertexShader.toString(), this.fragmentShader.toString());
	return this;
};

GG.GLSLProgram.prototype.bind = function() {
	gl.useProgram(this.gpuProgram);
	return this;
};

GG.GLSLProgram.prototype.unbind = function() {
	gl.useProgram(null);
	return this;
};

GG.GLSLProgram.BuiltInAttributes = {
	attribPosition  : GG.Naming.AttributePosition,
	attribNormal    : GG.Naming.AttributeNormal,
	attribTexCoords : GG.Naming.AttributeTexCoords,
	attribColor     : GG.Naming.AttributeColor,
    attribTangent   : GG.Naming.AttributeTangent
};

GG.GLSLProgram.BuiltInUniforms = [
	GG.Naming.UniformModelMatrix,
	GG.Naming.UniformNormalMatrix,
	GG.Naming.UniformViewMatrix,
	GG.Naming.UniformModelViewMatrix,
	GG.Naming.UniformProjectionMatrix,
	GG.Naming.UniformTime0_X
];

