import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import vertexPars from './shaders/vertex_pars.glsl'
import vertexMain from './shaders/vertex_main.glsl'
import fragmentPars from './shaders/fragment_pars.glsl'
import fragmentMain from './shaders/fragment_main.glsl'
import colorFragmentPars from './shaders/color_fragment_pars.glsl'
import colorFragmentMain from './shaders/color_fragment_main.glsl'

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()
  const shapeSettings = {
    ampl: 1,
    rad: 1.5,
    originalMin: 0.35,
    originalMax: 0.6,
    yPositionMultiplier: 6
  }

  // lighting
  const dirLight = new THREE.DirectionalLight('#fff', 0.3)
  dirLight.position.set(2, 2, 2)

  const ambientLight = new THREE.AmbientLight('#fff', 0.5)
  scene.add(dirLight, ambientLight)

  // meshes
  const geometry = new THREE.IcosahedronGeometry(1, 400)
  const material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    onBeforeCompile: (shader) => {
      // storing a reference to the shader object
      material.userData.shader = shader

      // uniforms
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uAmpl = { value: shapeSettings.ampl }
      shader.uniforms.uRad = { value: shapeSettings.rad }
      shader.uniforms.uOriginalMin = { value: shapeSettings.originalMin }
      shader.uniforms.uOriginalMax = { value: shapeSettings.originalMax }
      shader.uniforms.uYPositionMultiplier = { value: shapeSettings.yPositionMultiplier }

      const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + '\n' + vertexPars
      )

      const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + '\n' + vertexMain
      )

      const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`
      const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + '\n' + fragmentPars
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + '\n' + fragmentMain
      )

      const colorParsFragmentShader = /* glsl */ `#include <color_pars_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        colorParsFragmentShader,
        colorParsFragmentShader + '\n' + colorFragmentPars
      )
      const colorFragmentShader = /* glsl */ `#include <color_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        colorFragmentShader,
        colorFragmentShader + '\n' + colorFragmentMain
      )
    },
  })

  const ico = new THREE.Mesh(geometry, material)
  scene.add(ico)

  // GUI
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  const shapeSettingsFolder = gui.addFolder('Shape Settings')
  shapeSettingsFolder.add(shapeSettings, 'ampl', 0, 5)
  shapeSettingsFolder.add(shapeSettings, 'rad', 0, 5)
  shapeSettingsFolder.add(shapeSettings, 'originalMin', 0, 1)
  shapeSettingsFolder.add(shapeSettings, 'originalMax', 0, 1)
  shapeSettingsFolder.add(shapeSettings, 'yPositionMultiplier', 0, 30)
  cameraFolder.open()

  // addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

  let timePast = 0;
  useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 3000
    material.userData.shader.uniforms.uTime.value = time
    material.userData.shader.uniforms.uAmpl.value = shapeSettings.ampl
    material.userData.shader.uniforms.uRad.value = shapeSettings.rad
    material.userData.shader.uniforms.uOriginalMin.value = shapeSettings.originalMin
    material.userData.shader.uniforms.uOriginalMax.value = shapeSettings.originalMax
    material.userData.shader.uniforms.uYPositionMultiplier.value = shapeSettings.yPositionMultiplier
  })
}

export default startApp
