import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Stars(props) {
  const ref = useRef()

  // Generate random star positions
  const [positions] = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return [positions]
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#3b82f6"
          size={0.02}
          sizeAttenuation={true}
          transparent
          opacity={0.6}
        />
      </points>
    </group>
  )
}

function FloatingGeometry() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      meshRef.current.rotation.x = time * 0.2
      meshRef.current.rotation.y = time * 0.1
      meshRef.current.position.y = Math.sin(time * 0.5) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={[2, 0, -5]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#6366f1"
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  )
}

function AnimatedSphere() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      meshRef.current.rotation.x = time * 0.3
      meshRef.current.rotation.z = time * 0.2
      meshRef.current.position.x = Math.sin(time * 0.3) * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[-2, 1, -3]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="#8b5cf6"
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  )
}

const ThreeBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.3} />
        <Stars />
        <FloatingGeometry />
        <AnimatedSphere />
      </Canvas>
    </div>
  )
}

export default ThreeBackground
