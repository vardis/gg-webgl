GG.DepthPrePassTechnique = function (spec) {
	spec        = spec || {};
	spec.passes = [ new GG.DepthPrePassTechnique.Pass(spec) ];
	GG.BaseTechnique.call(this, spec);
};

GG.DepthPrePassTechnique.prototype             = new GG.BaseTechnique();
GG.DepthPrePassTechnique.prototype.constructor = GG.DepthPrePassTechnique;

GG.DepthPrePassTechnique.Pass = function (spec) {
	spec             = spec || {};
	spec.vertexShader = [
		"precision highp float;",
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",		
		"void main() {",	
		"	gl_Position = u_matProjection * u_matModelView * a_position;",
		"}"
	].join('\n');

	spec.fragmentShader = [		
		"precision mediump float;",
		"void main() {",
		"	gl_FragColor = vec4(1.0);",
		"}"
	].join('\n');

	GG.RenderPass.call(this, spec);
};

GG.DepthPrePassTechnique.Pass.prototype             = new GG.RenderPass();
GG.DepthPrePassTechnique.Pass.prototype.constructor = GG.DepthPrePassTechnique.Pass;

GG.DepthPrePassTechnique.Pass.prototype.getRenderPrimitive = function(renderable) {	
	var t = renderable.material.getTechnique();

	//TODO: Handle renderables with multiple render passes
	return t.passes[0].getRenderPrimitive(renderable);
};