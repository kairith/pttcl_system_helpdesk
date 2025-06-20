'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
  const blades = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const delay = (i * 0.083).toFixed(3);
    return (
      <div
        key={i}
        className="spinner-blade"
        style={{
          transform: `rotate(${angle}deg)`,
          animationDelay: `${delay}s`,
        }}
      ></div>
    );
  });

  return (
    <>
      <div className="relative w-[1em] h-[1em] text-[28px] mx-auto top-0 bottom-0 left-0 right-0 absolute">
        {blades}
      </div>

      <style jsx>{`
        @keyframes spinner-fade {
          0% {
            background-color: #69717d;
          }
          100% {
            background-color: transparent;
          }
        }
        .spinner-blade {
          position: absolute;
          left: 46.29%;
          bottom: 0;
          width: 7.4%;
          height: 27.77%;
          border-radius: 5.55%;
          background-color: transparent;
          transform-origin: center -22.22%;
          animation: spinner-fade 1s infinite linear;
        }
      `}</style>
    </>
  );
};

export default LoadingSpinner;
