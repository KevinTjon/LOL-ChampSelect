import { Button } from "@/components/ui/button";

interface ReadyCheckProps {
  blueTeamReady: boolean;
  redTeamReady: boolean;
  onBlueTeamReady: () => void;
  onRedTeamReady: () => void;
  isDraftStarted: boolean;
}

const ReadyCheck = ({
  blueTeamReady,
  redTeamReady,
  onBlueTeamReady,
  onRedTeamReady,
  isDraftStarted
}: ReadyCheckProps) => {
  if (isDraftStarted) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-lol-gold">
        <h2 className="text-2xl font-bold text-lol-gold text-center mb-6">Ready Check</h2>
        <div className="flex gap-8">
          <div className="text-center">
            <h3 className="text-lol-lightBlue font-semibold mb-2">Blue Team</h3>
            <Button
              onClick={onBlueTeamReady}
              className={`w-32 ${
                blueTeamReady
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {blueTeamReady ? "Ready!" : "Not Ready"}
            </Button>
          </div>
          <div className="text-center">
            <h3 className="text-lol-red font-semibold mb-2">Red Team</h3>
            <Button
              onClick={onRedTeamReady}
              className={`w-32 ${
                redTeamReady
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {redTeamReady ? "Ready!" : "Not Ready"}
            </Button>
          </div>
        </div>
        {blueTeamReady && redTeamReady && (
          <div className="text-center mt-6 text-green-400">
            Both teams ready! Draft starting...
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadyCheck; 