GG.GaussianBlurPass = function (spec) {
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

		"void main() {",
		"	int halfFilterSize = u_filterSize / 2;",
		"	vec4 color;",
		"	vec2 basis = vec2(u_isHorizontal, 1.0 - u_isHorizontal);",			
		"	for (int i = 0; i < MAX_FILTER_SIZE; i++) {",
		"		if (i > halfFilterSize) break;",
		"		vec2 offset = u_texStepSize * float(i);",
		"		color += texture2D(u_sourceTexture, v_texCoords + offset * basis);",
		"		color += texture2D(u_sourceTexture, v_texCoords - offset * basis);",
		"	}",
		
		"	color /= float(u_filterSize);",
		"	gl_FragColor = vec4(color.rgb, 1.0);",
		"}"].join('\n');

	GG.ScreenPass.call(this, { 
		sourceTexture : spec.sourceTexture,
		vertexShader : GG.ShaderLib.blit.vertex,
		fragmentShader : fs
	});
};


GG.GaussianBlurPass.prototype = new GG.ScreenPass();

GG.GaussianBlurPass.prototype.constructor = GG.GaussianBlurPass;

GG.GaussianBlurPass.prototype.setHorizontal = function() {
	this.isHorizontal = true;
};

GG.GaussianBlurPass.prototype.setVertical = function() {
	this.isHorizontal = false;
};

GG.GaussianBlurPass.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	GG.ScreenPass.prototype.__setCustomUniforms.call(this);
	gl.uniform1i(this.program.u_filterSize, this.filterSize);
	gl.uniform1f(this.program.u_isHorizontal, this.isHorizontal ? 1.0 : 0.0);
	texStep = [ 1.0 / this.sourceTexture.width, 1.0 / this.sourceTexture.height ];
	gl.uniform2fv(program.u_texStepSize, texStep);
};
