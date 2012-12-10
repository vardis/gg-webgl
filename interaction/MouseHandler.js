GG.MouseHandler = function() {
	this.mouseDown  = false;
	this.lastMouseX = null;
	this.lastMouseY = null;
	this.camera     = null;
	this.rotX       = 0.0;
	this.rotY       = 0.0;
	
	var that        = this;
	this.handleMouseDown = function (event) {
		that.mouseDown  = true;
		that.lastMouseX = event.clientX;
		that.lastMouseY = event.clientY;
	};

	this.handleMouseUp = function (event) {
		that.mouseDown = false;
	};

	this.handleKeyDown = function (event) {
		switch (event.keyCode) {
			case 37: 	// left
			that.camera.right(-0.2);
			console.log("left");
			break;

			case 39: 	// right
			that.camera.right(0.2);
			console.log("right");
			break;

			case 38: 	// up
			that.camera.forward(-0.2);
			console.log("forward");
			break;

			case 40: 	// down
			that.camera.forward(0.2);
			console.log("backwards");
			break;		

			case 33: 	// page up
			that.camera.elevate(0.2);
			break;

			case 34: 	// page down
			that.camera.elevate(-0.2);
			break;

			default: console.log('key is: ' + event.keyCode); break;
		}
	};

	this.handleMouseMove = function (event) {
		if (!that.mouseDown) {
		  return;
		}
		var newX   = event.clientX;
		var newY   = event.clientY;
		
		var deltaX = newX - that.lastMouseX;
		that.rotY  += deltaX;
		
		var deltaY = newY - that.lastMouseY;
		that.rotX  += deltaY;

		that.camera.setRotation([that.rotX, that.rotY, 0.0]);
		
		that.lastMouseX = newX;
		that.lastMouseY = newY;
	};

	this.handleMouseWheel = function (event) {
		var delta = event.wheelDeltaY * 0.01;
		that.camera.zoom(delta);
	};
	
	GG.canvas.onmousedown = this.handleMouseDown;
	GG.canvas.onmousewheel = this.handleMouseWheel;
    document.onmouseup = this.handleMouseUp;
    document.onmousemove = this.handleMouseMove;
    document.onkeydown = this.handleKeyDown;
    document.onkeyup = this.handleKeyUp;

    // http://www.sitepoint.com/html5-javascript-mouse-wheel/
    if (GG.canvas.addEventListener) {
		// IE9, Chrome, Safari, Opera
		GG.canvas.addEventListener("mousewheel", this.handleMouseWheel, false);
		// Firefox
		GG.canvas.addEventListener("DOMMouseScroll", this.handleMouseWheel, false);
	} else {
		// IE 6/7/8
		GG.canvas.attachEvent("onmousewheel", this.handleMouseWheel);
	}
};


GG.MouseHandler.prototype.constructor = GG.MouseHandler;

GG.MouseHandler.prototype.getCamera = function () {
    return this.camera;
};

GG.MouseHandler.prototype.setCamera = function (c) {
    this.camera = c;
    return this;
};


