GG.SampleBase = function (spec) {
	spec = spec || {};	
	this.canvas  = null;

    this.assetsLoaded = false;
    this.initialized  = false;

    this.mouseHandler  = null;
    this.camera        = null;
};

GG.SampleBase.prototype.constructor = GG.SampleBase;

GG.SampleBase.prototype.start = function()  {
	try {
		GG.init();
		
		/**
		 * Provides requestAnimationFrame in a cross browser way.
		 */
		window.requestAnimFrame = (function() {

		  return window.requestAnimationFrame ||
				 window.webkitRequestAnimationFrame ||
				 window.mozRequestAnimationFrame ||
				 window.oRequestAnimationFrame ||
				 window.msRequestAnimationFrame ||
				 function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
				   window.setTimeout(callback, 1000/60);
				 };
		})();

		window.sample = this;

		this.initialize();

		this.tick();

	} catch (e) {
		alert("error " + e);
	}
};

GG.SampleBase.prototype.initialize = function () {

	this.camera = new GG.PerspectiveCamera();
	this.camera.setPosition([0.0, 0.0, 9.8]);	
	this.camera.getViewport().setWidth(gl.viewportWidth);
	this.camera.getViewport().setHeight(gl.viewportHeight);

	var vp = this.camera.getViewport();
    vp.setClearColor([0,0,0]);
    
    this.mouseHandler = new GG.SphericalCameraController();
	this.mouseHandler.setCamera(this.camera);

    this.initializeAssets();
};

GG.SampleBase.prototype.initializeAssets = function () {
    // define in subclass
};

GG.SampleBase.prototype.initializeWithAssetsLoaded = function () {
	// define in subclass
};

GG.SampleBase.prototype.draw = function () {
    // define in subclass
};

GG.SampleBase.prototype.update = function () {
    if (this.assetsLoaded && !this.initialized) {
        this.initializeWithAssetsLoaded();
    }
};

GG.SampleBase.prototype.drawWithCondition = function () {
    if (this.initialized) {
        this.draw();
    }
};

GG.SampleBase.prototype.tick = function () {
	GG.clock.tick();	
	
	window.sample.update();
	window.sample.drawWithCondition();
	requestAnimFrame(window.sample.tick);
};
			

