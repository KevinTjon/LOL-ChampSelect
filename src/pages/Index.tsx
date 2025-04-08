
import { useState, useEffect } from "react";
import { champions, Champion } from "../data/champions";
import { draftSequence, DraftPhase, DraftSlot, Team } from "../data/draftTypes";
import ChampionGrid from "../components/ChampionGrid";
import TeamComposition from "../components/TeamComposition";
import BanPhase from "../components/BanPhase";
import DraftTimer from "../components/DraftTimer";
import PhaseIndicator from "../components/PhaseIndicator";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phases, setPhases] = useState<DraftPhase[]>(draftSequence);
  const [blueTeamPicks, setBlueTeamPicks] = useState<DraftSlot[]>([
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "TOP" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "JUNGLE" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "MID" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "BOT" },
    { team: "BLUE", champion: null, isActive: false, isBan: false, position: "SUPPORT" }
  ]);
  const [redTeamPicks, setRedTeamPicks] = useState<DraftSlot[]>([
    { team: "RED", champion: null, isActive: false, isBan: false, position: "TOP" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "JUNGLE" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "MID" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "BOT" },
    { team: "RED", champion: null, isActive: false, isBan: false, position: "SUPPORT" }
  ]);
  const [blueTeamBans, setBlueTeamBans] = useState<DraftSlot[]>([
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true },
    { team: "BLUE", champion: null, isActive: false, isBan: true }
  ]);
  const [redTeamBans, setRedTeamBans] = useState<DraftSlot[]>([
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true },
    { team: "RED", champion: null, isActive: false, isBan: true }
  ]);
  
  const isPickPhase = phases[currentPhase - 1]?.type === "PICK";
  const currentTeam = phases[currentPhase - 1]?.team || "BLUE";
  
  useEffect(() => {
    updateActiveSlots();
  }, []);
  
  useEffect(() => {
    updateActiveSlots();
  }, [currentPhase]);
  
  const updateActiveSlots = () => {
    const currentPhaseObj = phases[currentPhase - 1];
    if (!currentPhaseObj) return;
    
    const { team, type } = currentPhaseObj;
    
    setBlueTeamPicks(prev => prev.map(slot => ({ ...slot, isActive: false })));
    setRedTeamPicks(prev => prev.map(slot => ({ ...slot, isActive: false })));
    setBlueTeamBans(prev => prev.map(slot => ({ ...slot, isActive: false })));
    setRedTeamBans(prev => prev.map(slot => ({ ...slot, isActive: false })));
    
    if (type === "PICK") {
      const teamPicks = team === "BLUE" ? blueTeamPicks : redTeamPicks;
      const setTeamPicks = team === "BLUE" ? setBlueTeamPicks : setRedTeamPicks;
      
      const emptySlotIndex = teamPicks.findIndex(slot => slot.champion === null);
      if (emptySlotIndex !== -1) {
        setTeamPicks(prev => 
          prev.map((slot, idx) => ({
            ...slot,
            isActive: idx === emptySlotIndex
          }))
        );
      }
    } else if (type === "BAN") {
      const teamBans = team === "BLUE" ? blueTeamBans : redTeamBans;
      const setTeamBans = team === "BLUE" ? setBlueTeamBans : setRedTeamBans;
      
      const emptySlotIndex = teamBans.findIndex(slot => slot.champion === null);
      if (emptySlotIndex !== -1) {
        setTeamBans(prev => 
          prev.map((slot, idx) => ({
            ...slot,
            isActive: idx === emptySlotIndex
          }))
        );
      }
    }
  };
  
  const handleChampionSelect = (champion: Champion) => {
    const currentPhaseObj = phases[currentPhase - 1];
    if (!currentPhaseObj) return;
    
    const { team, type } = currentPhaseObj;
    
    if (type === "PICK") {
      const teamPicks = team === "BLUE" ? blueTeamPicks : redTeamPicks;
      const setTeamPicks = team === "BLUE" ? setBlueTeamPicks : setRedTeamPicks;
      
      const activeSlotIndex = teamPicks.findIndex(slot => slot.isActive);
      if (activeSlotIndex !== -1) {
        setTeamPicks(prev => 
          prev.map((slot, idx) => 
            idx === activeSlotIndex ? { ...slot, champion, isActive: false } : slot
          )
        );
        
        setPhases(prev => 
          prev.map((phase, idx) => 
            idx === currentPhase - 1 ? { ...phase, completed: true } : phase
          )
        );
        
        if (currentPhase < phases.length) {
          setCurrentPhase(currentPhase + 1);
        } else {
          toast({
            title: "Draft Complete",
            description: "The champion draft has been completed!",
          });
        }
      }
    } else if (type === "BAN") {
      const teamBans = team === "BLUE" ? blueTeamBans : redTeamBans;
      const setTeamBans = team === "BLUE" ? setBlueTeamBans : setRedTeamBans;
      
      const activeSlotIndex = teamBans.findIndex(slot => slot.isActive);
      if (activeSlotIndex !== -1) {
        setTeamBans(prev => 
          prev.map((slot, idx) => 
            idx === activeSlotIndex ? { ...slot, champion, isActive: false } : slot
          )
        );
        
        setPhases(prev => 
          prev.map((phase, idx) => 
            idx === currentPhase - 1 ? { ...phase, completed: true } : phase
          )
        );
        
        if (currentPhase < phases.length) {
          setCurrentPhase(currentPhase + 1);
        } else {
          toast({
            title: "Draft Complete",
            description: "The champion draft has been completed!",
          });
        }
      }
    }
  };
  
  const handleTimeUp = () => {
    const availableChampions = champions.filter(champ => 
      ![...blueTeamPicks, ...redTeamPicks, ...blueTeamBans, ...redTeamBans]
        .some(slot => slot.champion?.id === champ.id)
    );
    
    if (availableChampions.length > 0) {
      const randomChampion = availableChampions[Math.floor(Math.random() * availableChampions.length)];
      handleChampionSelect(randomChampion);
      
      toast({
        title: "Time's up!",
        description: `Randomly selected ${randomChampion.name} for ${currentTeam} team.`,
        variant: "destructive"
      });
    }
  };
  
  const getSelectedChampions = (): Champion[] => {
    return [
      ...blueTeamPicks.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion),
      ...redTeamPicks.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion)
    ];
  };
  
  const getBannedChampions = (): Champion[] => {
    return [
      ...blueTeamBans.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion),
      ...redTeamBans.filter(slot => slot.champion !== null).map(slot => slot.champion as Champion)
    ];
  };

  return (
    <div className="min-h-screen h-screen flex flex-col py-2 px-4">
      <div className="container mx-auto h-full flex flex-col">
        <h1 className="text-2xl font-bold text-center text-lol-gold mb-3">
          League of Legends Champion Draft
        </h1>
        
        {/* PhaseIndicator component removed from here */}
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/5 pr-1 flex flex-col">
            <div className="mb-2">
              <h3 className="text-center text-lol-lightBlue text-xs font-medium mb-1">
                Blue Team Bans
              </h3>
              <div className="flex flex-wrap justify-center gap-1">
                {blueTeamBans.map((slot, index) => (
                  <div 
                    key={index}
                    className={`
                      w-10 h-10 border border-lol-blue border-opacity-50 rounded overflow-hidden
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
              <TeamComposition 
                slots={blueTeamPicks} 
                team="BLUE" 
                isPickPhase={isPickPhase}
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="p-1 bg-black bg-opacity-70 rounded-md mb-1 text-center flex items-center justify-between">
              <div className="flex-1"></div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">
                  <span className={currentTeam === "BLUE" ? "text-lol-blue" : "text-lol-red"}>
                    {currentTeam} TEAM
                  </span>
                  <span className="mx-2 text-lol-gold">•</span>
                  <span className="text-lol-text">
                    {isPickPhase ? "PICK" : "BAN"}
                  </span>
                </h3>
              </div>
              <div className="flex-1 flex justify-end">
                <DraftTimer 
                  isActive={true}
                  team={currentTeam}
                  onTimeUp={handleTimeUp}
                  durationSeconds={30}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ChampionGrid 
                champions={champions}
                onChampionSelect={handleChampionSelect}
                selectedChampions={getSelectedChampions()}
                bannedChampions={getBannedChampions()}
              />
            </div>
          </div>
          
          <div className="w-1/5 pl-1 flex flex-col">
            <div className="mb-2">
              <h3 className="text-center text-lol-red text-xs font-medium mb-1">
                Red Team Bans
              </h3>
              <div className="flex flex-wrap justify-center gap-1">
                {redTeamBans.map((slot, index) => (
                  <div 
                    key={index}
                    className={`
                      w-10 h-10 border border-lol-red border-opacity-50 rounded overflow-hidden
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
              <TeamComposition 
                slots={redTeamPicks} 
                team="RED" 
                isPickPhase={isPickPhase}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
