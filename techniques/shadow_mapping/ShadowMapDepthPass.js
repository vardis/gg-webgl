GG.ShadowMapDepthPass = function (spec) {

	spec = spec || {};
	this.vsmMode = spec.vsmMode || false;
	this.nearPlaneDist = spec.nearPlaneDist || 1.0;
	this.farPlaneDist = spec.farPlaneDist || 100.0;

	spec.vertexShader = [
			"attribute vec4 a_position;",
			"varying vec4 v_viewPosition;",
			"uniform mat4 u_matModel;",
			"uniform mat4 u_matView;",
			"uniform mat4 u_matProjection;",

			"void main() {",
			"	v_viewPosition = u_matView * u_matModel * a_position;",
			"	gl_Position = u_matProjection * v_viewPosition;",
			"}"
		].join('\n');

	spec.fragmentShader = [
			"precision mediump float;",
			"varying vec4 v_viewPosition;",

			// this is 1.0 / (far_plane_dist - near_plane_dist)
			"uniform float u_invertedDepthRange;",

			GG.ShaderLib.blocks['libPackHalfToVec2'],

			GG.ShaderLib.blocks['libPackFloatToRGBA'],

			// if true then we will encode the depth and the depth squared
			// values as 2 half floats packed into a vec4
			"uniform int u_useVSM;",

			"void main() {",
			// calculates the linear depth, it is more accurate than the projected depth
			"	float linearDepth = length(v_viewPosition) * u_invertedDepthRange;",
			"	if (u_useVSM > 0) {",
			"		gl_FragColor = vec4(libPackHalfToVec2(linearDepth), libPackHalfToVec2(linearDepth*linearDepth));",
			"	} else {",			
			"		gl_FragColor = libPackFloatToRGBA(linearDepth);",
			"	}",
			"}"

		].join('\n');

	spec.uniforms = ['u_matModel', 'u_invertedDepthRange', 'u_useVSM'];
	spec.renderableType = GG.RenderPass.MESH;
	
	GG.RenderPass.call(this, spec);
};

GG.ShadowMapDepthPass.prototype = new GG.RenderPass();

GG.ShadowMapDepthPass.prototype.constructor = GG.ShadowMapDepthPass;

GG.ShadowMapDepthPass.prototype.__setCustomUniforms = function (renderable) {
	gl.uniformMatrix4fv(this.program.u_matModel, false, renderable.getModelMatrix());
	var invertedRange = 1.0 / (this.farPlaneDist - this.nearPlaneDist);
	gl.uniform1f(this.program.u_invertedDepthRange, invertedRange);
	gl.uniform1i(this.program.u_useVSM, this.vsmMode);
}

GG.ShadowMapDepthPass.prototype.__renderGeometry = function (renderable) {

}