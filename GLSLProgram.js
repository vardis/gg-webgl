GG.GLSLProgram = function (spec) {
	spec = spec || {};
	this.vertexShader = spec.vertexShader || '';
	this.fragmentShader = spec.fragmentShader || '';
	this.compiled = false;
	this.gpuProgram = null;
	this.hashKey = 0;
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
	attribPosition : 'a_position',
	attribNormal : 'a_normal',
	attribTexCoords : 'a_texCoords',
	attribColor : 'a_color'
};

GG.GLSLProgram.UniformModelMatrix = 'u_matModel';
GG.GLSLProgram.UniformNormalMatrix = 'u_matNormals';
GG.GLSLProgram.UniformModelViewMatrix = 'u_matModelView';
GG.GLSLProgram.UniformViewMatrix = 'u_matView';
GG.GLSLProgram.UniformProjectionMatrix = 'u_matProjection';
GG.GLSLProgram.UniformTime0_X = 'fTime0_X';

GG.GLSLProgram.BuiltInUniforms = [
	GG.GLSLProgram.UniformModelMatrix,
	GG.GLSLProgram.UniformNormalMatrix,
	GG.GLSLProgram.UniformViewMatrix,
	GG.GLSLProgram.UniformModelViewMatrix,
	GG.GLSLProgram.UniformProjectionMatrix,
	GG.GLSLProgram.UniformTime0_X
];

