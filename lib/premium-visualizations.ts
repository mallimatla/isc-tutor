import type { ComponentType } from "react";

import SetsVizPremium from "@/components/learn-visualizations/SetsVizPremium";
import FunctionsVizPremium from "@/components/learn-visualizations/FunctionsVizPremium";
import TrigVizPremium from "@/components/learn-visualizations/TrigVizPremium";
import LimitsVizPremium from "@/components/learn-visualizations/LimitsVizPremium";
import ProbabilityVizPremium from "@/components/learn-visualizations/ProbabilityVizPremium";
import MatricesVizPremium from "@/components/learn-visualizations/MatricesVizPremium";

const registry: Record<string, ComponentType> = {
  sets: SetsVizPremium,
  "relations-functions": FunctionsVizPremium,
  "trigonometric-functions": TrigVizPremium,
  "limits-derivatives": LimitsVizPremium,
  probability: ProbabilityVizPremium,
  "probability-12": ProbabilityVizPremium,
  matrices: MatricesVizPremium,
};

export function getPremiumViz(chapterId: string): ComponentType | null {
  return registry[chapterId] ?? null;
}
