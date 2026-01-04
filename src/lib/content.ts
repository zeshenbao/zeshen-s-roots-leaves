// Content Schema - Extracted from CV and Transcript
// All data is typed and validated

export interface Person {
  name: string;
  location: string;
  phone: string;
  email: string;
  headline: string;
  introduction: string;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  description?: string;
  totalCredits?: number;
}

export interface Experience {
  title: string;
  organization: string;
  location: string;
  period: string;
  bullets: string[];
  advisors?: string;
  category: 'work' | 'research' | 'teaching' | 'volunteer';
}

export interface Project {
  title: string;
  date: string;
  description: string;
  type: 'technical-report' | 'project';
  links?: { label: string; url?: string }[];
  skills: string[];
}

export interface Publication {
  authors: string;
  title: string;
  venue: string;
  year: number;
  doi?: string;
}

export interface Course {
  name: string;
  nameEn: string;
  credits: number;
  date: string;
  theme: CourseTheme;
}

export type CourseTheme = 
  | 'mathematics' 
  | 'physics' 
  | 'ml-ai' 
  | 'computing' 
  | 'control' 
  | 'engineering' 
  | 'research'
  | 'other';

export interface SkillRoot {
  id: string;
  name: string;
  description: string;
  color: 'primary' | 'secondary' | 'tertiary';
}

export interface SkillLeaf {
  id: string;
  name: string;
  rootIds: string[];
  evidence: string;
  type: 'project' | 'course' | 'experience';
  link?: string;
}

// ============ PERSON DATA ============
export const person: Person = {
  name: "Zeshen Bao",
  location: "Stockholm, Sweden",
  phone: "+46 700 363 611",
  email: "zeshen@hotmail.se",
  headline: "Engineering Physics × AI/ML — Building intelligent systems from first principles",
  introduction: `I grew up very independent, as my non-academic family moved to Sweden when I was seven. My curiosity and drive led me to study engineering physics at KTH, giving me a strong foundation in math, physics, artificial intelligence, and machine learning, and preparing me to tackle any new challenges. My eagerness to help people like me devoted me to social work in my free time, where I taught and coached young children in math for free. I believed in them so they could believe in themselves, helping to change the course of their lives. In difficult times, I remain perseverant and reliable, always moving forward. When things are calm, I prepare for the worst to stay ready.`,
};

// ============ EDUCATION DATA ============
export const education: Education[] = [
  {
    degree: "M.Sc. in Engineering Physics",
    institution: "KTH Royal Institute of Technology",
    period: "Fall 2023 – Present",
    description: "Graduate studies specialising in high-energy physics, artificial intelligence, and machine learning. Focus on vision-based generative modelling with diffusion and flow-based models.",
    totalCredits: 279,
  },
  {
    degree: "B.Sc. in Engineering Physics",
    institution: "KTH Royal Institute of Technology",
    period: "Fall 2019 – Fall 2023",
  },
];

