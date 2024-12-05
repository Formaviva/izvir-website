import { useEffect, useState } from 'react';

const StrobeEffect = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  // Initialize from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('strobeEnabled');
    if (saved !== null) {
      setIsEnabled(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('strobeEnabled', JSON.stringify(isEnabled));
    const god = document.getElementById("god");
    if (god && !isEnabled) {
      god.classList.remove("strobe");
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    const getRandomNumber = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const performFlashes = () => {
      const god = document.getElementById("god");
      if (god && isEnabled) {
        god.classList.remove("strobe");
        void god.offsetWidth;
        god.classList.add("strobe");
      }
    };

    const startStrobe = () => {
      if (!isEnabled) return;
      
      setTimeout(() => {
        if (!isEnabled) return;
        const flashes = getRandomNumber(3, 5);
        for (let i = 0; i < flashes; i++) {
          setTimeout(() => {
            if (isEnabled) performFlashes();
          }, i * 200);
        }
        startStrobe();
      }, getRandomNumber(8000, 15000));
    };

    startStrobe();

    return () => {
      const god = document.getElementById("god");
      if (god) {
        god.classList.remove("strobe");
      }
    };
  }, [isEnabled]);

  return (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
      className="fixed top-4 right-20 z-50 px-3 py-1 text-sm bg-black border border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
      title={isEnabled ? "Disable strobe effect" : "Enable strobe effect"}
    >
      {isEnabled ? "Strobe: On" : "Strobe: Off"}
    </button>
  );
};

export default StrobeEffect;
