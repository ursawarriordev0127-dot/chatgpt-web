import { useState, useEffect } from 'react';

function useDocumentResize(target: HTMLElement = document.body) {
  const [rect, setRect] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const handleResize = () => {
      if (target) {
        setRect({
          width: target.offsetWidth,
          height: target.offsetHeight
        });
      }
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Get initial width
    if (target) {
      setRect({
        width: target.offsetWidth,
        height: target.offsetHeight
      });
    }

    // Remove listener when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [target]);

  return rect;
}

export default useDocumentResize;