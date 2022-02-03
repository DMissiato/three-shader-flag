
import { Canvas, extend, useFrame, useLoader} from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';
import * as THREE from 'three';
import React, { useRef, Suspense } from 'react';


const AnimShaderMaterial = shaderMaterial(
  // uniform
  { 
    uTime: 0, 
    //uColor: new THREE.Color(0.9, 0.0, 0.0), 
    uTexture: new THREE.Texture()
  },
  // vertex
  glsl`
    precision mediump float;

    varying vec2 vUv;

    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);


    void main()
    {
      vUv = uv;

      vec3 pos = position;
      float noiseRate = 2.0;
      float noiseAmplifier = 1.0;
      vec3 noisePos = vec3((pos.x * noiseRate) + uTime, pos.y, pos.z);
      
      pos.z += snoise3(noisePos) * noiseAmplifier;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // fragment
  glsl`
    //precision mediump float;

    //uniform vec3 uColor;
    //uniform float uTime;
    uniform sampler2D uTexture;

    varying vec2 vUv;

    void main()
    {
      vec3 texture = texture2D(uTexture, vUv).rgb;
      gl_FragColor = vec4(texture, 0.9);//vec4(uColor * sin(vUv.x + uTime), 1);
    }
  `
);

extend({AnimShaderMaterial});


const AnimatedPlane = () =>
{
  const ref = useRef();
  
  useFrame(({clock}) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, [
    'https://upload.wikimedia.org/wikipedia/commons/c/ca/Bandiera_italiana_foto.svg'
  ]);

  return (
    <>
      <mesh>
        <planeBufferGeometry args={[0.8, 0.6, 22, 16]} />
        <animShaderMaterial /*uColor={'#fff'}*/ ref={ref} uTexture={image} />
      </mesh>
    </>
  );
};

const Scene = () =>
{
  return (
    <Canvas camera={{ fov: 12 }}>
      <Suspense fallback={<></>}>
        <AnimatedPlane />
      </Suspense>
    </Canvas>
  );
};

const App = () =>
{
  return <Scene />;
};

export default App;
