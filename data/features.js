import { 
  BrainCircuit, 
  Briefcase, 
  LineChart, 
  ScrollText,
  Gamepad2,
  Radar 
} from "lucide-react";

export const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
    title: "AI-Powered Career Guidance",
    description:
      "Get deeply personalized career advice, growth strategies, and smart recommendations powered by advanced AI.",
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "Smart Resume & Cover Letter Builder",
    description:
      "Generate ATS-optimized resumes and compelling cover letters tailored to your target role.",
  },
  {
    icon: <Briefcase className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Interview Preparation",
    description:
      "Practice with role-specific mock interviews and receive instant AI feedback to improve confidence and clarity.",
  },
  {
    icon: <Gamepad2 className="w-10 h-10 mb-4 text-primary" />,
    title: "Career Simulation Mode",
    description:
      "Experience real-world job scenarios with daily tasks, problem-solving challenges, and interactive decision making.",
  },
  {
    icon: <Radar className="w-10 h-10 mb-4 text-primary" />,
    title: "Skill Gap Analyzer",
    description:
      "Compare your skills with top company requirements, calculate your gap percentage, and get a structured learning roadmap.",
  },
  {
    icon: <LineChart className="w-10 h-10 mb-4 text-primary" />,
    title: "Industry Insights & Analytics",
    description:
      "Stay ahead with real-time industry trends, salary benchmarks, and personalized growth tracking.",
  },
];