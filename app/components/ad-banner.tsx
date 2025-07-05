import type React from 'react';
import { Button } from './ui/button'; // Assuming Button component is available

interface AdBannerProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  title,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-2xl relative overflow-hidden">
      {/* Background effect */}
      <div
        className="absolute inset-0 opacity-10 -z-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      ></div>

      <div className="flex-shrink-0 text-3xl">✨</div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold flex items-center whitespace-nowrap">
          {title} <span className="ml-2 text-xl">🚀</span>
        </h3>
        <p className="text-sm opacity-90 mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <Button
          onClick={onClick}
          className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-300 transform hover:scale-105"
        >
          {buttonText} 🔗
        </Button>
      </div>
    </div>
  );
};
