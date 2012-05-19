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
	spec = spec || {};
	this.width = spec.width || 320;
	this.height = spec.height || 200;
	this.colorFormat = spec.colorFormat || gl.RGBA;
	this.depthFormat = spec.depthFormat || gl.DEPTH_COMPONENT16;
	this.stencilFormat = spec.stencilFormat || gl.STENCIL_INDEX8;
	this.useColor = spec.useColor || true;
	this.useDepth = spec.useDepth || true;
	this.useStencil = spec.useStencil || false;

	this.fbo = gl.createFramebuffer();
	try {
	    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
	    
		this.colorAttachments = [];
		if (this.useColor && spec.colorAttachment0 != undefined) {
			this.colorAttachments.push(spec.colorAttachment0);
		} else if (this.useColor) {
			tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, spec.flipY || true);

			// maps a format to the triple [internalFormat, format, type] as accepted by gl.TexImage2D
			formatDetails = {};
			formatDetails[gl.RGB] = [gl.RGB, gl.RGB, gl.UNSIGNED_BYTE];
			formatDetails[gl.RGBA] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE];
			formatDetails[gl.RGBA4] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4];
			formatDetails[gl.RGB5_A1] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1];
			formatDetails[gl.RGB565] = [gl.RGB, gl.RGB, gl.UNSIGNED_SHORT_5_6_5];
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, spec.magFilter || gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, spec.minFilter || gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, spec.wrapS || gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, spec.wrapT || gl.CLAMP_TO_EDGE);

			gl.texImage2D(gl.TEXTURE_2D, 0, formatDetails[this.colorFormat][0], this.width, this.height, 0, formatDetails[this.colorFormat][1], formatDetails[this.colorFormat][2], null);
			gl.bindTexture(gl.TEXTURE_2D, null);

			this.colorAttachments.push(tex);
		}

		if (this.colorAttachments.length > 0) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorAttachments[0], 0);
		}

		this.depthAttachment = null;
		if (this.useDepth && spec.depthAttachment != undefined) {
			this.depthAttachment = spec.depthAttachment;
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthAttachment, 0);

		} else if (this.useDepth) {
			buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.depthFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.depthAttachment = buff;	
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthAttachment);
		}

		this.stencilAttachment = null;
		if (this.useStencil && spec.stencilAttachment != undefined) {
			this.stencilAttachment = spec.stencilAttachment;
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.stencilAttachment, 0);

		} else if (this.useStencil) {
			buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.stencilFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.stencilAttachment = buff;	
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilAttachment);
		}
		
		this.valid = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
	} finally {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
	}
};

GG.RenderTarget.prototype.constructor = GG.RenderTarget;

GG.RenderTarget.prototype.isValid = function() {
	return this.valid;
};

GG.RenderTarget.prototype.activate = function() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

	if (!this.useColor) {		
		gl.drawBuffer(gl.NONE);
    	gl.colorMask(false, false, false, false);
	} else {
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	if (this.useDepth) {
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