// ============ EXPERIENCE DATA ============
export const experiences: Experience[] = [
  {
    title: "Thesis Internship",
    organization: "KTH RPL (Robotics, Perception and Learning)",
    location: "Stockholm, Sweden",
    period: "March 2025 – Present",
    bullets: [
      "Developing and comparing tactile- and vision-based diffusion policies using multimodal generative modelling for peg-in-hole tasks with compliant grippers.",
    ],
    advisors: "Dr. Michael C. Welle, Marco Moletta",
    category: 'research',
  },
  {
    title: "Teaching Assistant",
    organization: "KTH Royal Institute of Technology",
    location: "Stockholm, Sweden",
    period: "Fall 2021 – Fall 2022",
    bullets: [
      "Fundamentals of Programming (Python, Algorithms) - Fall 2021, Fall 2022: Evaluated projects, responsible for lab sessions, and reviewed exams.",
      "Programming and Scientific Computing (Python) - Spring 2022: Responsible for monitoring and reviewing student projects over a month, teaching in exercise sessions, and having lab sessions.",
    ],
    category: 'teaching',
  },
  {
    title: "Undergraduate Research Internship",
    organization: "Oskar Klein Centre",
    location: "Stockholm, Sweden",
    period: "2022 – 2023",
    bullets: [
      "Responsible for developing and manufacturing broadband microwave absorbers for next-generation CMB satellite missions, including the JAXA-led LiteBIRD.",
    ],
    advisors: "Prof. Jón Emil Guðmundsson, Dr. Gaganpreet Singh",
    category: 'research',
  },
  {
    title: "Private Tutor",
    organization: "Studybuddy AB",
    location: "Stockholm, Sweden",
    period: "Summer 2021",
    bullets: [
      "Tutored and was responsible for a private student with a focus on math and physics.",
    ],
    category: 'teaching',
  },
  {
    title: "Exhibitor - Young Scientists",
    organization: "Stockholm, Sweden",
    location: "Stockholm, Sweden",
    period: "March 2019",
    bullets: [
      "Semifinalist: Classification of the Milky Way's Structure by the Hubble Sequence",
      "Designed and presented research poster to students, researchers, and the jury.",
    ],
    category: 'research',
  },
  {
    title: "Research Internship",
    organization: "Stockholm University",
    location: "Stockholm, Sweden",
    period: "Summer 2018",
    bullets: [
      "Responsible for analysing the Milky Way's structure via hydrogen-line regression analysis.",
    ],
    advisors: "Dr. Simon Ringqvist",
    category: 'research',
  },
];

// ============ VOLUNTEER EXPERIENCE ============
export const volunteerExperiences: Experience[] = [
  {
    title: "Head of Election Committee",
    organization: "Mattecentrum",
    location: "Stockholm, Sweden",
    period: "March 2025 – Present",
    bullets: [
      "Responsible for planning and coordinating meetings within the election committee, as well as interviewing, evaluating, and appointing the board of a national nonprofit promoting equal access to learning.",
      "Mattecentrum provides free math tutoring for children and youth, reaching 4.9 million users on digital platforms and operating 89 classrooms across 27 Swedish cities.",
    ],
    category: 'volunteer',
  },
  {
    title: "Board Member, Head of Finance",
    organization: "Mattecentrum Stockholm",
    location: "Stockholm, Sweden",
    period: "February 2023 – Present",
    bullets: [
      "Overseeing the operation of 30 weekly math classrooms across Stockholm and contributing to the development of the organisation, enabling free tutoring for young students.",
      "Responsible for managing a budget of 180 kSEK.",
    ],
    category: 'volunteer',
  },
  {
    title: "Reserve Math Coach",
    organization: "Mattecentrum",
    location: "Stockholm, Sweden",
    period: "February 2023 – Present",
    bullets: [
      "Tutoring mathematics for students from elementary school to university level.",
    ],
    category: 'volunteer',
  },
];

