CanvasTextureSample = function (spec) {
	this.renderContext = null;
	GG.SampleBase.call(this, spec);
};

CanvasTextureSample.prototype = new GG.SampleBase();
CanvasTextureSample.prototype.constructor = CanvasTextureSample;

CanvasTextureSample.prototype.initializeAssets = function () {
	this.material = new GG.BaseMaterial();	

	// create the canvas texture
	var canvas = document.getElementById('textureCanvas');
	var ctx = canvas.getContext('2d');
	
	var radial = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
	radial.addColorStop(0.1, 'rgba(10, 10, 10, 1)');
	radial.addColorStop(1.0, 'white');
	ctx.fillStyle = radial;
	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();

	var canvasTexture = GG.Texture.createTexture({ image : canvas });
	this.material.addDiffuseTexture(canvasTexture);
	this.assetsLoaded = true;
};


CanvasTextureSample.prototype.initializeWithAssetsLoaded = function () {
	this.technique = new GG.TexturedShadelessPass();
	this.technique.useScreenCoords = true;

	this.screenQuad = new GG.TriangleMesh(new GG.ScreenAlignedQuad(), this.material);

	this.renderContext = new GG.RenderContext({ camera : this.camera, light : this.light });
	this.initialized = true;
};

CanvasTextureSample.prototype.update = function () {
	GG.SampleBase.prototype.update.call(this);
};

CanvasTextureSample.prototype.draw = function () {
    this.camera.getViewport().activate();
    this.camera.getViewport().setClearColor([1,1,1]);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // render the quad
   this.technique.render(this.screenQuad, this.renderContext);
};
