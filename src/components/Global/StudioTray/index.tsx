import { StartRecording, onStopRecording, selectSources } from '@/lib/recorder'
import { cn, resizeWindow, videoRecordingTime } from '@/lib/utils'
import { Cast, Pause, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const StudioTray = () => {
    let initialTime = new Date();
    const [preview, setPreview] = useState(true)
    const [onTimer, setOnTimer] = useState<string>('00:00:00')
    const [count, setCount] = useState(0);
    const [recording, setRecording] = useState(false)
    const [onSources, setOnSources] = useState<{
        screen: string
        id: string
        audio: string
        preset: 'HD' | 'SD'
        plan: 'PRO' | 'FREE'
    } | undefined>(undefined)

    const clearTime = () => {
        setOnTimer('00:00:00')
        setCount(0)
    }

    useEffect(() => {
        window.ipcRenderer.on('profile-recieved', (event, payload) => {
            console.log(event)
            setOnSources(payload)
        })
    }, [])
    const videoElement = useRef<HTMLVideoElement | null>(null)


    useEffect(() => {
        if (onSources && onSources.screen) selectSources(onSources, videoElement)
        return () => {
            selectSources(onSources!, videoElement)
        }
    }, [onSources])

    useEffect(() => {
        if (!recording) return
        const recordTimeInterval = setInterval(() => {
            const time = count + (new Date().getTime() - initialTime.getTime())
            setCount(time)
            const recordingTime = videoRecordingTime(time)
            if (onSources?.plan === 'FREE' && recordingTime.minute === '05') {
                setRecording(false)
                clearTime()
                onStopRecording()
            }
            setOnTimer(recordingTime.length)
            if (time <= 0) {
                setOnTimer('00:00:00')
                clearInterval(recordTimeInterval)
            }
        }, 1)
        return () => clearInterval(recordTimeInterval)
    }, [recording])

    useEffect(() => {
        window.ipcRenderer.send('resize-studio', { shrink: !preview })
    }, [preview])

    return (
        <div className="flex flex-col justify-end gap-y-5 h-screen ">
            {preview && onSources && (
                <video
                    autoPlay
                    ref={videoElement}
                    className={cn('w-6/12 self-end')}
                ></video>
            )}
            <div className="rounded-full flex justify-around items-center h-12 w-full border border-neutral-700 bg-[#171717] draggable px-4">
                <div {...(onSources && {
                    onClick: () => {
                        setRecording(!recording)
                        if (recording) {
                            clearTime()
                            onStopRecording()
                        } else {
                            StartRecording(onSources)
                        }
                    },
                })}
                    className={cn(
                        'non-draggable rounded-full flex items-center justify-center cursor-pointer relative hover:opacity-80',
                        recording ? 'bg-red-500 w-4 h-4' : 'bg-red-400 w-6 h-6',
                        !onSources && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {recording && (
                        <Square
                            size={8}
                            fill="white"
                            className="text-white"
                            stroke="white"
                        />
                    )}
                </div>

                <span className="text-white text-xs font-mono non-draggable">{onTimer}</span>

                {!recording ? (
                    <Pause
                        className="non-draggable opacity-50"
                        size={20}
                        fill="white"
                        stroke="none"
                    />
                ) : (
                    <Pause
                        className="non-draggable cursor-pointer hover:opacity-80"
                        size={20}
                        fill="white"
                        stroke="none"
                    />
                )}

                <Cast
                    onClick={() => setPreview((prev) => !prev)}
                    size={20}
                    fill="white"
                    className="non-draggable cursor-pointer hover:opacity-60"
                    stroke="white"
                />
            </div>
        </div>
    )
}

export default StudioTray
