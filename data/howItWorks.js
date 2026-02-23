import { 
  UserPlus, 
  FileEdit, 
  Users, 
  LineChart, 
  Gamepad2, 
  Radar 
} from "lucide-react";

export const howItWorks = [
  {
    title: "Professional Onboarding",
    description: "Share your industry, skills and goals for personalized AI guidance",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Craft Your Documents",
    description: "Create ATS-optimized resumes and compelling cover letters",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Prepare for Interviews",
    description:
      "Practice with AI-powered mock interviews tailored to your target role",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Career Simulation Mode",
    description:
      "Experience real-world job scenarios with daily tasks, challenges and decision-based simulations",
    icon: <Gamepad2 className="w-8 h-8 text-primary" />,
  },
  {
    title: "Skill Gap Analyzer",
    description:
      "Compare your current skills with top companies and get a clear gap percentage with learning roadmap",
    icon: <Radar className="w-8 h-8 text-primary" />,
  },
  {
    title: "Track Your Growth",
    description:
      "Monitor progress with detailed performance analytics and improvement insights",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];