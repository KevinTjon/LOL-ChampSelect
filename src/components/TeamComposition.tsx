
import { DraftSlot, Team } from "../data/draftTypes";
import { positions } from "../data/draftTypes";

interface TeamCompositionProps {
  slots: DraftSlot[];
  team: Team;
  isPickPhase: boolean;
}

const TeamComposition = ({ slots, team, isPickPhase }: TeamCompositionProps) => {
  const teamClass = team === "BLUE" ? "bg-lol-darkBlue" : "bg-lol-darkRed";
  const teamBorderClass = team === "BLUE" ? "border-lol-blue" : "border-lol-red";
  const teamTextClass = team === "BLUE" ? "text-lol-lightBlue" : "text-lol-red";
  
  const pickSlots = slots.filter(slot => !slot.isBan);
  
  return (
    <div className={`${teamClass} p-3 rounded-md w-full`}>
      <h3 className={`text-center font-semibold mb-3 ${teamTextClass} uppercase tracking-widest`}>
        {team === "BLUE" ? "Blue Team" : "Red Team"}
      </h3>
      
      <div className="flex flex-col gap-2">
        {positions.map((position, index) => {
          const slot = pickSlots[index] || { 
            team, 
            champion: null, 
            isActive: false,
            isBan: false,
            position
          };
          
          return (
            <div key={position} className="flex items-center gap-2">
              <div className="w-20 text-xs opacity-70 uppercase tracking-wider">
                {position}
              </div>
              <div 
                className={`
                  flex-1 h-16 rounded overflow-hidden relative
                  ${slot.isActive && isPickPhase ? 'phase-active' : ''}
                  ${!slot.champion ? 'bg-black bg-opacity-30' : ''}
                  ${slot.champion && team === "BLUE" ? 'team-blue-glow' : ''}
                  ${slot.champion && team === "RED" ? 'team-red-glow' : ''}
                  border ${teamBorderClass} border-opacity-50
                `}
              >
                {slot.champion ? (
                  <div className="flex h-full">
                    <img 
                      src={slot.champion.image} 
                      alt={slot.champion.name}
                      className="h-full aspect-square object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-center px-2">
                      <h4 className="font-medium text-sm">{slot.champion.name}</h4>
                      <p className="text-xs opacity-70">{slot.champion.title}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm opacity-50">
                    {slot.isActive && isPickPhase ? "Selecting..." : "No Champion Selected"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamComposition;
