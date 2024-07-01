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

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()

  // lighting
  const dirLight = new THREE.DirectionalLight('#fff', 0.3)
  dirLight.position.set(2, 2, 2)

  const ambientLight = new THREE.AmbientLight('#fff', 0.5)
  scene.add(dirLight, ambientLight)

  // meshes
  const geometry = new THREE.IcosahedronGeometry(1, 400)
  const material = new THREE.MeshStandardMaterial({
    onBeforeCompile: (shader) => {
      // storing a reference to the shader object
      material.userData.shader = shader

      // uniforms
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`
      const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )
    },
  })

  const ico = new THREE.Mesh(geometry, material)
  scene.add(ico)

  // GUI
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  cameraFolder.open()

  addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

  let timePast = 0;
  useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 3000
    material.userData.shader.uniforms.uTime.value = time
    if (time > timePast + 0.02) {
      timePast = time;
      const hue = (time % 1);

      const color = new THREE.Color();
      color.setHSL(hue, 0.8, 0.4);

      if (dirLight) {
        dirLight.color.set(color);
        ambientLight.color.set(color);
      }
    }
  })
}

export default startApp
