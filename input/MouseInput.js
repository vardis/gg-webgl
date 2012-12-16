GG.MouseInput = function() {
    this.mouseDownHandlers   = [];
    this.mouseUpHandlers     = [];
    this.clickHandlers       = [];
    this.doubleClickHandlers = [];
    this.wheelHandlers       = [];
    this.moveHandlers        = [];
};

GG.MouseInput.prototype.constructor = GG.MouseInput;

GG.MouseInput.prototype.initialize = function() {
    var self = this;

    this.handleMouseDown = function (event) {
        self.invokeHandlers(event, self.mouseDownHandlers);
    };

    this.handleMouseUp = function (event) {
        self.invokeHandlers(event, self.mouseUpHandlers);
    };

    //TODO: check if this is cross browser
    this.handleMouseWheel = function (event) {
        self.wheelHandlers.forEach(function(h) {
            h(event.detail ? -120*event.detail : event.wheelDeltaY);
        });
    };

    this.handleMouseClick = function (event) {
        self.invokeHandlers(event, self.clickHandlers);
    };

    this.handleMouseDoubleClick = function (event) {
        self.invokeHandlers(event, self.doubleClickHandlers);
    };

    this.handleMouseMove = function (event) {
        self.invokeHandlers(event, self.moveHandlers);
    };

    GG.canvas.addEventListener('mousedown', this.handleMouseDown, false);
    GG.canvas.addEventListener('mouseup', this.handleMouseUp, false);
    GG.canvas.addEventListener('mouseclick', this.handleMouseClick, false);
    GG.canvas.addEventListener('mousedblclick', this.handleMouseDoubleClick, false);
    GG.canvas.addEventListener('mousemove', this.handleMouseMove, false);

    GG.canvas.addEventListener('mousewheel', this.handleMouseWheel, false);
    // Firefox
    GG.canvas.addEventListener('DOMMouseScroll', this.handleMouseWheel, false);
};

GG.MouseInput.prototype.getCanvasLocalCoordsFromEvent = function (event) {
    var x, y;
    var offsetLeft = GG.canvas.offsetLeft, offsetTop = GG.canvas.offsetTop;

    if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
    } else {
        var body_scrollLeft = document.body.scrollLeft,
            element_scrollLeft = document.documentElement.scrollLeft,
            body_scrollTop = document.body.scrollTop,
            element_scrollTop = document.documentElement.scrollTop;
        x = event.clientX + body_scrollLeft + element_scrollLeft;
        y = event.clientY + body_scrollTop + element_scrollTop;
    }
    x -= offsetLeft;
    y -= offsetTop;
    return [x, y];
};

GG.MouseInput.prototype.invokeHandlers = function (event, handlers) {
    var canvasCoords = this.getCanvasLocalCoordsFromEvent(event);
    handlers.forEach(function(h) {
        h(canvasCoords[0], canvasCoords[1]);
    });
    //TODO: signal that default processing should be skipped
};

GG.MouseInput.prototype.onMouseMove = function(callback) {
    this.moveHandlers.push(callback);
};

GG.MouseInput.prototype.removeOnMouseMove = function(callback) {
    this.moveHandlers.splice(this.moveHandlers.indexOf(callback), 1);
};

GG.MouseInput.prototype.onMouseDown = function(callback) {
    this.mouseDownHandlers.push(callback);
};

GG.MouseInput.prototype.removeOnMouseDown = function(callback) {
    this.mouseDownHandlers.splice(this.mouseDownHandlers.indexOf(callback), 1);
};

GG.MouseInput.prototype.onMouseUp = function(callback) {
    this.mouseUpHandlers.push(callback);
};

GG.MouseInput.prototype.removeOnMouseUp = function(callback) {
    this.mouseUpHandlers.splice(this.mouseUpHandlers.indexOf(callback), 1);
};

GG.MouseInput.prototype.onMouseWheel = function(callback) {
    this.wheelHandlers.push(callback);
};

GG.MouseInput.prototype.removeOnMouseWheel = function(callback) {
    this.wheelHandlers.splice(this.wheelHandlers.indexOf(callback), 1);
};

GG.MouseInput.prototype.onMouseClick = function(callback) {
    this.clickHandlers.push(callback);
};

GG.MouseInput.prototype.removeOnMouseClick = function(callback) {
    this.clickHandlers.splice(this.clickHandlers.indexOf(callback), 1);
};

GG.MouseInput.prototype.onMouseDoubleClick = function(callback) {
    this.doubleClickHandlers.push(callback);
};

GG.MouseInput.prototype.removeOnMouseDoubleClick = function(callback) {
    this.doubleClickHandlers.splice(this.doubleClickHandlers.indexOf(callback), 1);
};
