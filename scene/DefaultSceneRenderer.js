GG.DefaultSceneRenderer = function (spec) {
	this.scene = spec.scene || null;
	this.camera = spec.camera || null;

	this.depthPass = new GG.ShadowMapDepthPass();
};

GG.DefaultSceneRenderer.prototype.setScene = function(sc) {
	this.scene = sc;
	return this;
};

GG.DefaultSceneRenderer.prototype.getScene = function() {
	return this.scene;
};

GG.DefaultSceneRenderer.prototype.setCamera = function(camera) {
	this.camera = camera;
	return this;
};

GG.DefaultSceneRenderer.prototype.getCamera = function() {
	return this.camera;
};

GG.DefaultSceneRenderer.prototype.render = function(renderTarget) {
	var sceneLights = this.scene.listLights();
	var ctx = new GG.RenderContext();
	ctx.camera = this.camera;
	ctx.scene = this.scene;
	ctx.lights = sceneLights;
	ctx.renderTarget = renderTarget;

	var depthPass = this.depthPass;
	this.scene.perObject(function (renderable) {
		/*
		technique = renderable.getMaterial().getTechnique();
		if (technique) {
			technique.render(renderable, sceneLights);
		}
		*/
		depthPass.render(renderable, ctx);
	});
};