// ============ PROJECTS & TECHNICAL REPORTS ============
export const projects: Project[] = [
  {
    title: "D-Flow: Efficient Diffusion and Flow Sampling",
    date: "January 2025",
    description: "Developed a general sampling framework for diffusion and flow-based generative models, reducing sampling time from over 10 minutes to under 1 minute with minimal quality loss. Demonstrated practical improvements in computational efficiency for large-scale generative inference.",
    type: 'technical-report',
    links: [{ label: "PDF" }, { label: "Code" }],
    skills: ['generative-modeling', 'deep-learning', 'scientific-computing'],
  },
  {
    title: "Lunar Lander Control Using Deep Q-Network",
    date: "December 2024",
    description: "Implemented a Deep Q-Network with experience replay, target networks, and dueling architecture to solve the LunarLander-v2 control task. Achieved stable and interpretable autonomous landing behavior under stochastic dynamics.",
    type: 'technical-report',
    links: [{ label: "PDF" }],
    skills: ['reinforcement-learning', 'deep-learning', 'control'],
  },
  {
    title: "CPU-Efficient KANs for Channel Estimation",
    date: "December 2024",
    description: "Investigated Kolmogorov–Arnold Networks (KANs) for denoising and signal recovery in communication channels, comparing their performance to MLPs. Showed that KANs achieve better denoising on more complex data while remaining efficient for CPU-based systems.",
    type: 'technical-report',
    links: [{ label: "PDF" }, { label: "Code" }],
    skills: ['deep-learning', 'scientific-computing', 'ml-theory'],
  },
  {
    title: "Implementing DDPM from Scratch",
    date: "May 2024",
    description: "Built a transformer-like diffusion model from scratch with self- and cross-attention for class-conditional image generation. Demonstrated strong generative performance across multiple datasets, highlighting the model's capability to outperform baseline VAEs.",
    type: 'technical-report',
    links: [{ label: "PDF" }, { label: "Code" }],
    skills: ['generative-modeling', 'deep-learning'],
  },
  {
    title: "Metamaterial Absorber for Future Satellite Missions",
    date: "June 2022",
    description: "Developed a generator for metamaterial absorbers with selectable patterns and cross-sections. Exports designs as STL files for 3D printing.",
    type: 'project',
    links: [{ label: "Code" }],
    skills: ['scientific-computing', 'physics'],
  },
  {
    title: "Ray Tracer for Scene Rendering with Smooth Shadows",
    date: "May 2021",
    description: "Implemented a static ray tracer to render 2D images simulating an observer viewing a 3D room illuminated by a light source.",
    type: 'project',
    links: [{ label: "Code" }],
    skills: ['scientific-computing', 'programming'],
  },
];

// ============ PUBLICATION ============
export const publications: Publication[] = [
  {
    authors: "Gaganpreet Singh, Rustam Balafendiev, Zeshen Bao, Thomas J. L. J. Gascard, Jón E. Guðmundsson, Gagandeep Kaur, Vid Primožič",
    title: "Reflectance Measurements of mm-Wave Absorbers Using Frequency-Domain Continuous-Wave THz Spectroscopy",
    venue: "Proc. SPIE 13102, Millimeter, Submillimeter, and Far-Infrared Detectors and Instrumentation for Astronomy XII, 131021W",
    year: 2024,
    doi: "https://doi.org/10.1117/12.3018917",
  },
];

// ============ LANGUAGES ============
export const languages = {
  spoken: [
    { name: "Swedish", level: "Native" },
    { name: "Chinese (Mandarin)", level: "Native" },
    { name: "English", level: "Fluent" },
    { name: "Spanish", level: "Intermediate" },
  ],
  programming: [
    { name: "Python", level: "Advanced" },
    { name: "MATLAB", level: "Intermediate" },
  ],
};

