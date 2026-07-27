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

// Physics (Class 12)
import ElectricChargesFieldsVizPremium from "@/components/learn-visualizations/ElectricChargesFieldsVizPremium";
import ElectrostaticPotentialCapacitanceVizPremium from "@/components/learn-visualizations/ElectrostaticPotentialCapacitanceVizPremium";
import CurrentElectricityVizPremium from "@/components/learn-visualizations/CurrentElectricityVizPremium";
import MovingChargesMagnetismVizPremium from "@/components/learn-visualizations/MovingChargesMagnetismVizPremium";
import MagnetismMatterVizPremium from "@/components/learn-visualizations/MagnetismMatterVizPremium";
import ElectromagneticInductionVizPremium from "@/components/learn-visualizations/ElectromagneticInductionVizPremium";
import AlternatingCurrentVizPremium from "@/components/learn-visualizations/AlternatingCurrentVizPremium";
import ElectromagneticWavesVizPremium from "@/components/learn-visualizations/ElectromagneticWavesVizPremium";
import RayOpticsVizPremium from "@/components/learn-visualizations/RayOpticsVizPremium";
import WaveOpticsVizPremium from "@/components/learn-visualizations/WaveOpticsVizPremium";
import DualNatureRadiationVizPremium from "@/components/learn-visualizations/DualNatureRadiationVizPremium";
import AtomsVizPremium from "@/components/learn-visualizations/AtomsVizPremium";
import NucleiVizPremium from "@/components/learn-visualizations/NucleiVizPremium";
import SemiconductorElectronicsVizPremium from "@/components/learn-visualizations/SemiconductorElectronicsVizPremium";

// Chemistry (Class 11)
import BasicConceptsVizPremium from "@/components/learn-visualizations/BasicConceptsVizPremium";
import StructureOfAtomVizPremium from "@/components/learn-visualizations/StructureOfAtomVizPremium";
import PeriodicClassificationVizPremium from "@/components/learn-visualizations/PeriodicClassificationVizPremium";
import ChemicalBondingVizPremium from "@/components/learn-visualizations/ChemicalBondingVizPremium";
import StatesOfMatterVizPremium from "@/components/learn-visualizations/StatesOfMatterVizPremium";
import ChemicalThermodynamicsVizPremium from "@/components/learn-visualizations/ChemicalThermodynamicsVizPremium";
import EquilibriumVizPremium from "@/components/learn-visualizations/EquilibriumVizPremium";
import RedoxReactionsVizPremium from "@/components/learn-visualizations/RedoxReactionsVizPremium";
import HydrogenVizPremium from "@/components/learn-visualizations/HydrogenVizPremium";
import SBlockElementsVizPremium from "@/components/learn-visualizations/SBlockElementsVizPremium";
import PBlockElements11VizPremium from "@/components/learn-visualizations/PBlockElements11VizPremium";
import OrganicBasicsVizPremium from "@/components/learn-visualizations/OrganicBasicsVizPremium";
import HydrocarbonsVizPremium from "@/components/learn-visualizations/HydrocarbonsVizPremium";
import EnvironmentalChemistryVizPremium from "@/components/learn-visualizations/EnvironmentalChemistryVizPremium";

