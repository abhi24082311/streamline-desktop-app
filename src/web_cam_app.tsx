import { useEffect, useRef } from 'react'

const WebCam = () => {
  const camElement = useRef<HTMLVideoElement | null>(null)

  const streamWebCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      if (camElement.current) {
        camElement.current.srcObject = stream
        await camElement.current.play()
      }
    } catch (error) {
      console.error('Error accessing webcam:', error)
    }
  }

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent'
    document.documentElement.style.backgroundColor = 'transparent'
  }, [])

  useEffect(() => {
    streamWebCam()
  }, [])

  return (
    <video
      ref={camElement}
      autoPlay
      playsInline
      muted
      className="h-screen draggable object-cover rounded-full aspect-video border-2 relative border-white"
    ></video>
  )
}

export default WebCam
