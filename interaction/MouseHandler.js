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
	}

	this.handleMouseUp = function (event) {
		that.mouseDown = false;
	}

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

			default: break;
		}
	}

	this.handleMouseMove = function (event) {
		if (!that.mouseDown) {
		  return;
		}
		var newX   = event.clientX;
		var newY   = event.clientY;
		
		var deltaX = newX - that.lastMouseX;
		that.rotY  += deltaX;
		
		/*
		var newRotationMatrix = mat4.create();
		mat4.identity(newRotationMatrix);
		mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
*/
		var deltaY = newY - that.lastMouseY;
		that.rotX  += deltaY;

		that.camera.setRotation([that.rotX, that.rotY, 0.0]);
		/*
		mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
		mat4.multiply(newRotationMatrix, moonRotationMatrix, moonRotationMatrix);
*/
		that.lastMouseX = newX
		that.lastMouseY = newY;
	}
	
	GG.canvas.onmousedown = this.handleMouseDown;
    document.onmouseup = this.handleMouseUp;
    document.onmousemove = this.handleMouseMove;
    document.onkeydown = this.handleKeyDown;
    document.onkeyup = this.handleKeyUp;
};


GG.MouseHandler.prototype.constructor = GG.MouseHandler;

GG.MouseHandler.prototype.getCamera = function() {
	return this.camera;
}

GG.MouseHandler.prototype.setCamera = function(c) {
	this.camera = c;
	return this;
}


