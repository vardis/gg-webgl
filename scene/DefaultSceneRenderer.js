GG.DefaultSceneRenderer = function (spec) {
	spec                       = spec || {};
	this.scene                 = spec.scene;
	this.camera                = spec.camera;
	this.programCache          = {};
	this.shadowTechnique       = new GG.ShadowMapTechnique({ shadowType : GG.SHADOW_MAPPING });
	this.ambientTechnique      = new GG.AmbientLightingTechnique();
	this.depthPrePassTechnique = new GG.DepthPrePassTechnique();
	this.dbg                   = new GG.DepthMapDebugOutput();	
	/*
	this.backgroundQueue = new GG.RenderQueue({ name : 'background', priority : 0 });
	this.defaultQueue    = new GG.RenderQueue({ name : 'default', priority : 1 });
	this.overlayQueue    = new GG.RenderQueue({ name : 'overlay', priority : 2 });
*/
	
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

GG.DefaultSceneRenderer.prototype.findVisibleObjects = function(scene, camera) {
	return scene.listObjects();
};

GG.DefaultSceneRenderer.prototype.findShadowCasters = function(scene, camera) {
	return scene.listObjects().filter(function castsShadows(obj) {
		return obj.material.castsShadows;
	});
};

GG.DefaultSceneRenderer.prototype.findShadowReceivers = function(objectsList) {
	return objectsList.filter(function receivesShadows(obj) {
		return obj.material.receivesShadows;
	});
};

GG.DefaultSceneRenderer.prototype.findNonShadowed = function(objectsList) {
	return objectsList.filter(function receivesShadows(obj) {
		return !obj.material.receivesShadows;
	});
};

GG.DefaultSceneRenderer.prototype.findShadelessObjects = function(objectsList) {
	return objectsList.filter(function shadeless(obj) {
		return obj.material.shadeless;
	});
};

GG.DefaultSceneRenderer.prototype.findShadedObjects = function(objectsList) {
	return objectsList.filter(function shaded(obj) {
		return !obj.material.shadeless;
	});
};

GG.DefaultSceneRenderer.prototype.findEffectiveLights = function(scene, camera) {
	return scene.listLights();
};

GG.DefaultSceneRenderer.prototype.findShadowCastingLights = function(lights) {
	return lights.filter(function (light) {
		return light.lightType != GG.LT_POINT;
	});
};

/**
 * Bind render target, if any
 * Clear the color and depth buffers
 * Render a pre-pass depth pass
 * Find the objects visible for the current camera
 * Find the lights close enough to affect the scene
 * For each light
 *   Find the objects that are affected by it
 *   Render shadow map for light, if shadows are enabled
 *   Render the list of objects 
 * Unbind render target, if any
 */
GG.DefaultSceneRenderer.prototype.render = function(renderTarget) {	
	var ctx            = new GG.RenderContext();
	ctx.camera         = this.camera;
	ctx.scene          = this.scene;
	ctx.renderTarget   = renderTarget;
	
	var visibleObjects   = this.findVisibleObjects(this.scene, this.camera);
	var shadedObjects    = this.findShadedObjects(visibleObjects);
	var nonShadedObjects = this.findShadelessObjects(visibleObjects);
	var shadowCasters    = this.findShadowCasters(this.scene);
	var shadowReceivers  = this.findShadowReceivers(visibleObjects);
	var shadedShadowedObjects = this.findShadowReceivers(shadedObjects);
	var shadedNonShadowedObjects = this.findNonShadowed(shadedObjects);
	var nonShadedShadowedObjects = this.findShadowReceivers(nonShadedObjects);
	var nonShadedNonShadowedObjects = this.findNonShadowed(nonShadedObjects);

	// TODO: Create an ambient light set to the ambient light of the scene
	var effectiveLights = this.findEffectiveLights(this.scene, this.camera);
	
	var vp = this.camera.getViewport();

    var sl;
	try {
		if (renderTarget) {
			renderTarget.activate();	
		} else {
			//this.renderer.setViewport(this.camera.getViewport());			
			gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
			gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor()[2], 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		// fills the depth buffer only in order to skip processing for invisible fragments
		this.renderDepthPrePass(visibleObjects, ctx);		

		// additively blend the individual light passes
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.ONE, gl.ONE);

		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.enable(gl.CULL_FACE);

		// render objects that are affected by lighting and by shadows		
		if (this.scene.ambientLight !== null) {
			ctx.light = this.scene.ambientLight;
			this.renderObjectsWithAmbient(ctx, shadedShadowedObjects);
		}

		for (var i = effectiveLights.length - 1; i >= 0; i--) {
            ctx.light = effectiveLights[i];
            this.renderListOfObjects(ctx, shadedShadowedObjects);
		}

		// render objects that are not affected by lighting but are affected by shadows
		this.renderListOfObjects(ctx, nonShadedNonShadowedObjects);

		var shadowLights = this.findShadowCastingLights(effectiveLights);
		var enableShadows = this.scene.hasShadows() && this.shadowTechnique && shadowLights.length > 0 && shadowReceivers.length > 0 && shadowCasters.length > 0;
		if (enableShadows) {			
			// applies the shadows on top of the scene with multiplicative blending
			for (var i = shadowLights.length - 1; i >= 0; i--) {	
				var light = shadowLights[i];
				ctx.light = light;	
				this.shadowTechnique.buildShadowMap(shadowCasters, ctx);

				sl = light;
				
				//TODO: re-set the render state here, it is compromised by the shadow technique
				gl.viewport(0, 0, vp.getWidth(), vp.getHeight());

				// emulates a multiplicative blending mode
				gl.enable(gl.BLEND);
				//gl.disable(gl.BLEND);
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.DST_COLOR, gl.ZERO);	
				//gl.blendFunc(gl.ONE, gl.ONE);

				gl.enable(gl.CULL_FACE);
				gl.cullFace(gl.BACK);
				gl.frontFace(gl.CCW);

				for (var j = shadowReceivers.length - 1; j >= 0; j--) {		
					this.shadowTechnique.render(shadowReceivers[j], ctx);		
				}				
			}
		}

		gl.disable(gl.BLEND);

		// render objects that are affected by lighting but not by shadows		
		if (this.scene.ambientLight !== null) {
			ctx.light = this.scene.ambientLight;
			this.renderObjectsWithAmbient(ctx, shadedNonShadowedObjects);
		}
		
		for (var i = effectiveLights.length - 1; i >= 0; i--) {
            ctx.light = effectiveLights[i];
            this.renderListOfObjects(ctx, shadedNonShadowedObjects);
		}

		// render objects that are not affected by lighting nor by shadows
		this.renderListOfObjects(ctx, nonShadedNonShadowedObjects);

	} finally {
		gl.disable(gl.BLEND);
		if (renderTarget) renderTarget.deactivate();
	}

	if (enableShadows) {
		gl.viewport(0, 0, 320, 200);
		var cam = sl.getShadowCamera();
		
		this.dbg.sourceTexture = this.shadowTechnique.getShadowMapTexture();
		this.dbg.minDepth = cam.near;
		this.dbg.maxDepth = cam.far;
		this.dbg.render();
	}
	
};

GG.DefaultSceneRenderer.prototype.renderDepthPrePass = function (visibleObjects, ctx) {
	try {		
    	gl.colorMask(false, false, false, false);
    	for (var i = visibleObjects.length - 1; i >= 0; i--) {		
			this.depthPrePassTechnique.render(visibleObjects[i], ctx);		
		}
	} finally {		
    	gl.colorMask(true, true, true, true);
	}
	
};

GG.DefaultSceneRenderer.prototype.renderListOfObjects = function (renderContext, objectsList) {
	for (var j = objectsList.length - 1; j >= 0; j--) {
		var renderable = objectsList[j];						
		var technique = renderable.getMaterial().getTechnique();
		technique.render(renderable, renderContext);				
	}
}

GG.DefaultSceneRenderer.prototype.renderObjectsWithAmbient = function (renderContext, objectsList) {
	for (var j = objectsList.length - 1; j >= 0; j--) {
		var renderable = objectsList[j];								
		this.ambientTechnique.render(renderable, renderContext);				
	}
}
