GG.DepthMapDebugOutput = function (spec) {
	spec = spec || {};
	this.minDepth = spec.minDepth != undefined ? spec.minDepth : 1.0;
	this.maxDepth = spec.maxDepth != undefined ? spec.maxDepth : 100.0;

	var vs = [
		"precision highp float;",
		"attribute vec4 a_position;",
		"varying vec2 v_texCoords;",
		"void main() { ",
		"	v_texCoords = 0.5*a_position.xy + vec2(0.5);",
		"	//v_texCoords.y = 1.0 - v_texCoords.y;",
		" 	gl_Position = a_position;",
		" }"
	].join('\n');

	var fs = [
		"precision highp float;",
		"uniform sampler2D u_sourceTexture;",
		"uniform float u_minDepth;",
		"uniform float u_maxDepth;",
		"varying vec2 v_texCoords;",

		GG.ShaderLib.blocks['libUnpackRrgbaToFloat'],

		"void main() {",
		"	vec4 enc = texture2D(u_sourceTexture, v_texCoords);",
		"	float c = libUnpackRrgbaToFloat(enc);",
		"	gl_FragColor = vec4(c, c, c, 1.0);",
		"}"

	].join('\n');
	
	spec['vertexShader'] = vs;
	spec['fragmentShader'] = fs;
	GG.ScreenPass.call(this, spec);
};

GG.DepthMapDebugOutput.prototype = new GG.ScreenPass();

GG.DepthMapDebugOutput.prototype.constructor = GG.DepthMapDebugOutput;

GG.DepthMapDebugOutput.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	GG.ScreenPass.prototype.__setCustomUniforms.call(this, renderable, renderContext, program);
	gl.uniform1f(program.u_maxDepth, this.maxDepth);
	gl.uniform1f(program.u_minDepth, this.minDepth);
};
