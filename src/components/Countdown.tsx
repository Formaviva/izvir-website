import { useEffect, useState } from 'react';

const Countdown = () => {
  const [countdown, setCountdown] = useState('');
  const countdownDate = new Date('August 12, 2023 00:00:00').getTime();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countdownDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        setCountdown('Event has ended');
      } else {
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="countdown" className="text-2xl">
      {countdown}
    </div>
  );
};

export default Countdown;