// ============ COURSES ============
export const courses: Course[] = [
  // Mathematics
  { name: "Introduktion i matematik", nameEn: "Introduction to Mathematics", credits: 1.5, date: "2019-08-23", theme: "mathematics" },
  { name: "Analys i en variabel", nameEn: "Single Variable Calculus", credits: 7.5, date: "2020-01-14", theme: "mathematics" },
  { name: "Linjär algebra", nameEn: "Linear Algebra", credits: 7.5, date: "2020-02-11", theme: "mathematics" },
  { name: "Flervariabelanalys", nameEn: "Multivariable Calculus", credits: 7.5, date: "2020-06-03", theme: "mathematics" },
  { name: "Sannolikhetsteori och statistik", nameEn: "Probability Theory and Statistics", credits: 6.0, date: "2020-08-10", theme: "mathematics" },
  { name: "Vektoranalys", nameEn: "Vector Analysis", credits: 4.0, date: "2020-12-16", theme: "mathematics" },
  { name: "Linjär algebra, fortsättningskurs", nameEn: "Advanced Linear Algebra", credits: 6.0, date: "2022-01-12", theme: "mathematics" },
  { name: "Differentialekvationer och transformmetoder", nameEn: "Differential Equations and Transform Methods", credits: 9.0, date: "2022-01-14", theme: "mathematics" },
  { name: "Fysikens matematiska metoder", nameEn: "Mathematical Methods in Physics", credits: 4.0, date: "2022-04-03", theme: "mathematics" },
  
  // Physics
  { name: "Termodynamik", nameEn: "Thermodynamics", credits: 6.0, date: "2019-12-03", theme: "physics" },
  { name: "Klassisk fysik", nameEn: "Classical Physics", credits: 7.5, date: "2020-03-07", theme: "physics" },
  { name: "Mekanik I", nameEn: "Mechanics I", credits: 9.0, date: "2020-08-17", theme: "physics" },
  { name: "Mekanik, fortsättningskurs", nameEn: "Advanced Mechanics", credits: 6.0, date: "2020-11-08", theme: "physics" },
  { name: "Experimentell fysik", nameEn: "Experimental Physics", credits: 4.0, date: "2021-01-03", theme: "physics" },
  { name: "Modern fysik", nameEn: "Modern Physics", credits: 4.0, date: "2022-01-10", theme: "physics" },
  { name: "Teoretisk fysik", nameEn: "Theoretical Physics", credits: 6.0, date: "2022-05-30", theme: "physics" },
  { name: "Teoretisk elektroteknik", nameEn: "Theoretical Electrotechnics", credits: 9.0, date: "2023-01-09", theme: "physics" },
  { name: "Tillämpad modern fysik", nameEn: "Applied Modern Physics", credits: 5.0, date: "2023-01-10", theme: "physics" },
  { name: "Strömningsmekanik", nameEn: "Fluid Mechanics", credits: 4.0, date: "2023-01-30", theme: "physics" },
  { name: "Analytisk mekanik och klassisk fältteori", nameEn: "Analytical Mechanics and Classical Field Theory", credits: 7.5, date: "2023-05-31", theme: "physics" },
  { name: "Statistisk mekanik", nameEn: "Statistical Mechanics", credits: 7.5, date: "2023-10-19", theme: "physics" },
  { name: "Kvantmekanik, fortsättningskurs", nameEn: "Advanced Quantum Mechanics", credits: 7.5, date: "2023-10-23", theme: "physics" },
  { name: "Allmän relativitetsteori", nameEn: "General Relativity", credits: 6.0, date: "2024-01-10", theme: "physics" },
  { name: "Speciell relativitetsteori", nameEn: "Special Relativity", credits: 6.0, date: "2024-01-15", theme: "physics" },
  { name: "Relativistisk kvantfysik", nameEn: "Relativistic Quantum Physics", credits: 7.5, date: "2024-03-13", theme: "physics" },
  { name: "Teoretisk partikelfysik", nameEn: "Theoretical Particle Physics", credits: 7.5, date: "2024-05-27", theme: "physics" },
  { name: "Kvantfältteori", nameEn: "Quantum Field Theory", credits: 7.5, date: "2024-10-25", theme: "physics" },

  // ML/AI
  { name: "Maskininlärningens grunder", nameEn: "Fundamentals of Machine Learning", credits: 7.5, date: "2023-04-26", theme: "ml-ai" },
  { name: "Djupinlärning i Data Science", nameEn: "Deep Learning in Data Science", credits: 7.5, date: "2024-06-03", theme: "ml-ai" },
  { name: "Maskininlärningsteori", nameEn: "Machine Learning Theory", credits: 7.5, date: "2024-06-07", theme: "ml-ai" },
  { name: "Förstärkande inlärning", nameEn: "Reinforcement Learning", credits: 7.5, date: "2025-01-08", theme: "ml-ai" },
  { name: "Djupinlärning, fortsättningskurs", nameEn: "Advanced Deep Learning", credits: 6.0, date: "2025-01-20", theme: "ml-ai" },

  // Computing
  { name: "Datorintroduktion", nameEn: "Introduction to Computers", credits: 1.5, date: "2019-09-23", theme: "computing" },
  { name: "Grundläggande programmering", nameEn: "Fundamentals of Programming", credits: 5.0, date: "2019-10-18", theme: "computing" },
  { name: "Grundläggande datalogi", nameEn: "Fundamentals of Computer Science", credits: 6.0, date: "2021-06-07", theme: "computing" },
  { name: "Numeriska metoder, grundkurs IV", nameEn: "Numerical Methods", credits: 6.0, date: "2021-06-10", theme: "computing" },
  { name: "Simulering och modellering", nameEn: "Simulation and Modelling", credits: 6.0, date: "2023-01-30", theme: "computing" },
  { name: "Projektkurs i dataanalys", nameEn: "Data Analysis Project Course", credits: 7.5, date: "2025-01-02", theme: "computing" },

  // Control & Engineering
  { name: "Reglerteknik, allmän kurs", nameEn: "Control Theory", credits: 6.0, date: "2022-11-15", theme: "control" },
  { name: "Hållfasthetslära, grundkurs med energimetoder", nameEn: "Solid Mechanics", credits: 9.0, date: "2022-06-02", theme: "engineering" },

  // Research & Teaching
  { name: "Handledning, undervisning och lärande i datalogiutbildning", nameEn: "Teaching in Computer Science Education", credits: 3.0, date: "2022-05-19", theme: "research" },
  { name: "Research Methodology in Physics", nameEn: "Research Methodology in Physics", credits: 3.0, date: "2023-12-15", theme: "research" },
  { name: "Vetenskapsteori och vetenskaplig metodik (naturvetenskap)", nameEn: "Philosophy of Science and Scientific Methodology", credits: 4.5, date: "2024-10-23", theme: "research" },
  { name: "Hållbar utveckling inom teknisk fysik", nameEn: "Sustainable Development in Engineering Physics", credits: 1.5, date: "2024-11-15", theme: "other" },
  { name: "Examensarbete inom teknisk fysik, grundnivå", nameEn: "Bachelor's Thesis in Engineering Physics", credits: 15.0, date: "2023-06-07", theme: "research" },
];

