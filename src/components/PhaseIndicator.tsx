
import { DraftPhase, Team } from "../data/draftTypes";

interface PhaseIndicatorProps {
  phases: DraftPhase[];
  currentPhase: number;
}

const PhaseIndicator = ({ phases, currentPhase }: PhaseIndicatorProps) => {
  // We're returning null since we want to remove this component from the UI
  return null;
};

export default PhaseIndicator;
