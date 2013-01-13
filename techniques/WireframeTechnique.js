/**
 * Renders the wireframe display of a renderable using lines. A depth offset can be supplied
 * in order to avoid z-fighting.
 * It can be applied only on renderables that provide a getAsLineMesh method returning a LineMesh
 * The returned LineMesh is supposed to provide the vertex, colour, UV information for the lines rendering.
 */
GG.WireframeTechnique = function (spec) {
	spec              = spec || {};
	spec.passes = [ new GG.WireframeTechnique.WireframePass(spec) ];
	GG.BaseTechnique.call(this, spec);	
};

GG.WireframeTechnique.prototype             = new GG.BaseTechnique();
GG.WireframeTechnique.prototype.constructor = GG.WireframeTechnique;

GG.WireframeTechnique.WireframePass = function (spec) {
	spec             = spec || {};
	spec.vertexShader = [
		"precision highp float;",
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"uniform float u_depthOffest;",
		"void main() {",
		"	vec4 viewPos = u_matModelView * a_position;",
		"	viewPos.z += u_depthOffest;",
		"	gl_Position = u_matProjection * viewPos;",
		"}"
	].join('\n');

	spec.fragmentShader = [		
		"precision highp float;",
		"uniform vec3 u_wireColor;",
		"void main() {",
		"	gl_FragColor = vec4(u_wireColor, 1.0);",
		"}"
	].join('\n');

	GG.RenderPass.call(this, spec);
};

GG.WireframeTechnique.WireframePass.prototype             = new GG.RenderPass();
GG.WireframeTechnique.WireframePass.prototype.constructor = GG.WireframeTechnique.WireframePass;

GG.WireframeTechnique.WireframePass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform3fv(program.u_wireColor, renderable.material.diffuse);
	gl.uniform1f(program.u_depthOffest, renderable.material.wireOffset);
};

GG.WireframeTechnique.WireframePass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	gl.lineWidth(renderable.material.wireWidth);
	//gl.enable(gl.POLYGON_OFFSET_FILL);
	//gl.polygonOffset(1.1,10);
};


GG.WireframeTechnique.WireframePass.prototype.overrideRenderPrimitive = function(renderable) {
	return GG.RENDER_LINES;
};