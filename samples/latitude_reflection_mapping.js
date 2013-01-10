LatitudeReflectionMappingSample = function (spec) {
    this.renderer            = null;
    this.cubeMesh            = null;
    this.cubemapTechnique    = null;    
    this.y_rot               = 0.0;
    this.camera              = null;
    this.mouseHandler        = null;
    this.reflectiveTechnique = null;
    this.refectiveMaterial   = null;
    GG.SampleBase.call(this, spec);
};

LatitudeReflectionMappingSample.prototype = new GG.SampleBase();
LatitudeReflectionMappingSample.prototype.constructor = LatitudeReflectionMappingSample;

LatitudeReflectionMappingSample.prototype.initializeAssets = function () {
    var self = this;
    GG.Loader.loadImage('panorama', '../assets/textures/latitude_pano.png',
        function (reqId, img) {
            var texture = GG.Texture.createTexture({
                'image' : img, 
                minFilter : gl.LINEAR, magFilter : gl.LINEAR, useMipmaps : false,
                flipY : false
            });
            self.reflectiveTechnique = new GG.LatitudeReflectionMappingTechnique();
            self.refectiveMaterial = new GG.BaseMaterial()
            self.refectiveMaterial.addDiffuseTexture(texture);

            self.environmentPass = new GG.TexturedShadelessTechnique({'texture':texture})
            self.assetsLoaded = true;
        }
    );
};

LatitudeReflectionMappingSample.prototype.initializeWithAssetsLoaded = function () {
    this.camera = new GG.PerspectiveCamera();
    this.camera.setPosition([0.0, 0.0, 10]);
    this.camera.near = 1.0;
    this.camera.far = 2000;
    this.camera.fov = 70;

    this.renderer = new GG.Renderer();
    this.renderer.setCamera(this.camera);
    GG.renderer = this.renderer;

    this.mouseHandler = new GG.MouseHandler();
    this.mouseHandler.setCamera(this.camera);

    this.cubeMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 64, 64));//new GG.CubeGeometry());
    this.skyMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 64, 64));

    this.cubeMesh.setMaterial(this.refectiveMaterial);
    this.skyMesh.setMaterial(this.refectiveMaterial);


    this.initialized = true;
};

LatitudeReflectionMappingSample.prototype.update = function () {
    GG.SampleBase.prototype.update.call(this);
    if (this.initialized) {
        //this.y_rot += GG.clock.deltaTime() * 0.001;
    }
};

LatitudeReflectionMappingSample.prototype.draw = function () {
    var ctx = new GG.RenderContext();
    ctx.camera = this.camera;

    this.cubeMesh.setPosition([0.0, 1.0, -4.0]);
    this.cubeMesh.setScale([2, 2, 2]);
    this.cubeMesh.setRotation([this.y_rot * 0.5, this.y_rot, 0.0]);

    this.skyMesh.setScale([700, 700, 700]);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.reflectiveTechnique.render(this.cubeMesh, ctx);
    this.environmentPass.render(this.skyMesh, ctx);
};


