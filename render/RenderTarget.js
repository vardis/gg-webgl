/**
 * Creates a render target for off-screen rendering.
 * The target can be customized through a specifications map, with the following keys:
 *	widht : the width in pixels
 *	height : the height in pixels
 *	colorFormat : one of RGB, RGBA, RGBA4, RGB5_A1, RGB565
 *	depthFormat :  DEPTH_COMPONENT16
 *	stencilFormat : STENCIL_INDEX8
 *	useColor : indicates if a color attachment will be used, true or false
 *	useDepth : indicates whether a depth attachment will be used, true or false
 *	useStencil : indicates whether a stencil attachment will be used, true or false
 *	colorAttachment0 : a texture object to use as the first color attachment
 *	depthAttachment : a texture object to use as the depth attachment
 *	stencilAttachment : a texture object to use as the stencil attachment
 *	flipY : indicates whether it should be flip the direction of the y axis in image space 
 *  minFilter : the minification filter: 
 *		NEAREST, LINEAR, NEAREST_MIPMAP_NEAREST, LINEAR_MIPMAP_NEAREST,NEAREST_MIPMAP_LINEAR,LINEAR_MIPMAP_LINEAR                            
 * 	magFilter : the magnification filter: NEAREST, LINEAR
 *	wrapS : wrap mode for the s coordinates: CLAMP_TO_EDGE, REPEAT, MIRRORED_REPEAT
 *	wrapT : wrap mode for the t coordinates: CLAMP_TO_EDGE, REPEAT, MIRRORED_REPEAT
 */
GG.RenderTarget = function(spec) {
	spec                  = spec || {};	
	this.width            = spec.width || 320;
	this.height           = spec.height || 200;
	this.colorFormat      = spec.colorFormat;
	this.depthFormat      = spec.depthFormat;
	this.stencilFormat    = spec.stencilFormat;
	this.useColor         = spec.useColor || true;
	this.useDepth         = spec.useDepth || true;
	this.useStencil       = spec.useStencil || false;
	
	this.clearColor       = spec.clearColor || [0.0, 0.0, 0.0, 1.0];
	this.clearDepth       = spec.clearDepth || 1.0;
	
	this.colorAttachments = [];
	if (this.useColor && spec.colorAttachment0 != undefined) {
		this.colorAttachments.push(spec.colorAttachment0);
	} 

	this.depthAttachment = null;
	if (this.useDepth && spec.depthAttachment != undefined) {
		this.depthAttachment = spec.depthAttachment;
	}

	this.stencilAttachment = null;
	if (this.useStencil && spec.stencilAttachment != undefined) {
		this.stencilAttachment = spec.stencilAttachment;
	}		

	this.renderBuffers = [];
};

GG.RenderTarget.prototype.constructor = GG.RenderTarget;

GG.RenderTarget.prototype.destroy = function () {
	gl.deleteFramebuffer(this.fbo);
	this.renderBuffers.forEach(function(rb) {
		gl.deleteRenderbuffer(rb);
	});	
};

GG.RenderTarget.prototype.initialize = function () {
	this.colorFormat = this.colorFormat || gl.RGBA;
	this.depthFormat = this.depthFormat || gl.DEPTH_COMPONENT16;
	this.stencilFormat = this.stencilFormat || gl.STENCIL_INDEX8;

	this.spec = {
		width : this.width,
		height : this.height,
		colorFormat : this.colorFormat,
		depthFormat : this.depthFormat,
		stencilFormat : this.stencilFormat,
		useColor : this.useColor,
		useDepth : this.useDepth,
		useStencil : this.useStencil,
		clearColor : this.clearColor,
		clearDepth : this.clearDepth,
		colorAttachments : this.colorAttachments,
		depthAttachment : this.depthAttachment,
		stencilAttachment : this.stencilAttachment
	};

	this.fbo = gl.createFramebuffer();
	try {
	    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
	    
		if (this.colorAttachments.length == 0 && this.useColor) {
			var tex = GG.Texture.createTexture(this.spec);
			this.colorAttachments.push(tex);
		}

		if (this.colorAttachments.length > 0) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorAttachments[0].texture, 0);
			if (this.colorAttachments.length == 2) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.colorAttachments[1].texture, 0);
			}
		}

		
		if (this.useDepth && this.depthAttachment != undefined) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthAttachment.texture, 0);

		} else if (this.useDepth) {
			var buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.depthFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.depthAttachment = buff;	
			this.renderBuffers.push(buff);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthAttachment);
		}

		if (this.useStencil && this.stencilAttachment != undefined) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.stencilAttachment.texture, 0);

		} else if (this.useStencil) {
			var buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.stencilFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.stencilAttachment = buff;	
			this.renderBuffers.push(buff);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilAttachment);
		}
		
		this.valid = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
		if (!this.valid) {
			throw "Could not create FBO";
		}

	} finally {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
	}
};

GG.RenderTarget.prototype.isValid = function() {
	return this.valid;
};

GG.RenderTarget.prototype.activate = function() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

	if (!this.useColor) {		
		gl.drawBuffer(gl.NONE);
    	gl.colorMask(false, false, false, false);
	} else {
		gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	if (this.useDepth) {
		gl.clearDepth(this.clearDepth);
		gl.clear(gl.DEPTH_BUFFER_BIT);
	}	

	gl.viewport(0, 0, this.width, this.height);
};

GG.RenderTarget.prototype.deactivate = function() {
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	if (!this.useColor) {
		gl.drawBuffer(gl.BACK);
    	gl.colorMask(true, true, true, true);
	}
};

GG.RenderTarget.prototype.getColorAttachment = function(i) {
	return this.colorAttachments[i];
};

GG.RenderTarget.prototype.getDeptAttachment = function() {
	return this.depthAttachment;
};

GG.RenderTarget.prototype.getStencilAttachment = function() {
	return this.stencilAttachment;
};