// ============ SKILL ECOSYSTEM ============
export const skillRoots: SkillRoot[] = [
  { id: 'math-foundations', name: 'Mathematical Foundations', description: 'Analysis, Linear Algebra, Probability, Differential Equations', color: 'primary' },
  { id: 'physics-foundations', name: 'Physics Foundations', description: 'Classical Mechanics, Thermodynamics, Electromagnetism, Quantum Mechanics', color: 'primary' },
  { id: 'ml-theory', name: 'Machine Learning Theory', description: 'Statistical Learning, Optimization, Generalization', color: 'secondary' },
  { id: 'deep-learning', name: 'Deep Learning', description: 'Neural Networks, Transformers, Attention Mechanisms', color: 'secondary' },
  { id: 'generative-modeling', name: 'Generative Modeling', description: 'Diffusion Models, Flow Matching, VAEs', color: 'secondary' },
  { id: 'reinforcement-learning', name: 'Reinforcement Learning', description: 'Q-Learning, Policy Gradients, Control', color: 'secondary' },
  { id: 'scientific-computing', name: 'Scientific Computing', description: 'Numerical Methods, Simulation, Visualization', color: 'tertiary' },
  { id: 'control-robotics', name: 'Control & Robotics', description: 'Control Theory, Robotic Manipulation, Sensor Fusion', color: 'tertiary' },
  { id: 'high-energy-physics', name: 'High-Energy Physics', description: 'QFT, Particle Physics, Cosmology', color: 'primary' },
  { id: 'leadership', name: 'Leadership & Social Impact', description: 'Team Management, Finance, Teaching, Mentorship', color: 'tertiary' },
];

