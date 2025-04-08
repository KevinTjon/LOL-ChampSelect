
import { useEffect, useState } from "react";
import { Team } from "../data/draftTypes";

interface DraftTimerProps {
  isActive: boolean;
  team: Team;
  onTimeUp: () => void;
  durationSeconds: number;
}

const DraftTimer = ({ isActive, team, onTimeUp, durationSeconds }: DraftTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  
  useEffect(() => {
    if (isActive) {
      setTimeLeft(durationSeconds);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isActive, durationSeconds, onTimeUp]);
  
  const teamColor = team === "BLUE" ? "text-lol-blue" : "text-lol-red";
  const percentage = (timeLeft / durationSeconds) * 100;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`text-base font-bold ${isActive ? teamColor : "text-gray-500"}`}>
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </div>
      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${team === "BLUE" ? "bg-lol-blue" : "bg-lol-red"} transition-all duration-1000`}
          style={{ width: `${isActive ? percentage : 0}%` }}
        ></div>
      </div>
    </div>
  );
};

export default DraftTimer;
