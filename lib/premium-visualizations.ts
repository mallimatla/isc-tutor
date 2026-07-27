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
import InductionVizPremium from "@/components/learn-visualizations/InductionVizPremium";
import LinearInequalitiesVizPremium from "@/components/learn-visualizations/LinearInequalitiesVizPremium";
import ThreeDGeometryVizPremium from "@/components/learn-visualizations/ThreeDGeometryVizPremium";
import MathReasoningVizPremium from "@/components/learn-visualizations/MathReasoningVizPremium";
import StatisticsVizPremium from "@/components/learn-visualizations/StatisticsVizPremium";
import RelationsFunctions12VizPremium from "@/components/learn-visualizations/RelationsFunctions12VizPremium";
import InverseTrigVizPremium from "@/components/learn-visualizations/InverseTrigVizPremium";
import ApplicationsIntegralsVizPremium from "@/components/learn-visualizations/ApplicationsIntegralsVizPremium";
import DifferentialEquationsVizPremium from "@/components/learn-visualizations/DifferentialEquationsVizPremium";
import ThreeDLinesPlanesVizPremium from "@/components/learn-visualizations/ThreeDLinesPlanesVizPremium";

// Physics (Class 11)
import UnitsMeasurementsVizPremium from "@/components/learn-visualizations/UnitsMeasurementsVizPremium";
import KinematicsVizPremium from "@/components/learn-visualizations/KinematicsVizPremium";
import LawsOfMotionVizPremium from "@/components/learn-visualizations/LawsOfMotionVizPremium";
import WorkEnergyPowerVizPremium from "@/components/learn-visualizations/WorkEnergyPowerVizPremium";
import OscillationsVizPremium from "@/components/learn-visualizations/OscillationsVizPremium";
import WavesVizPremium from "@/components/learn-visualizations/WavesVizPremium";
import RotationalMotionVizPremium from "@/components/learn-visualizations/RotationalMotionVizPremium";
import GravitationVizPremium from "@/components/learn-visualizations/GravitationVizPremium";
import MechanicalPropertiesSolidsVizPremium from "@/components/learn-visualizations/MechanicalPropertiesSolidsVizPremium";
import MechanicalPropertiesFluidsVizPremium from "@/components/learn-visualizations/MechanicalPropertiesFluidsVizPremium";
import ThermalPropertiesMatterVizPremium from "@/components/learn-visualizations/ThermalPropertiesMatterVizPremium";
import ThermodynamicsVizPremium from "@/components/learn-visualizations/ThermodynamicsVizPremium";
import KineticTheoryVizPremium from "@/components/learn-visualizations/KineticTheoryVizPremium";

const registry: Record<string, ComponentType> = {
  // ---- Mathematics ----
  // Class 11
  sets: SetsVizPremium,
  "relations-functions": FunctionsVizPremium,
  "trigonometric-functions": TrigVizPremium,
  "principle-mathematical-induction": InductionVizPremium,
  "complex-numbers-quadratic": ComplexNumbersVizPremium,
  "linear-inequalities": LinearInequalitiesVizPremium,
  "permutations-combinations": PermutationsVizPremium,
  "binomial-theorem": BinomialVizPremium,
  "sequences-series": SequencesSeriesVizPremium,
  "straight-lines": StraightLinesVizPremium,
  "conic-sections": ConicSectionsVizPremium,
  "intro-3d-geometry": ThreeDGeometryVizPremium,
  "limits-derivatives": LimitsVizPremium,
  "mathematical-reasoning": MathReasoningVizPremium,
  statistics: StatisticsVizPremium,
  probability: ProbabilityVizPremium,

  // Class 12
  "relations-functions-12": RelationsFunctions12VizPremium,
  "inverse-trigonometric-functions": InverseTrigVizPremium,
  matrices: MatricesVizPremium,
  determinants: DeterminantsVizPremium,
  "continuity-differentiability": ContinuityVizPremium,
  "applications-derivatives": ApplicationDerivativesVizPremium,
  integrals: IntegralsVizPremium,
  "applications-integrals": ApplicationsIntegralsVizPremium,
  "differential-equations": DifferentialEquationsVizPremium,
  vectors: VectorAlgebraVizPremium,
  "3d-geometry": ThreeDLinesPlanesVizPremium,
  "linear-programming": LinearProgrammingVizPremium,
  "probability-12": ProbabilityVizPremium,

  // ---- Physics (Class 11) ----
  "units-measurements": UnitsMeasurementsVizPremium,
  kinematics: KinematicsVizPremium,
  "laws-of-motion": LawsOfMotionVizPremium,
  "work-energy-power": WorkEnergyPowerVizPremium,
  "rotational-motion": RotationalMotionVizPremium,
  gravitation: GravitationVizPremium,
  "mechanical-properties-solids": MechanicalPropertiesSolidsVizPremium,
  "mechanical-properties-fluids": MechanicalPropertiesFluidsVizPremium,
  "thermal-properties-matter": ThermalPropertiesMatterVizPremium,
  thermodynamics: ThermodynamicsVizPremium,
  "kinetic-theory": KineticTheoryVizPremium,
  oscillations: OscillationsVizPremium,
  waves: WavesVizPremium,
};

export function getPremiumViz(chapterId: string): ComponentType | null {
  return registry[chapterId] ?? null;
}