export const skillLeaves: SkillLeaf[] = [
  // Projects linked to roots
  { id: 'dflow', name: 'D-Flow Framework', rootIds: ['generative-modeling', 'deep-learning', 'scientific-computing'], evidence: 'Reduced sampling time from 10+ min to <1 min', type: 'project' },
  { id: 'ddpm', name: 'DDPM from Scratch', rootIds: ['generative-modeling', 'deep-learning'], evidence: 'Built transformer diffusion model with attention', type: 'project' },
  { id: 'dqn', name: 'DQN Lunar Lander', rootIds: ['reinforcement-learning', 'deep-learning'], evidence: 'Achieved stable autonomous landing', type: 'project' },
  { id: 'kan', name: 'KAN Channel Estimation', rootIds: ['deep-learning', 'ml-theory', 'scientific-computing'], evidence: 'CPU-efficient denoising outperforming MLPs', type: 'project' },
  { id: 'metamaterial', name: 'Metamaterial Generator', rootIds: ['scientific-computing', 'physics-foundations'], evidence: 'STL export for 3D printing absorbers', type: 'project' },
  { id: 'raytracer', name: 'Ray Tracer', rootIds: ['scientific-computing', 'math-foundations'], evidence: 'Smooth shadows and 3D rendering', type: 'project' },
  { id: 'thesis', name: 'Robotics Thesis', rootIds: ['control-robotics', 'generative-modeling', 'deep-learning'], evidence: 'Diffusion policies for peg-in-hole tasks', type: 'experience' },
  { id: 'cmb', name: 'CMB Absorbers (LiteBIRD)', rootIds: ['high-energy-physics', 'scientific-computing'], evidence: 'Microwave absorbers for JAXA satellite', type: 'experience' },
  { id: 'mattecentrum-lead', name: 'Mattecentrum Leadership', rootIds: ['leadership'], evidence: '30 classrooms, 180k SEK budget', type: 'experience' },
  
  // Courses as leaves (no grades shown)
  { id: 'dl-course', name: 'Deep Learning', rootIds: ['deep-learning', 'ml-theory'], evidence: '7.5 hp', type: 'course' },
  { id: 'adv-dl-course', name: 'Advanced Deep Learning', rootIds: ['deep-learning', 'generative-modeling'], evidence: '6.0 hp', type: 'course' },
  { id: 'ml-course', name: 'ML Fundamentals', rootIds: ['ml-theory', 'math-foundations'], evidence: '7.5 hp', type: 'course' },
  { id: 'rl-course', name: 'Reinforcement Learning', rootIds: ['reinforcement-learning', 'control-robotics'], evidence: '7.5 hp', type: 'course' },
  { id: 'qft-course', name: 'Quantum Field Theory', rootIds: ['high-energy-physics', 'physics-foundations'], evidence: '7.5 hp', type: 'course' },
  { id: 'prob-course', name: 'Probability & Statistics', rootIds: ['math-foundations', 'ml-theory'], evidence: '6.0 hp', type: 'course' },
  { id: 'sim-course', name: 'Simulation & Modelling', rootIds: ['scientific-computing', 'math-foundations'], evidence: '6.0 hp', type: 'course' },
];

// Helper function to get leaves by root
export function getLeavesByRoot(rootId: string): SkillLeaf[] {
  return skillLeaves.filter(leaf => leaf.rootIds.includes(rootId));
}

// Helper function to get roots by leaf
export function getRootsByLeaf(leafId: string): SkillRoot[] {
  const leaf = skillLeaves.find(l => l.id === leafId);
  if (!leaf) return [];
  return skillRoots.filter(root => leaf.rootIds.includes(root.id));
}

// Calculate stats (no grades)
export function getCourseStats() {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const byTheme = courses.reduce((acc, c) => {
    acc[c.theme] = (acc[c.theme] || 0) + c.credits;
    return acc;
  }, {} as Record<CourseTheme, number>);
  
  return { totalCredits, byTheme };
}
