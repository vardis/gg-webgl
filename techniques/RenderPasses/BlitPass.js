GG.BlitPass = function (sourceTexture) {
	GG.ScreenPass.call(this, { 
		sourceTexture : sourceTexture,
		vertexShader : GG.ShaderLib.blit.vertex,
		fragmentShader : GG.ShaderLib.blit.fragment,
		uniforms : GG.ShaderLib.blit.uniforms
	});
};

GG.BlitPass.prototype = new GG.ScreenPass();

GG.BlitPass.prototype.constructor = GG.BlitPass;