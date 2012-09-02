GG.VSMGaussianBlurPass = function (spec) {
	spec              = spec || {};
	this.filterSize   = spec.filterSize || 2;
	this.isHorizontal = spec.horizontal || true;	

	var fs = [
		"precision highp float;",
		"uniform sampler2D u_sourceTexture;",
		"uniform int u_filterSize;",
		"uniform float u_isHorizontal;",
		"uniform vec2 u_texStepSize;",
		"varying vec2 v_texCoords;",

		"const int MAX_FILTER_SIZE = 24;",

		GG.ShaderLib.blocks['libUnpackVec2ToFloat'],

		GG.ShaderLib.blocks['libPackHalfToVec2'],

		"void main() {",
		"	int halfFilterSize = u_filterSize / 2;",
		"	vec4 color;",
		"	vec2 basis = vec2(u_isHorizontal, 1.0 - u_isHorizontal);",		
		"	float mean = 0.0;",
		"	float mean_2 = 0.0;",
		"	for (int i = 0; i < MAX_FILTER_SIZE; i++) {",
		"		if (i > halfFilterSize) break;",
		"		vec2 offset = u_texStepSize * float(i);",		
		"		vec4 val1 = texture2D(u_sourceTexture, v_texCoords + offset * basis);",
		"		mean += libUnpackVec2ToFloat(val1.xy);",
		"		mean_2 += libUnpackVec2ToFloat(val1.zw);",
		"		vec4 val2 = texture2D(u_sourceTexture, v_texCoords - offset * basis);",
		"		mean += libUnpackVec2ToFloat(val2.xy);",
		"		mean_2 += libUnpackVec2ToFloat(val2.zw);",
		"	}",
		
		"	mean /= float(u_filterSize);",
		"	mean_2 /= float(u_filterSize);",
		"	gl_FragColor = vec4(libPackHalfToVec2(mean), libPackHalfToVec2(mean_2));",
		"}"].join('\n');

	GG.ScreenPass.call(this, { 
		sourceTexture : spec.sourceTexture,
		vertexShader : GG.ShaderLib.blit.vertex,
		fragmentShader : fs
	});
};


GG.VSMGaussianBlurPass.prototype = new GG.ScreenPass();

GG.VSMGaussianBlurPass.prototype.constructor = GG.VSMGaussianBlurPass;

GG.VSMGaussianBlurPass.prototype.setHorizontal = function() {
	this.isHorizontal = true;
};

GG.VSMGaussianBlurPass.prototype.setVertical = function() {
	this.isHorizontal = false;
};

GG.VSMGaussianBlurPass.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	GG.ScreenPass.prototype.__setCustomUniforms.call(this);
	gl.uniform1i(this.program.u_filterSize, this.filterSize);
	gl.uniform1f(this.program.u_isHorizontal, this.isHorizontal ? 1.0 : 0.0);
	texStep = [ 1.0 / this.sourceTexture.width, 1.0 / this.sourceTexture.height ];
	gl.uniform2fv(program.u_texStepSize, texStep);
};
