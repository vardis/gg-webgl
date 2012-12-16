GG.MouseHandler = function() {
	this.mouseDown  = false;
	this.lastMouseX = null;
	this.lastMouseY = null;
	this.camera     = null;
	this.rotX       = 0.0;
	this.rotY       = 0.0;

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

GG.MouseHandler.prototype.constructor = GG.MouseHandler;

GG.MouseHandler.prototype.handleMouseDown = function (x, y) {
    this.mouseDown  = true;
    this.lastMouseX = x;
    this.lastMouseY = y;
};

GG.MouseHandler.prototype.handleMouseUp = function (x, y) {
    this.mouseDown = false;
};

GG.MouseHandler.prototype.handleMouseMove = function (x, y) {
    if (!this.mouseDown) {
        return;
    }
    this.rotY  += x - this.lastMouseX;
    this.rotX  += y - this.lastMouseY;

    this.camera.setRotation([this.rotX, this.rotY, 0.0]);

    this.lastMouseX = x;
    this.lastMouseY = y;
};

GG.MouseHandler.prototype.handleMouseWheel = function (deltaY) {
    var delta = deltaY * 0.01;
    this.camera.zoom(delta);
};

GG.MouseHandler.prototype.handleKeyDown = function(keyCode) {
    switch (keyCode) {
        case GG.KEYS.LEFT:
            this.camera.right(-0.2);
            console.log("left");
            break;

        case GG.KEYS.RIGHT:
            this.camera.right(0.2);
            console.log("right");
            break;

        case GG.KEYS.UP:
            this.camera.forward(-0.2);
            console.log("forward");
            break;

        case GG.KEYS.DOWN:
            this.camera.forward(0.2);
            console.log("backwards");
            break;

        case GG.KEYS.PAGE_UP:
            this.camera.elevate(0.2);
            break;

        case GG.KEYS.PAGE_DOWN:
            this.camera.elevate(-0.2);
            break;

        default: break;
    }
};
    
GG.MouseHandler.prototype.getCamera = function () {
    return this.camera;
};

GG.MouseHandler.prototype.setCamera = function (c) {
    this.camera = c;
    return this;
};


