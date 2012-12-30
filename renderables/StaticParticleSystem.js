/**
 * Create a static particle system, i.e. the particles remain stationery
 * at their original positions.
 * To determine the initial placement of the particles, a geometry object
 * must be given as input. Whereby each vertex will specify the position and/or
 * color of each particle.
 * Note: The input geometry is expected to be flatten.
 */
GG.StaticParticleSystem = function (geometry, material, spec) {
    spec = spec || {};    
    GG.PointMesh.call(this, geometry, material, spec);
};

GG.StaticParticleSystem.prototype = new GG.PointMesh();
GG.StaticParticleSystem.prototype.constructor = GG.StaticParticleSystem;

