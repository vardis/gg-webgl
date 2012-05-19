import sys

GG_files = [
	'GG_init.js',
	'Clock.js',
	'utils/AjaxUtils.js',
	'utils/Loader.js',
	'ShaderLib.js',
	'utils/MathUtils.js',
	'samples/screen_pass.js',
	'utils/ProgramUtils.js',
	'Light.js',
	'geometries/Geometry.js',
	'geometries/PlaneGeometry.js',
	'geometries/SphereGeometry.js',
	'geometries/CubeGeometry.js',
	'geometries/ScreenAlignedQuad.js',
	'renderables/Object3D.js',
	'textures/TextureCubemap.js',
	'renderables/TriangleMesh.js',	
	'renderables/StaticParticleSystem.js',
	'cameras/PerspectiveCamera.js',
	'render/RenderTarget.js',
	'GLSLProgram.js',
	'BaseMaterial.js',
	'techniques/BaseTechnique.js',
	'techniques/ConstantLightingTechnique.js',
	'techniques/TexturedShadelessTechnique.js',
	'techniques/CubemapTechnique.js',
	'techniques/ReflectiveTechnique.js',
	'techniques/PhongShadingTechnique.js',
	'techniques/particles/ParticlesTechnique.js',
	'render/Renderer.js',
	'techniques/RenderPass.js',
	'techniques/ScreenPass.js',
	'techniques/RenderPasses/BlitPass.js',
	'interaction/MouseHandler.js',
	'Scene.js'
]

def merge(files):

	buffer = []

	for filename in files:
		with open(filename, 'r') as f:
			print 'Processing...', filename
			buffer.append('\n')
			buffer.append(f.read())

	return "".join(buffer)

def main():
	buffer = merge(GG_files)
	with open('GG_all.js', 'w') as wf:
		wf.write(buffer);

if __name__ == "__main__":
	main()