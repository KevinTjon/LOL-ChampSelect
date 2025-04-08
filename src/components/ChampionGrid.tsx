
import { useState } from "react";
import { Champion } from "../data/champions";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface ChampionGridProps {
  champions: Champion[];
  onChampionSelect: (champion: Champion) => void;
  selectedChampions: Champion[];
  bannedChampions: Champion[];
}

const ChampionGrid = ({ 
  champions, 
  onChampionSelect, 
  selectedChampions, 
  bannedChampions 
}: ChampionGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  const roles = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];
  
  const filteredChampions = champions.filter(champion => {
    const matchesSearch = champion.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? champion.roles.includes(roleFilter) : true;
    const isAvailable = !selectedChampions.some(c => c.id === champion.id) && 
                       !bannedChampions.some(c => c.id === champion.id);
    
    return matchesSearch && matchesRole && isAvailable;
  });

  return (
    <div className="bg-black bg-opacity-50 p-4 rounded-md">
      <div className="flex flex-col gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lol-gold opacity-70" size={18} />
          <Input 
            type="text" 
            placeholder="Search champions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-lol-dark border-lol-gold border-opacity-50 text-lol-text"
          />
        </div>
        <div className="flex flex-wrap gap-1 items-center">
          <Filter size={16} className="text-lol-gold mr-1" />
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role === roleFilter ? null : role)}
              className={`px-2 py-1 text-xs rounded ${
                role === roleFilter 
                  ? "bg-lol-gold text-lol-dark" 
                  : "bg-lol-dark bg-opacity-70 text-lol-gold border border-lol-gold border-opacity-30"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-6 gap-2 max-h-[320px] overflow-y-auto pr-2 champion-grid">
        {filteredChampions.map(champion => (
          <div 
            key={champion.id}
            className="champion-portrait rounded-md overflow-hidden"
            onClick={() => onChampionSelect(champion)}
          >
            <img 
              src={champion.image} 
              alt={champion.name}
              className="w-full aspect-square object-cover"
            />
            <div className="bg-black bg-opacity-70 text-center py-1 text-xs">
              {champion.name}
            </div>
          </div>
        ))}
        {filteredChampions.length === 0 && (
          <div className="col-span-6 text-center py-8 text-lol-text opacity-70">
            No champions match your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default ChampionGrid;
