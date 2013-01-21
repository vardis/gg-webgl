GG.VertexColorsTechnique = function(spec) {
    spec        = spec || {};
    spec.passes = [ new GG.VertexColorsPass() ];
    GG.BaseTechnique.call(this, spec);
};

GG.VertexColorsTechnique.prototype = new GG.BaseTechnique();
GG.VertexColorsTechnique.prototype.constructor = GG.VertexColorsTechnique;

GG.VertexColorsPass = function(spec) {
    spec = spec || {};
    GG.RenderPass.call(this, spec);
};

GG.VertexColorsPass.prototype = new GG.RenderPass();
GG.VertexColorsPass.prototype.constructor = GG.VertexColorsPass;

GG.VertexColorsPass.prototype.__createShaders = function() {
    var vs = new GG.ProgramSource();
    vs.position()
        .color()
        .uniformModelViewMatrix()
        .uniformProjectionMatrix()
        .varying('vec3', GG.Naming.VaryingColor)
        .addMainBlock([
        "	gl_Position = u_matProjection*u_matModelView*a_position;",
        GG.Naming.VaryingColor + " = " + GG.Naming.AttributeColor + ";"
    ].join('\n'));

    var fs = new GG.ProgramSource();
    fs.asFragmentShader()
        .varying('vec3', GG.Naming.VaryingColor)
        .writeOutput("gl_FragColor = vec4(" + GG.Naming.VaryingColor + ", 1.0);");

    this.vertexShader = vs.toString();
    this.fragmentShader = fs.toString();
};