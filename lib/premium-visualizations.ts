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
import DeterminantsVizPremium from "@/components/learn-visualizations/DeterminantsVizPremium";
import IntegralsVizPremium from "@/components/learn-visualizations/IntegralsVizPremium";
import VectorAlgebraVizPremium from "@/components/learn-visualizations/VectorAlgebraVizPremium";
import ContinuityVizPremium from "@/components/learn-visualizations/ContinuityVizPremium";
import ApplicationDerivativesVizPremium from "@/components/learn-visualizations/ApplicationDerivativesVizPremium";
import LinearProgrammingVizPremium from "@/components/learn-visualizations/LinearProgrammingVizPremium";

const registry: Record<string, ComponentType> = {
  // Class 11
  sets: SetsVizPremium,
  "relations-functions": FunctionsVizPremium,
  "trigonometric-functions": TrigVizPremium,
  "complex-numbers-quadratic": ComplexNumbersVizPremium,
  "permutations-combinations": PermutationsVizPremium,
  "binomial-theorem": BinomialVizPremium,
  "sequences-series": SequencesSeriesVizPremium,
  "straight-lines": StraightLinesVizPremium,
  "conic-sections": ConicSectionsVizPremium,
  "limits-derivatives": LimitsVizPremium,
  probability: ProbabilityVizPremium,

  // Class 12
  matrices: MatricesVizPremium,
  determinants: DeterminantsVizPremium,
  "continuity-differentiability": ContinuityVizPremium,
  "applications-derivatives": ApplicationDerivativesVizPremium,
  integrals: IntegralsVizPremium,
  vectors: VectorAlgebraVizPremium,
  "linear-programming": LinearProgrammingVizPremium,
  "probability-12": ProbabilityVizPremium,
};

export function getPremiumViz(chapterId: string): ComponentType | null {
  return registry[chapterId] ?? null;
}
