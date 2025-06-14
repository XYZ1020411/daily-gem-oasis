
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface JoystickProps {
  onMove: (direction: { x: number; y: number }) => void;
  size?: number;
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

const VirtualJoystick: React.FC<JoystickProps> = ({ 
  onMove, 
  size = 120, 
  className = '' 
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState<Position>({ x: 0, y: 0 });

  const maxDistance = size / 2 - 15; // 15 is knob radius

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    
    setIsDragging(true);
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance <= maxDistance) {
      setKnobPosition({ x: deltaX, y: deltaY });
      onMove({ 
        x: deltaX / maxDistance, 
        y: -deltaY / maxDistance // 反轉Y軸，向上為正
      });
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      const limitedX = Math.cos(angle) * maxDistance;
      const limitedY = Math.sin(angle) * maxDistance;
      
      setKnobPosition({ x: limitedX, y: limitedY });
      onMove({ 
        x: limitedX / maxDistance, 
        y: -limitedY / maxDistance 
      });
    }
  }, [maxDistance, onMove]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance <= maxDistance) {
      setKnobPosition({ x: deltaX, y: deltaY });
      onMove({ 
        x: deltaX / maxDistance, 
        y: -deltaY / maxDistance 
      });
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      const limitedX = Math.cos(angle) * maxDistance;
      const limitedY = Math.sin(angle) * maxDistance;
      
      setKnobPosition({ x: limitedX, y: limitedY });
      onMove({ 
        x: limitedX / maxDistance, 
        y: -limitedY / maxDistance 
      });
    }
  }, [isDragging, maxDistance, onMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  }, [onMove]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className={`relative select-none ${className}`}>
      <div
        ref={joystickRef}
        className="relative bg-gray-800/60 rounded-full border-2 border-gray-600/80 backdrop-blur-sm"
        style={{ 
          width: size, 
          height: size,
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Joystick base */}
        <div 
          className="absolute inset-2 rounded-full bg-gray-700/40"
        />
        
        {/* Direction indicators */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-bold">
          ↑
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-bold">
          ↓
        </div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs font-bold">
          ←
        </div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs font-bold">
          →
        </div>
        
        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute w-8 h-8 bg-white rounded-full border-2 border-gray-400 shadow-lg transition-all duration-75"
          style={{
            left: `calc(50% + ${knobPosition.x}px - 16px)`,
            top: `calc(50% + ${knobPosition.y}px - 16px)`,
            background: isDragging 
              ? 'linear-gradient(45deg, #3b82f6, #1d4ed8)' 
              : 'linear-gradient(45deg, #e5e7eb, #9ca3af)'
          }}
        />
      </div>
      
      {/* Instructions */}
      <div className="mt-2 text-center text-xs text-white/80">
        移動搖桿控制角色
      </div>
    </div>
  );
};

export default VirtualJoystick;