// Chemistry (Class 12)
import SolidStateVizPremium from "@/components/learn-visualizations/SolidStateVizPremium";
import SolutionsVizPremium from "@/components/learn-visualizations/SolutionsVizPremium";
import ElectrochemistryVizPremium from "@/components/learn-visualizations/ElectrochemistryVizPremium";
import ChemicalKineticsVizPremium from "@/components/learn-visualizations/ChemicalKineticsVizPremium";
import SurfaceChemistryVizPremium from "@/components/learn-visualizations/SurfaceChemistryVizPremium";
import MetallurgyVizPremium from "@/components/learn-visualizations/MetallurgyVizPremium";
import PBlockElements12VizPremium from "@/components/learn-visualizations/PBlockElements12VizPremium";
import DFBlockElementsVizPremium from "@/components/learn-visualizations/DFBlockElementsVizPremium";
import CoordinationCompoundsVizPremium from "@/components/learn-visualizations/CoordinationCompoundsVizPremium";
import HaloalkanesHaloarenesVizPremium from "@/components/learn-visualizations/HaloalkanesHaloarenesVizPremium";
import AlcoholsPhenolsEthersVizPremium from "@/components/learn-visualizations/AlcoholsPhenolsEthersVizPremium";
import AldehydesKetonesAcidsVizPremium from "@/components/learn-visualizations/AldehydesKetonesAcidsVizPremium";
import AminesVizPremium from "@/components/learn-visualizations/AminesVizPremium";
import BiomoleculesVizPremium from "@/components/learn-visualizations/BiomoleculesVizPremium";
import PolymersVizPremium from "@/components/learn-visualizations/PolymersVizPremium";
import EverydayChemistryVizPremium from "@/components/learn-visualizations/EverydayChemistryVizPremium";

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

  // ---- Physics (Class 12) ----
  "electric-charges-fields": ElectricChargesFieldsVizPremium,
  "electrostatic-potential-capacitance": ElectrostaticPotentialCapacitanceVizPremium,
  "current-electricity": CurrentElectricityVizPremium,
  "moving-charges-magnetism": MovingChargesMagnetismVizPremium,
  "magnetism-matter": MagnetismMatterVizPremium,
  "electromagnetic-induction": ElectromagneticInductionVizPremium,
  "alternating-current": AlternatingCurrentVizPremium,
  "electromagnetic-waves": ElectromagneticWavesVizPremium,
  "ray-optics": RayOpticsVizPremium,
  "wave-optics": WaveOpticsVizPremium,
  "dual-nature-radiation": DualNatureRadiationVizPremium,
  atoms: AtomsVizPremium,
  nuclei: NucleiVizPremium,
  "semiconductor-electronics": SemiconductorElectronicsVizPremium,

  // ---- Chemistry (Class 11) ----
  "basic-concepts": BasicConceptsVizPremium,
  "structure-of-atom": StructureOfAtomVizPremium,
  "periodic-classification": PeriodicClassificationVizPremium,
  "chemical-bonding": ChemicalBondingVizPremium,
  "states-of-matter": StatesOfMatterVizPremium,
  "chemical-thermodynamics": ChemicalThermodynamicsVizPremium,
  equilibrium: EquilibriumVizPremium,
  "redox-reactions": RedoxReactionsVizPremium,
  hydrogen: HydrogenVizPremium,
  "s-block-elements": SBlockElementsVizPremium,
  "p-block-elements-11": PBlockElements11VizPremium,
  "organic-basics": OrganicBasicsVizPremium,
  hydrocarbons: HydrocarbonsVizPremium,
  "environmental-chemistry": EnvironmentalChemistryVizPremium,

  // ---- Chemistry (Class 12) ----
  "solid-state": SolidStateVizPremium,
  solutions: SolutionsVizPremium,
  electrochemistry: ElectrochemistryVizPremium,
  "chemical-kinetics": ChemicalKineticsVizPremium,
  "surface-chemistry": SurfaceChemistryVizPremium,
  metallurgy: MetallurgyVizPremium,
  "p-block-elements-12": PBlockElements12VizPremium,
  "d-f-block-elements": DFBlockElementsVizPremium,
  "coordination-compounds": CoordinationCompoundsVizPremium,
  "haloalkanes-haloarenes": HaloalkanesHaloarenesVizPremium,
  "alcohols-phenols-ethers": AlcoholsPhenolsEthersVizPremium,
  "aldehydes-ketones-acids": AldehydesKetonesAcidsVizPremium,
  amines: AminesVizPremium,
  biomolecules: BiomoleculesVizPremium,
  polymers: PolymersVizPremium,
  "everyday-chemistry": EverydayChemistryVizPremium,
};

export function getPremiumViz(chapterId: string): ComponentType | null {
  return registry[chapterId] ?? null;
}
