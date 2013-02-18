GG.PingPongBuffer = function (spec) {
	spec = spec || {};

	if (!spec.colorAttachments) {
		var textures = [ GG.Texture.createTexture(spec), GG.Texture.createTexture(spec) ];	
		spec.colorAttachments = textures;
	}		
	this.textureUnit = spec.textureUnit != undefined ? spec.textureUnit : GG.TEX_UNIT_DIFFUSE_MAP_0;
	this.spec        = GG.cloneDictionary(spec);		
};

GG.PingPongBuffer.prototype.constructor = GG.PingPongBuffer;

GG.PingPongBuffer.prototype.destroy = function() {
	this.fbos[this.writeFBO].destroy();	
	this.fbos[this.readFBO].destroy();	
};

GG.PingPongBuffer.prototype.initialize = function() {
	this.fbos = [];
	rtSpec = GG.cloneDictionary(this.spec);	
	for (var i = 0; i < 2; i++) {
		if (this.spec.colorAttachments[i]) {
			rtSpec.colorAttachments = [this.spec.colorAttachments[i]];
		} else {
			rtSpec.colorAttachments = null;
		}
		var rt = new GG.RenderTarget(rtSpec);
		rt.initialize();
		this.fbos.push(rt);
	}
	this.readFBO = 0;
	this.writeFBO = 1;
};

GG.PingPongBuffer.prototype.activate = function() {
	this.fbos[this.readFBO].getColorAttachment(0).bindAtUnit(this.textureUnit);
	this.fbos[this.writeFBO].activate();	
};

GG.PingPongBuffer.prototype.activateOnlyTarget = function() {
	this.fbos[this.writeFBO].activate();	
};

GG.PingPongBuffer.prototype.deactivate = function() {
	this.fbos[this.writeFBO].deactivate();	
};

/** Swaps the input & output textures */
GG.PingPongBuffer.prototype.swap = function() {
	this.readFBO = (this.readFBO + 1) % 2;
	this.writeFBO = (this.writeFBO + 1) % 2;
};

GG.PingPongBuffer.prototype.sourceTexture = function() {
	return this.fbos[this.readFBO].getColorAttachment(0);	
};

GG.PingPongBuffer.prototype.targetTexture = function() {
	return this.fbos[this.writeFBO].getColorAttachment(0);	
};