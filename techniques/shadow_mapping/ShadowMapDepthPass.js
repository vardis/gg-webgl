GG.ShadowMapDepthPass = function (spec) {
	spec               = spec || {};
	this.vsmMode       = spec.vsmMode != undefined ? spec.vsmMode : false;
	this.camera        = spec.camera;
	this.nearPlaneDist = spec.nearPlaneDist != undefined ? spec.nearPlaneDist : 1.0;
	this.farPlaneDist  = spec.farPlaneDist != undefined ? spec.farPlaneDist : 100.0;

	spec.vertexShader = [
			"precision highp float;",
			"attribute vec4 a_position;",
			"varying vec4 v_viewPosition;",
			"uniform mat4 u_matModel;",
			"uniform mat4 u_matLightView;",
			"uniform mat4 u_matLightProjection;",

			"void main() {",
			"	v_viewPosition = u_matLightView * u_matModel * a_position;",
			"	gl_Position = u_matLightProjection * v_viewPosition;",
			"}"
		].join('\n');

	spec.fragmentShader = [
			"precision highp float;",
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
	
	GG.RenderPass.call(this, spec);
};

GG.ShadowMapDepthPass.prototype = new GG.RenderPass();

GG.ShadowMapDepthPass.prototype.constructor = GG.ShadowMapDepthPass;

GG.ShadowMapDepthPass.prototype.setCamera = function(camera) {
	this.camera = camera;
};

GG.ShadowMapDepthPass.prototype.__setCustomRenderState = function (renderable, ctx, program) {
	gl.disable(gl.BLEND);

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	gl.frontFace(gl.CCW);
};

GG.ShadowMapDepthPass.prototype.__setCustomUniforms = function (renderable) {
	gl.uniform1i(this.program.u_useVSM, this.vsmMode);

	if (this.camera) {
		var invertedRange = 1.0 / (this.camera.far - this.camera.near);
		gl.uniform1f(this.program.u_invertedDepthRange, invertedRange);
	
		gl.uniformMatrix4fv(this.program.u_matLightView, false, this.camera.viewMatrix); //getViewMatrix());
		gl.uniformMatrix4fv(this.program.u_matLightProjection, false, this.camera.getProjectionMatrix());
	}
};