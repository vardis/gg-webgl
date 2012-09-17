GG.SampleBase = function (spec) {
	spec = spec || {};
	this.context = spec.context != undefined ? spec.context : "experimental-webgl";
	this.canvas = null;
};

GG.SampleBase.prototype.constructor = GG.SampleBase;

GG.SampleBase.prototype.start = function()  {
	try {
		this.canvas = document.getElementById("c");		
		
		gl = this.canvas.getContext(this.context);
		GG.context = gl;
		GG.canvas = this.canvas;
		GG.init();
		GG.clock = new GG.Clock();		
		
		gl.viewportWidth  = this.canvas.width;
		gl.viewportHeight = this.canvas.height;

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
	// define in subclass
};

GG.SampleBase.prototype.update = function () {
	// define in subclass
};

GG.SampleBase.prototype.tick = function () {
	GG.clock.tick();	
	
	window.sample.update();
	window.sample.draw();
	requestAnimFrame(window.sample.tick);
};
			

