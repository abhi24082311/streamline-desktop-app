import { cn, onCloseApp } from '@/lib/utils'
import { UserButton } from '@clerk/clerk-react'
import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import opalLogo from '@/assets/opal-logo.svg'

type Props = {
  children: React.ReactNode
  className?: string
}

const ControlLayout = ({ children, className }: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const handler = (_event: any, payload: { state: boolean }) => {
      console.log('hide-plugin received:', payload)
      setIsVisible(payload.state)
    }
    window.ipcRenderer.on('hide-plugin', handler)
    return () => {
      window.ipcRenderer.off('hide-plugin', handler)
    }
  }, [])

  return (
    <div
      className={cn(
        className,
        isVisible && 'invisible',
        'bg-neutral-900 border-2 border-neutral-700 flex px-1 flex-col rounded-3xl overflow-hidden h-screen w-full'
      )}
    >
      <div className="flex justify-between items-center p-5 draggable">
        <span className="non-draggable">
          <UserButton />
        </span>
        <X
          size={20}
          className="text-gray-400 non-draggable hover:text-white cursor-pointer"
          onClick={onCloseApp}
        />
      </div>
      <div className="flex-1 h-0 overflow-auto">
        {children}
      </div>
      <div className="p-5 flex w-full">
          <div className="flex items-center gap-x-2">
            <img src={opalLogo} alt="app logo" className="h-10 w-10 object-contain" />
            <p className="text-white text-lg font-semibold">Streamline</p>
          </div>
        </div>
    </div>
  )
}

export default ControlLayout
