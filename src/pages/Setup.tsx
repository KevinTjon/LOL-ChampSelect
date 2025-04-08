import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { draftChannel, isConnected } from '../utils/pusher';
import { useToast } from "@/components/ui/use-toast";

const Setup = () => {
  const [blueTeamName, setBlueTeamName] = useState("");
  const [redTeamName, setRedTeamName] = useState("");
  const [draftId, setDraftId] = useState("");
  const [linksGenerated, setLinksGenerated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generateDraftId = () => {
    // Generate a random 6-character string
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setDraftId(id);
    return id;
  };

  const handleCreateDraft = async () => {
    if (!blueTeamName || !redTeamName) {
      toast({
        variant: "destructive",
        title: "Missing Team Names",
        description: "Please enter names for both teams"
      });
      return;
    }

    // Check Pusher configuration
    if (!import.meta.env.VITE_PUSHER_KEY || !import.meta.env.VITE_PUSHER_CLUSTER) {
      console.error('Missing Pusher configuration:', {
        key: import.meta.env.VITE_PUSHER_KEY ? 'present' : 'missing',
        cluster: import.meta.env.VITE_PUSHER_CLUSTER ? 'present' : 'missing'
      });
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Pusher configuration is missing. Please check environment variables."
      });
      return;
    }

    // Check Pusher connection
    if (!isConnected()) {
      console.error('Pusher is not connected');
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Not connected to Pusher. Please check your internet connection."
      });
      return;
    }

    setIsCreating(true);

    try {
      const id = generateDraftId();
      console.log('Generated draft ID:', id);
      
      // Create draft info
      const draftInfo = {
        draftId: id,
        blueTeamName,
        redTeamName,
        createdAt: new Date().toISOString(),
      };

      console.log('Initializing draft channel...');
      const channel = draftChannel(id);

      // Store draft info in localStorage first
      localStorage.setItem(`draft-${id}`, JSON.stringify({
        draftInfo,
        status: {
          blueTeamReady: false,
          redTeamReady: false,
          isStarting: false
        }
      }));

      // Wait for subscription to succeed
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.error('Subscription timeout after 5 seconds');
          reject(new Error('Subscription timeout'));
        }, 5000);

        channel.bind('pusher:subscription_succeeded', () => {
          console.log('Successfully subscribed to channel');
          clearTimeout(timeoutId);
          resolve(true);
        });

        channel.bind('pusher:subscription_error', (error: any) => {
          console.error('Subscription error:', error);
          clearTimeout(timeoutId);
          reject(new Error(`Subscription error: ${JSON.stringify(error)}`));
        });
      });

      // Now that we're subscribed, trigger the event
      try {
        console.log('Triggering client-init-draft event...');
        channel.trigger('client-init-draft', {
          draftInfo,
          status: {
            blueTeamReady: false,
            redTeamReady: false,
            isStarting: false
          }
        });

        setLinksGenerated(true);
        toast({
          title: "Draft Room Created",
          description: "Share the links with team captains"
        });
      } catch (triggerError) {
        console.error('Error triggering client event:', triggerError);
        throw new Error(`Failed to initialize draft: ${triggerError.message}`);
      }

    } catch (error) {
      console.error('Error creating draft:', error);
      localStorage.removeItem(`draft-${draftId}`); // Clean up if failed
      
      // Provide more specific error messages
      let errorMessage = "Please try again in a few moments";
      if (error.message.includes('Subscription timeout')) {
        errorMessage = "Connection timed out. Please check your internet connection.";
      } else if (error.message.includes('Subscription error')) {
        errorMessage = "Failed to connect to draft room. Please check your Pusher configuration.";
      } else if (error.message.includes('client event')) {
        errorMessage = "Failed to initialize draft room. Make sure client events are enabled in Pusher.";
      }
      
      toast({
        variant: "destructive",
        title: "Error Creating Draft",
        description: errorMessage
      });
      setDraftId(""); // Reset draft ID if failed
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lol-dark p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-lol-gold p-8">
        <h1 className="text-3xl font-bold text-lol-gold text-center mb-8">
          League of Legends Draft Setup
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-lol-lightBlue font-semibold block">
                Blue Side Team Name
              </label>
              <Input
                value={blueTeamName}
                onChange={(e) => setBlueTeamName(e.target.value)}
                className="bg-gray-800 border-lol-blue text-white"
                placeholder="Enter blue team name"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-lol-red font-semibold block">
                Red Side Team Name
              </label>
              <Input
                value={redTeamName}
                onChange={(e) => setRedTeamName(e.target.value)}
                className="bg-gray-800 border-lol-red text-white"
                placeholder="Enter red team name"
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleCreateDraft}
              className="bg-lol-gold hover:bg-lol-lightGold text-black font-semibold px-8 py-2"
              disabled={isCreating}
            >
              {isCreating ? "Creating Draft Room..." : "Create Draft Room"}
            </Button>
          </div>

          {linksGenerated && (
            <div className="mt-8 space-y-4 border-t border-lol-gold pt-6">
              <h2 className="text-xl text-lol-gold text-center mb-4">
                Captain Links
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-lol-lightBlue font-semibold block">
                    Blue Team Captain Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/draft/${draftId}?team=blue`}
                      className="bg-gray-800 border-lol-blue text-white flex-1"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/draft/${draftId}?team=blue`
                        );
                        toast({
                          title: "Link Copied",
                          description: "Blue team captain link copied to clipboard"
                        });
                      }}
                      className="bg-lol-blue hover:bg-blue-600"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-lol-red font-semibold block">
                    Red Team Captain Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/draft/${draftId}?team=red`}
                      className="bg-gray-800 border-lol-red text-white flex-1"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/draft/${draftId}?team=red`
                        );
                        toast({
                          title: "Link Copied",
                          description: "Red team captain link copied to clipboard"
                        });
                      }}
                      className="bg-lol-red hover:bg-red-600"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Setup; 