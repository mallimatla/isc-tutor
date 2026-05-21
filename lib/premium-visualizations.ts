import type { ComponentType } from "react";

import SetsVizPremium from "@/components/learn-visualizations/SetsVizPremium";
import FunctionsVizPremium from "@/components/learn-visualizations/FunctionsVizPremium";
import TrigVizPremium from "@/components/learn-visualizations/TrigVizPremium";
import LimitsVizPremium from "@/components/learn-visualizations/LimitsVizPremium";
import ProbabilityVizPremium from "@/components/learn-visualizations/ProbabilityVizPremium";
import MatricesVizPremium from "@/components/learn-visualizations/MatricesVizPremium";
import ComplexNumbersVizPremium from "@/components/learn-visualizations/ComplexNumbersVizPremium";
import SequencesSeriesVizPremium from "@/components/learn-visualizations/SequencesSeriesVizPremium";
import StraightLinesVizPremium from "@/components/learn-visualizations/StraightLinesVizPremium";
import ConicSectionsVizPremium from "@/components/learn-visualizations/ConicSectionsVizPremium";
import PermutationsVizPremium from "@/components/learn-visualizations/PermutationsVizPremium";
import BinomialVizPremium from "@/components/learn-visualizations/BinomialVizPremium";

const registry: Record<string, ComponentType> = {
  sets: SetsVizPremium,
  "relations-functions": FunctionsVizPremium,
  "trigonometric-functions": TrigVizPremium,
  "limits-derivatives": LimitsVizPremium,
  probability: ProbabilityVizPremium,
  "probability-12": ProbabilityVizPremium,
  matrices: MatricesVizPremium,
  "complex-numbers-quadratic": ComplexNumbersVizPremium,
  "sequences-series": SequencesSeriesVizPremium,
  "straight-lines": StraightLinesVizPremium,
  "conic-sections": ConicSectionsVizPremium,
  "permutations-combinations": PermutationsVizPremium,
  "binomial-theorem": BinomialVizPremium,
};

export function getPremiumViz(chapterId: string): ComponentType | null {
  return registry[chapterId] ?? null;
}
