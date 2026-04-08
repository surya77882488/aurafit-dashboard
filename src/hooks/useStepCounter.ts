import { useState, useEffect, useCallback, useRef } from 'react';

export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const lastAccel = useRef<number>(0);
  const stepThreshold = 12;

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result === 'granted') {
          setPermissionGranted(true);
          setSensorAvailable(true);
        }
      } catch {
        setSensorAvailable(false);
      }
    } else if ('DeviceMotionEvent' in window) {
      setPermissionGranted(true);
      setSensorAvailable(true);
    } else {
      setSensorAvailable(false);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const magnitude = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      if (Math.abs(magnitude - lastAccel.current) > stepThreshold) {
        setSteps(prev => prev + 1);
      }
      lastAccel.current = magnitude;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [permissionGranted]);

  const addManualSteps = useCallback((count: number) => {
    setSteps(prev => prev + count);
  }, []);

  const setManualSteps = useCallback((count: number) => {
    setSteps(count);
  }, []);

  return { steps, sensorAvailable, permissionGranted, requestPermission, addManualSteps, setManualSteps };
}
