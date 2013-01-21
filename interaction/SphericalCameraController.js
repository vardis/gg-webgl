GG.SphericalCameraController = function (spec) {
	this.center     = [0, 0, 0];
	this.up         = [0, 1, 0];
	this.camera     = null;
	this.speed      = 0.5;
	this.rotX = 0;
	this.rotY = 0;
	this.dragging   = false;
	this.lastMouseX = null;
	this.lastMouseY = null;

	var self = this;
    this.mouseDownCallback = function(x, y) {
        self.handleMouseDown(x, y);
    }
    this.mouseUpCallback = function(x, y) {
        self.handleMouseUp(x, y);
    }
    this.mouseMoveCallback = function(x, y) {
        self.handleMouseMove(x, y);
    }
    this.mouseWheelCallback = function(deltaY) {
        self.handleMouseWheel(deltaY);
    }
    this.keyDownCallback = function(keyCode) {
        self.handleKeyDown(keyCode);
    };

	GG.mouseInput.onMouseDown(this.mouseDownCallback);
    GG.mouseInput.onMouseUp(this.mouseUpCallback);
    GG.mouseInput.onMouseMove(this.mouseMoveCallback);
    GG.mouseInput.onMouseWheel(this.mouseWheelCallback);
    GG.keyboardInput.onKeyDown(this.keyDownCallback);
};

GG.SphericalCameraController.prototype.constructor = GG.SphericalCameraController;

GG.SphericalCameraController.prototype.rotateLeftMatrix = function (angle, up) {
	var rotMat = mat4.identity();
	mat4.rotate(rotMat, angle, up);
	return rotMat;    
};

GG.SphericalCameraController.prototype.rotateUpMatrix = function (angle, eye, up) {
 	var cameraZ = vec3.normalize(vec3.subtract([0,0,0], eye));
  	var cameraY = vec3.normalize(up);
  	var cameraX = vec3.normalize(vec3.cross(cameraZ, cameraY, vec3.create()));

	var rotMat = mat4.identity();
	return mat4.rotate(rotMat, angle, cameraX);	
};

GG.SphericalCameraController.prototype.rotateCamera = function (rx, ry) {
	var rotLeft = this.rotateLeftMatrix(rx, this.camera.up);
	mat4.multiplyVec3(rotLeft, this.camera.position);

	var rotUp = this.rotateUpMatrix(ry, this.camera.position, this.camera.up);
	mat4.multiplyVec3(rotUp, this.camera.position);
	mat4.multiplyVec3(rotUp, this.camera.up);
};

GG.SphericalCameraController.prototype.handleMouseDown = function (x, y) {
    this.dragging  = true;
    this.lastMouseX = x;
    this.lastMouseY = y;
};

GG.SphericalCameraController.prototype.handleMouseUp = function (x, y) {
    this.dragging = false;
};

GG.SphericalCameraController.prototype.handleMouseMove = function (x, y) {
    if (this.camera != null && this.dragging) {
        this.rotX  += x - this.lastMouseX;
	    this.rotY  += y - this.lastMouseY;
		this.lastMouseX = x;
	    this.lastMouseY = y;

	    this.rotX *= this.speed;
	    this.rotY *= this.speed;
	    this.rotateCamera(GG.MathUtils.degToRads(this.rotX), GG.MathUtils.degToRads(this.rotY));
    }
};

GG.SphericalCameraController.prototype.handleMouseWheel = function (deltaY) {
    if (this.camera != null) {
    	var delta = deltaY * 0.01;
    	this.camera.zoom(delta);
	}
};

GG.SphericalCameraController.prototype.handleKeyDown = function(keyCode) {
	if (this.camera != null) {
	    switch (keyCode) {
	        case GG.KEYS.LEFT:
	            this.rotateCamera(-0.2, 0);
	            break;

	        case GG.KEYS.RIGHT:
	            this.rotateCamera(0.2, 0);
	            break;

	        case GG.KEYS.UP:
	            this.rotateCamera(0, -0.2);
	            break;

	        case GG.KEYS.DOWN:
	            this.rotateCamera(0, 0.2);
	            break;

	        default: break;
	    }
	}
};
    
GG.SphericalCameraController.prototype.getCamera = function () {
    return this.camera;
};

GG.SphericalCameraController.prototype.setCamera = function (c) {
    this.camera = c;
    if (this.camera != null) {
    	this.camera.lookAt = [0, 0, 0];
	}
    return this;
};
