
import { DraftSlot, Team } from "../data/draftTypes";

interface BanPhaseProps {
  blueTeamBans: DraftSlot[];
  redTeamBans: DraftSlot[];
  isPickPhase: boolean;
  currentPhase: number;
}

const BanPhase = ({ blueTeamBans, redTeamBans, isPickPhase, currentPhase }: BanPhaseProps) => {
  return (
    <div className="flex justify-between gap-4 mb-6">
      <div className="flex-1">
        <h3 className="text-center text-lol-lightBlue text-sm font-medium mb-2">
          Blue Team Bans
        </h3>
        <div className="flex justify-center gap-2">
          {blueTeamBans.map((slot, index) => (
            <div 
              key={index}
              className={`
                w-12 h-12 border border-lol-blue border-opacity-50 rounded overflow-hidden
                ${slot.isActive && !isPickPhase ? 'phase-active' : ''}
                ${!slot.champion ? 'bg-black bg-opacity-50' : 'relative'}
              `}
            >
              {slot.champion ? (
                <>
                  <img 
                    src={slot.champion.image} 
                    alt={slot.champion.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-lol-red transform rotate-45"></div>
                    <div className="w-full h-0.5 bg-lol-red transform -rotate-45"></div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  {slot.isActive && !isPickPhase ? "?" : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-center text-lol-red text-sm font-medium mb-2">
          Red Team Bans
        </h3>
        <div className="flex justify-center gap-2">
          {redTeamBans.map((slot, index) => (
            <div 
              key={index}
              className={`
                w-12 h-12 border border-lol-red border-opacity-50 rounded overflow-hidden
                ${slot.isActive && !isPickPhase ? 'phase-active' : ''}
                ${!slot.champion ? 'bg-black bg-opacity-50' : 'relative'}
              `}
            >
              {slot.champion ? (
                <>
                  <img 
                    src={slot.champion.image} 
                    alt={slot.champion.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-lol-red transform rotate-45"></div>
                    <div className="w-full h-0.5 bg-lol-red transform -rotate-45"></div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  {slot.isActive && !isPickPhase ? "?" : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BanPhase;
