import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { champions, Champion } from "../data/champions";
import { draftSequence, DraftPhase, DraftSlot, Team } from "../data/draftTypes";
import ChampionGrid from "../components/ChampionGrid";
import TeamComposition from "../components/TeamComposition";
import BanPhase from "../components/BanPhase";
import DraftTimer from "../components/DraftTimer";
import PhaseIndicator from "../components/PhaseIndicator";
import ReadyCheck from "../components/ReadyCheck";
import { useToast } from "@/components/ui/use-toast";
import { socketClient } from '../utils/socket';
import { Button } from "@/components/ui/button";

interface DraftInfo {
  draftId: string;
  blueTeamName: string;
  redTeamName: string;
  createdAt: string;
}

interface DraftStatus {
  blueTeamReady: boolean;
  redTeamReady: boolean;
  isStarting: boolean;
}

const Index = () => {
  const { draftId } = useParams();
  const [searchParams] = useSearchParams();
  const team = searchParams.get("team") as "blue" | "red" | null;
  const navigate = useNavigate();
  const { toast } = useToast();
  const startTimeoutRef = useRef<number>();

  const [draftInfo, setDraftInfo] = useState<DraftInfo | null>(null);
  const [status, setStatus] = useState<DraftStatus>({
    blueTeamReady: false,
    redTeamReady: false,
    isStarting: false
  });
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
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
    if (!draftId || !team || (team !== 'blue' && team !== 'red')) {
      toast({
        variant: "destructive",
        title: "Invalid Link",
        description: "Invalid draft link"
      });
      navigate('/');
      return;
    }

    const socket = socketClient.getSocket();
    if (!socket) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to server"
      });
      return;
    }

    setIsConnecting(true);

    // Join the draft room
    socket.emit('join:draft', { draftId });

    // Listen for draft initialization
    socket.on('draft:initialized', (data: { draftInfo: DraftInfo, status: DraftStatus }) => {
      setDraftInfo(data.draftInfo);
      setStatus(data.status);
      setIsConnecting(false);
      setIsSubscribed(true);
    });

    // Listen for team status updates
    socket.on('team:status_updated', (newStatus: DraftStatus) => {
      setStatus(newStatus);
    });

    // Listen for draft starting
    socket.on('draft:starting', (data: { status: DraftStatus }) => {
      setStatus(data.status);
      toast({
        title: "Draft Starting",
        description: "Draft starting in 3 seconds..."
      });
      
      startTimeoutRef.current = window.setTimeout(() => {
        navigate(`/draft/${draftId}`);
      }, 3000);
    });

    // Listen for champion selections
    socket.on('champion:selected', (data) => {
      // Update the appropriate team's picks
      if (data.team === 'BLUE') {
        setBlueTeamPicks(prev => {
          const newPicks = [...prev];
          const index = newPicks.findIndex(pick => pick.position === data.position);
          if (index !== -1) {
            newPicks[index] = { ...newPicks[index], champion: data.champion };
          }
          return newPicks;
        });
      } else {
        setRedTeamPicks(prev => {
          const newPicks = [...prev];
          const index = newPicks.findIndex(pick => pick.position === data.position);
          if (index !== -1) {
            newPicks[index] = { ...newPicks[index], champion: data.champion };
          }
          return newPicks;
        });
      }
    });

    // Listen for champion bans
    socket.on('champion:banned', (data) => {
      // Update the appropriate team's bans
      if (data.team === 'BLUE') {
        setBlueTeamBans(prev => {
          const newBans = [...prev];
          const index = newBans.findIndex(ban => !ban.champion);
          if (index !== -1) {
            newBans[index] = { ...newBans[index], champion: data.champion };
          }
          return newBans;
        });
      } else {
        setRedTeamBans(prev => {
          const newBans = [...prev];
          const index = newBans.findIndex(ban => !ban.champion);
          if (index !== -1) {
            newBans[index] = { ...newBans[index], champion: data.champion };
          }
          return newBans;
        });
      }
    });

    return () => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      
      // Clean up socket listeners
      socket.off('draft:initialized');
      socket.off('team:status_updated');
      socket.off('draft:starting');
      socket.off('champion:selected');
      socket.off('champion:banned');
      
      // Leave the draft room
      socket.emit('leave:draft', { draftId });
    };
  }, [draftId, team, navigate, toast]);

  const updateReadyStatus = (isReady: boolean) => {
    if (!draftId || !team || status.isStarting || !isSubscribed) return;

    const socket = socketClient.getSocket();
    if (!socket) return;

    socket.emit('team:ready', {
      draftId,
      team,
      isReady
    });
  };

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

  if (!draftInfo && !isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lol-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-lol-gold mb-4">Draft Not Found</h2>
          <p className="text-lol-text mb-6">This draft room doesn't exist or has expired.</p>
          <Button onClick={() => navigate('/')} className="bg-lol-gold hover:bg-lol-lightGold text-black">
            Return to Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col py-2 px-4">
      <div className="container mx-auto h-full flex flex-col relative">
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-lol-gold mb-4">Connecting to Draft Room</h2>
              <p className="text-lol-text">Please wait...</p>
            </div>
          </div>
        )}
        
        {!status.isStarting && !isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-lol-gold">
              <h2 className="text-2xl font-bold text-lol-gold text-center mb-6">Ready Check</h2>
              <div className="flex gap-8">
                <div className="text-center">
                  <h3 className="text-lol-lightBlue font-semibold mb-2">Blue Team</h3>
                  {team === "blue" ? (
                    <button
                      onClick={() => updateReadyStatus(!status.blueTeamReady)}
                      disabled={!isSubscribed}
                      className={`w-32 px-4 py-2 rounded ${
                        status.blueTeamReady
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      } disabled:opacity-50`}
                    >
                      {status.blueTeamReady ? "Ready!" : "Not Ready"}
                    </button>
                  ) : (
                    <div className={`w-32 px-4 py-2 rounded ${
                      status.blueTeamReady ? "bg-green-600" : "bg-gray-600"
                    }`}>
                      {status.blueTeamReady ? "Ready!" : "Not Ready"}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lol-red font-semibold mb-2">Red Team</h3>
                  {team === "red" ? (
                    <button
                      onClick={() => updateReadyStatus(!status.redTeamReady)}
                      disabled={!isSubscribed}
                      className={`w-32 px-4 py-2 rounded ${
                        status.redTeamReady
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      } disabled:opacity-50`}
                    >
                      {status.redTeamReady ? "Ready!" : "Not Ready"}
                    </button>
                  ) : (
                    <div className={`w-32 px-4 py-2 rounded ${
                      status.redTeamReady ? "bg-green-600" : "bg-gray-600"
                    }`}>
                      {status.redTeamReady ? "Ready!" : "Not Ready"}
                    </div>
                  )}
                </div>
              </div>
              {status.isStarting && (
                <div className="text-center mt-6 text-green-400">
                  Both teams ready! Draft starting...
                </div>
              )}
            </div>
          </div>
        )}

        <h1 className="text-2xl font-bold text-center text-lol-gold mb-3">
          {draftInfo ? (
            <>
              {draftInfo.blueTeamName} vs {draftInfo.redTeamName}
              <div className="text-sm text-lol-text mt-1">
                {team === "blue" ? "Blue Side Captain" : "Red Side Captain"}
              </div>
            </>
          ) : (
            "League of Legends Champion Draft"
          )}
        </h1>
        
        {status.isStarting && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
