import sys

GG_files = [
	'GG_init.js',
	'Constants.js',
	'Naming.js',
	'materials/Color.js',
	'input/MouseInput.js',
	'input/KeyboardInput.js',
	'splines/Bezier.js',
	'splines/CatmullRom.js',
	'animation/Clock.js',
	'utils/AjaxUtils.js',
	'utils/Loader.js',
	'glsl/ShaderLib.js',
	'utils/MathUtils.js',	
	'utils/ProgramUtils.js',	
	'geometries/Geometry.js',
	'geometries/PlaneGeometry.js',
	'geometries/SphereGeometry.js',
	'geometries/CubeGeometry.js',
	'geometries/ScreenAlignedQuad.js',
	'geometries/Quad.js',
	'buffers/AttributeDataBuffer.js',
	'renderables/Object3D.js',
	'renderables/PointMesh.js',
	'renderables/LineMesh.js',
	'renderables/TriangleMesh.js',	
	'renderables/StaticParticleSystem.js',	
	'renderables/Billboard.js',
	'textures/TextureCubemap.js',
	'textures/Texture.js',	
	'cameras/Viewport.js',
	'cameras/BaseCamera.js',
	'cameras/PerspectiveCamera.js',
	'cameras/OrthographicCamera.js',
	'lights/Light.js',
	'render/RenderState.js',
	'render/RenderTarget.js',
	'render/RenderContext.js',
	'render/PingPongBuffer.js',
	'render/PostProcessChain.js',
	'render/screen_filters/ScreenFilter.js',
	'render/screen_filters/GaussianBlurScreenFilter.js',
	'render/screen_filters/GammaScreenFilter.js',
	'render/screen_filters/VignetteScreenFilter.js',
	'render/screen_filters/TVLinesScreenFilter.js',
	'render/screen_filters/FxaaScreenFilter.js',
	'glsl/GLSLProgram.js',
	'glsl/ProgramSource.js',
	'materials/TextureStack.js',
	'materials/BaseMaterial.js',
	'materials/PhongMaterial.js',	
	'techniques/RenderPasses/RenderPass.js',
	'techniques/RenderPasses/ScreenPass.js',
	'techniques/RenderPasses/BlitPass.js',	
	'techniques/RenderPasses/GaussianBlurPass.js',	
	'techniques/RenderPasses/AdaptiveRenderPass.js',
	'techniques/RenderPasses/EmbeddableAdaptiveRenderPass.js',
	'techniques/RenderPasses/FogEmbeddableRenderPass.js',
	'techniques/RenderPasses/DiffuseTextureStackEmbeddableRenderPass.js',
	'techniques/RenderPasses/SpecularMappingEmbeddableTechnique.js',
	'techniques/RenderPasses/AlphaMappingEmbeddableRenderPass.js',
	'techniques/RenderPasses/NormalMappingEmbeddableRenderPass.js',	
	'techniques/BaseTechnique.js',
	'techniques/AmbientLightingTechnique.js',
	'techniques/NormalsVisualizationTechnique.js',
	'techniques/ConstantColorTechnique.js',
	'techniques/VertexColorsTechnique.js',
	'techniques/TexturedShadelessTechnique.js',
	'techniques/CubemapTechnique.js',
	'techniques/ReflectiveTechnique.js',
	'techniques/LatitudeReflectionMappingTechnique.js',
	'techniques/PhongShadingTechnique.js',
	'techniques/WireframeTechnique.js',
	'techniques/DepthPrePassTechnique.js',
	'techniques/BillboardingTechnique.js',
	'techniques/particles/StaticPointParticlesTechnique.js',
	'techniques/shadow_mapping/ShadowMapDepthPass.js',
	'techniques/shadow_mapping/DepthMapDebugOutput.js',
	'techniques/shadow_mapping/ShadowMapSimple.js',
	'techniques/shadow_mapping/ShadowMapPCF.js',
	'techniques/shadow_mapping/VSMGaussianBlurPass.js',
	'techniques/shadow_mapping/ShadowMapVSM.js',
	'techniques/shadow_mapping/ShadowMapTechnique.js',
	'render/Renderer.js',	
	'interaction/MouseHandler.js',
	'interaction/SphericalCameraController.js',
	'interaction/FpsCamera.js',
	'scene/Scene.js',
	'scene/DefaultSceneRenderer.js'
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