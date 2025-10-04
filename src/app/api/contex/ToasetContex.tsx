"use client";

import { Toaster } from "react-hot-toast";

const ToasterContext = () => {
  return (
    <div className="z-[99999]">
      <Toaster
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            // match app look or keep default
          },
        }}
      />
    </div>
  );
};

export default ToasterContext;
