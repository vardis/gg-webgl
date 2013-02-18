GG.FpsCamera = function() {
	this.mouseDown  = false;
	this.lastMouseX = null;
	this.lastMouseY = null;
	this.camera     = null;
	this.rotX       = 0.0;
	this.rotY       = 0.0;
	this.forwardSpeed = 0.2;
	this.strafeSpeed = 0.1;
	
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

GG.FpsCamera.FRONT_VEC = [0, 0, -1];
GG.FpsCamera.UP_VEC    = [0, 1, 0];

GG.FpsCamera.prototype.constructor = GG.FpsCamera;

GG.FpsCamera.prototype.handleMouseDown = function (x, y) {
    this.mouseDown  = true;
    this.lastMouseX = x;
    this.lastMouseY = y;
};

/**
 * inclination is the angle between the +Z direction of the frame and the global +Z vector, 
 * where the angles measures from the XZ plane, not from the zenith.
 * azimuth is the angle between the global +X direction and the +X direction of the frame.
 */
GG.FpsCamera.prototype.rotateReferenceFrame = function (frameViewDir, frameUpDir, inclination, azimuth) {
	var frameZ = vec3.normalize(vec3.create(frameViewDir));
	var frameY = vec3.normalize(vec3.create(frameUpDir));
	var frameX = vec3.cross(frameZ, frameY, vec3.create());

	var azimuthRotation = mat4.identity();
    mat4.rotate(azimuthRotation, azimuth, frameY);
	
	var inclinationRotation = mat4.identity();
	mat4.rotate(inclinationRotation, inclination, frameX);

	var m = mat4.create();
	mat4.multiply(inclinationRotation, azimuthRotation, m);
	return mat4.toMat3(m);
};

GG.FpsCamera.prototype.handleMouseUp = function (x, y) {
    this.mouseDown = false;
};

GG.FpsCamera.prototype.rotateCameraFrame = function () {
	var rx = GG.MathUtils.degToRads(this.rotX);
	var ry = GG.MathUtils.degToRads(this.rotY);
	this.viewFrame = this.rotateReferenceFrame(GG.FpsCamera.FRONT_VEC, GG.FpsCamera.UP_VEC, rx, ry);
	var z = mat3.z(this.viewFrame);
	vec3.scale(z, -1.0);
	this.viewFrame[2] = z[0];
	this.viewFrame[5] = z[1];
	this.viewFrame[8] = z[2];
	this.camera.setUp(mat3.y(this.viewFrame));
	vec3.add(this.camera.position, mat3.z(this.viewFrame), this.camera.lookAt);
};

GG.FpsCamera.prototype.handleMouseMove = function (x, y) {
    if (!this.mouseDown) {
        return;
    }
    this.rotY  += x - this.lastMouseX;
    this.rotX  += y - this.lastMouseY;

    this.lastMouseX = x;
    this.lastMouseY = y;

    this.rotateCameraFrame();
};

GG.FpsCamera.prototype.handleMouseWheel = function (deltaY) {
    var delta = deltaY * 0.01;
    this.camera.zoom(delta);
};

GG.FpsCamera.prototype.handleKeyDown = function(keyCode) {
    switch (keyCode) {
        case GG.KEYS.LEFT:
            var offset = vec3.scale(mat3.x(this.viewFrame), -this.strafeSpeed);
			vec3.add(this.camera.position, offset, this.camera.position);
			vec3.add(this.camera.lookAt, offset, this.camera.lookAt);
            break;

        case GG.KEYS.RIGHT:
            var offset = vec3.scale(mat3.x(this.viewFrame), this.strafeSpeed);
			vec3.add(this.camera.position, offset, this.camera.position);
			vec3.add(this.camera.lookAt, offset, this.camera.lookAt);
            break;

        case GG.KEYS.UP:            
			var offset = vec3.scale( mat3.z(this.viewFrame), -this.forwardSpeed);						
			vec3.add(this.camera.position, offset, this.camera.position);	
			vec3.add(this.camera.lookAt, offset, this.camera.lookAt);		
            break;

        case GG.KEYS.DOWN:
            var offset = vec3.scale(mat3.z(this.viewFrame), this.forwardSpeed);						
			vec3.add(this.camera.position, offset, this.camera.position);
			vec3.add(this.camera.lookAt, offset, this.camera.lookAt);
            break;

        case GG.KEYS.PAGE_UP:
        	var offset = vec3.scale(mat3.y(this.viewFrame), this.forwardSpeed);						
			vec3.add(this.camera.position, offset, this.camera.position);
			vec3.add(this.camera.lookAt, offset, this.camera.lookAt);
            break;

        case GG.KEYS.PAGE_DOWN:
            var offset = vec3.scale(mat3.y(this.viewFrame), -this.forwardSpeed);						
			vec3.add(this.camera.position, offset, this.camera.position);
			vec3.add(this.camera.lookAt, offset, this.camera.lookAt);
            break;

        default: break;
    }
};
    
GG.FpsCamera.prototype.getCamera = function () {
    return this.camera;
};

GG.FpsCamera.prototype.setCamera = function (c) {
    this.camera = c;
    this.viewFrame = mat4.toMat3(this.camera.getViewMatrix());
    return this;
};