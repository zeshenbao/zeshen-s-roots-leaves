// Content Schema - Extracted from CV and Transcript
// PRIVACY: No grades, no sensitive identifiers (personnummer/national IDs)
// All data is typed with strict layer semantics

// ============ TYPE DEFINITIONS ============

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
  id: string;
  title: string;
  organization: string;
  location: string;
  period: string;
  bullets: string[];
  advisors?: string;
  category: 'work' | 'research' | 'teaching' | 'volunteer';
}

export interface Project {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'technical-report' | 'project';
  links?: { label: string; url?: string }[];
  skills: string[];
}

export interface Publication {
  id: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  doi?: string;
}

export interface Course {
  id: string;
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

// ============ TREE NODE TYPES (Multi-Layer Model) ============

export type TreeNodeType = 'root' | 'trunk' | 'branch' | 'leaf' | 'fruit';
export type EdgeType = 'feeds' | 'supports' | 'produces' | 'highlights';

// ROOT: Foundational competencies (never projects/courses/jobs)
export interface RootNode {
  id: string;
  type: 'root';
  name: string;
  description: string;
  category: 'math' | 'physics' | 'ml' | 'computing' | 'soft-skills';
}

// TRUNK: Identity/thesis statement
export interface TrunkNode {
  id: string;
  type: 'trunk';
  name: string;
  description: string;
}

// BRANCH: Category groupings connecting roots to leaves
export interface BranchNode {
  id: string;
  type: 'branch';
  name: string;
  description: string;
  rootIds: string[]; // Which roots feed into this branch
}

// LEAF: Concrete evidence only (projects, experiences, publications)
export interface LeafNode {
  id: string;
  type: 'leaf';
  name: string;
  summary: string;
  branchId: string; // Each leaf belongs to exactly one branch
  evidenceType: 'project' | 'experience' | 'publication';
  evidenceId: string; // Reference to the actual project/experience/publication
  isFruit?: boolean; // Highlight as top outcome
}

// Edge connecting nodes
export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
}

// Union type for all tree nodes
export type TreeNode = RootNode | TrunkNode | BranchNode | LeafNode;

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
    id: 'thesis-internship',
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
    id: 'ta-kth',
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
    id: 'okc-internship',
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
    id: 'tutor-studybuddy',
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
    id: 'young-scientists',
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
    id: 'su-internship',
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
    id: 'mattecentrum-election',
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
    id: 'mattecentrum-finance',
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
    id: 'mattecentrum-coach',
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
    id: 'dflow',
    title: "D-Flow: Efficient Diffusion and Flow Sampling",
    date: "January 2025",
    description: "Developed a general sampling framework for diffusion and flow-based generative models, reducing sampling time from over 10 minutes to under 1 minute with minimal quality loss. Demonstrated practical improvements in computational efficiency for large-scale generative inference.",
    type: 'technical-report',
    links: [{ label: "PDF" }, { label: "Code" }],
    skills: ['generative-modeling', 'deep-learning', 'scientific-computing'],
  },
  {
    id: 'dqn',
    title: "Lunar Lander Control Using Deep Q-Network",
    date: "December 2024",
    description: "Implemented a Deep Q-Network with experience replay, target networks, and dueling architecture to solve the LunarLander-v2 control task. Achieved stable and interpretable autonomous landing behavior under stochastic dynamics.",
    type: 'technical-report',
    links: [{ label: "PDF" }],
    skills: ['reinforcement-learning', 'deep-learning', 'control'],
  },
  {
    id: 'kan',
    title: "CPU-Efficient KANs for Channel Estimation",
    date: "December 2024",
    description: "Investigated Kolmogorov–Arnold Networks (KANs) for denoising and signal recovery in communication channels, comparing their performance to MLPs. Showed that KANs achieve better denoising on more complex data while remaining efficient for CPU-based systems.",
    type: 'technical-report',
    links: [{ label: "PDF" }, { label: "Code" }],
    skills: ['deep-learning', 'scientific-computing', 'ml-theory'],
  },
  {
    id: 'ddpm',
    title: "Implementing DDPM from Scratch",
    date: "May 2024",
    description: "Built a transformer-like diffusion model from scratch with self- and cross-attention for class-conditional image generation. Demonstrated strong generative performance across multiple datasets, highlighting the model's capability to outperform baseline VAEs.",
    type: 'technical-report',
    links: [{ label: "PDF" }, { label: "Code" }],
    skills: ['generative-modeling', 'deep-learning'],
  },
  {
    id: 'metamaterial',
    title: "Metamaterial Absorber for Future Satellite Missions",
    date: "June 2022",
    description: "Developed a generator for metamaterial absorbers with selectable patterns and cross-sections. Exports designs as STL files for 3D printing.",
    type: 'project',
    links: [{ label: "Code" }],
    skills: ['scientific-computing', 'physics'],
  },
  {
    id: 'raytracer',
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
    id: 'spie-2024',
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

// ============ COURSES (NO GRADES) ============
export const courses: Course[] = [
  // Mathematics
  { id: 'intro-math', name: "Introduktion i matematik", nameEn: "Introduction to Mathematics", credits: 1.5, date: "2019-08-23", theme: "mathematics" },
  { id: 'calc-1', name: "Analys i en variabel", nameEn: "Single Variable Calculus", credits: 7.5, date: "2020-01-14", theme: "mathematics" },
  { id: 'lin-alg', name: "Linjär algebra", nameEn: "Linear Algebra", credits: 7.5, date: "2020-02-11", theme: "mathematics" },
  { id: 'multi-calc', name: "Flervariabelanalys", nameEn: "Multivariable Calculus", credits: 7.5, date: "2020-06-03", theme: "mathematics" },
  { id: 'prob-stats', name: "Sannolikhetsteori och statistik", nameEn: "Probability Theory and Statistics", credits: 6.0, date: "2020-08-10", theme: "mathematics" },
  { id: 'vec-analysis', name: "Vektoranalys", nameEn: "Vector Analysis", credits: 4.0, date: "2020-12-16", theme: "mathematics" },
  { id: 'adv-lin-alg', name: "Linjär algebra, fortsättningskurs", nameEn: "Advanced Linear Algebra", credits: 6.0, date: "2022-01-12", theme: "mathematics" },
  { id: 'diff-eq', name: "Differentialekvationer och transformmetoder", nameEn: "Differential Equations and Transform Methods", credits: 9.0, date: "2022-01-14", theme: "mathematics" },
  { id: 'math-physics', name: "Fysikens matematiska metoder", nameEn: "Mathematical Methods in Physics", credits: 4.0, date: "2022-04-03", theme: "mathematics" },
  
  // Physics
  { id: 'thermo', name: "Termodynamik", nameEn: "Thermodynamics", credits: 6.0, date: "2019-12-03", theme: "physics" },
  { id: 'classical', name: "Klassisk fysik", nameEn: "Classical Physics", credits: 7.5, date: "2020-03-07", theme: "physics" },
  { id: 'mech-1', name: "Mekanik I", nameEn: "Mechanics I", credits: 9.0, date: "2020-08-17", theme: "physics" },
  { id: 'adv-mech', name: "Mekanik, fortsättningskurs", nameEn: "Advanced Mechanics", credits: 6.0, date: "2020-11-08", theme: "physics" },
  { id: 'exp-physics', name: "Experimentell fysik", nameEn: "Experimental Physics", credits: 4.0, date: "2021-01-03", theme: "physics" },
  { id: 'modern-physics', name: "Modern fysik", nameEn: "Modern Physics", credits: 4.0, date: "2022-01-10", theme: "physics" },
  { id: 'theo-physics', name: "Teoretisk fysik", nameEn: "Theoretical Physics", credits: 6.0, date: "2022-05-30", theme: "physics" },
  { id: 'theo-elec', name: "Teoretisk elektroteknik", nameEn: "Theoretical Electrotechnics", credits: 9.0, date: "2023-01-09", theme: "physics" },
  { id: 'applied-modern', name: "Tillämpad modern fysik", nameEn: "Applied Modern Physics", credits: 5.0, date: "2023-01-10", theme: "physics" },
  { id: 'fluid-mech', name: "Strömningsmekanik", nameEn: "Fluid Mechanics", credits: 4.0, date: "2023-01-30", theme: "physics" },
  { id: 'anal-mech', name: "Analytisk mekanik och klassisk fältteori", nameEn: "Analytical Mechanics and Classical Field Theory", credits: 7.5, date: "2023-05-31", theme: "physics" },
  { id: 'stat-mech', name: "Statistisk mekanik", nameEn: "Statistical Mechanics", credits: 7.5, date: "2023-10-19", theme: "physics" },
  { id: 'adv-qm', name: "Kvantmekanik, fortsättningskurs", nameEn: "Advanced Quantum Mechanics", credits: 7.5, date: "2023-10-23", theme: "physics" },
  { id: 'gen-rel', name: "Allmän relativitetsteori", nameEn: "General Relativity", credits: 6.0, date: "2024-01-10", theme: "physics" },
  { id: 'spec-rel', name: "Speciell relativitetsteori", nameEn: "Special Relativity", credits: 6.0, date: "2024-01-15", theme: "physics" },
  { id: 'rel-qp', name: "Relativistisk kvantfysik", nameEn: "Relativistic Quantum Physics", credits: 7.5, date: "2024-03-13", theme: "physics" },
  { id: 'theo-particle', name: "Teoretisk partikelfysik", nameEn: "Theoretical Particle Physics", credits: 7.5, date: "2024-05-27", theme: "physics" },
  { id: 'qft', name: "Kvantfältteori", nameEn: "Quantum Field Theory", credits: 7.5, date: "2024-10-25", theme: "physics" },

  // ML/AI
  { id: 'ml-fundamentals', name: "Maskininlärningens grunder", nameEn: "Fundamentals of Machine Learning", credits: 7.5, date: "2023-04-26", theme: "ml-ai" },
  { id: 'dl-ds', name: "Djupinlärning i Data Science", nameEn: "Deep Learning in Data Science", credits: 7.5, date: "2024-06-03", theme: "ml-ai" },
  { id: 'ml-theory', name: "Maskininlärningsteori", nameEn: "Machine Learning Theory", credits: 7.5, date: "2024-06-07", theme: "ml-ai" },
  { id: 'rl', name: "Förstärkande inlärning", nameEn: "Reinforcement Learning", credits: 7.5, date: "2025-01-08", theme: "ml-ai" },
  { id: 'adv-dl', name: "Djupinlärning, fortsättningskurs", nameEn: "Advanced Deep Learning", credits: 6.0, date: "2025-01-20", theme: "ml-ai" },

  // Computing
  { id: 'intro-comp', name: "Datorintroduktion", nameEn: "Introduction to Computers", credits: 1.5, date: "2019-09-23", theme: "computing" },
  { id: 'prog-fund', name: "Grundläggande programmering", nameEn: "Fundamentals of Programming", credits: 5.0, date: "2019-10-18", theme: "computing" },
  { id: 'cs-fund', name: "Grundläggande datalogi", nameEn: "Fundamentals of Computer Science", credits: 6.0, date: "2021-06-07", theme: "computing" },
  { id: 'num-methods', name: "Numeriska metoder, grundkurs IV", nameEn: "Numerical Methods", credits: 6.0, date: "2021-06-10", theme: "computing" },
  { id: 'sim-model', name: "Simulering och modellering", nameEn: "Simulation and Modelling", credits: 6.0, date: "2023-01-30", theme: "computing" },
  { id: 'data-analysis', name: "Projektkurs i dataanalys", nameEn: "Data Analysis Project Course", credits: 7.5, date: "2025-01-02", theme: "computing" },

  // Control & Engineering
  { id: 'control', name: "Reglerteknik, allmän kurs", nameEn: "Control Theory", credits: 6.0, date: "2022-11-15", theme: "control" },
  { id: 'solid-mech', name: "Hållfasthetslära, grundkurs med energimetoder", nameEn: "Solid Mechanics", credits: 9.0, date: "2022-06-02", theme: "engineering" },

  // Research & Teaching
  { id: 'teaching-cs', name: "Handledning, undervisning och lärande i datalogiutbildning", nameEn: "Teaching in Computer Science Education", credits: 3.0, date: "2022-05-19", theme: "research" },
  { id: 'research-methods', name: "Research Methodology in Physics", nameEn: "Research Methodology in Physics", credits: 3.0, date: "2023-12-15", theme: "research" },
  { id: 'philosophy-sci', name: "Vetenskapsteori och vetenskaplig metodik (naturvetenskap)", nameEn: "Philosophy of Science and Scientific Methodology", credits: 4.5, date: "2024-10-23", theme: "research" },
  { id: 'sustainable-dev', name: "Hållbar utveckling inom teknisk fysik", nameEn: "Sustainable Development in Engineering Physics", credits: 1.5, date: "2024-11-15", theme: "other" },
  { id: 'bsc-thesis', name: "Examensarbete inom teknisk fysik, grundnivå", nameEn: "Bachelor's Thesis in Engineering Physics", credits: 15.0, date: "2023-06-07", theme: "research" },
];

// ============ MULTI-LAYER TREE: ROOTS (Foundations Only) ============
export const treeRoots: RootNode[] = [
  { id: 'math', type: 'root', name: 'Mathematical Foundations', description: 'Analysis, Linear Algebra, Probability, Differential Equations, Optimization', category: 'math' },
  { id: 'physics', type: 'root', name: 'Physics Foundations', description: 'Classical Mechanics, Thermodynamics, Electromagnetism, Quantum Mechanics, Field Theory', category: 'physics' },
  { id: 'ml-theory', type: 'root', name: 'ML Theory', description: 'Statistical Learning, Generalization, Optimization Theory', category: 'ml' },
  { id: 'deep-learning', type: 'root', name: 'Deep Learning', description: 'Neural Networks, Transformers, Attention, Backpropagation', category: 'ml' },
  { id: 'generative-models', type: 'root', name: 'Generative Modeling', description: 'Diffusion Models, Flow Matching, VAEs, Score Functions', category: 'ml' },
  { id: 'rl', type: 'root', name: 'Reinforcement Learning', description: 'Q-Learning, Policy Gradients, Control Theory', category: 'ml' },
  { id: 'scientific-computing', type: 'root', name: 'Scientific Computing', description: 'Numerical Methods, Simulation, Visualization, HPC', category: 'computing' },
  { id: 'leadership', type: 'root', name: 'Leadership & Impact', description: 'Team Management, Finance, Mentorship, Teaching', category: 'soft-skills' },
];

// ============ TRUNK: Identity ============
export const treeTrunk: TrunkNode = {
  id: 'trunk',
  type: 'trunk',
  name: 'Engineering Physics × AI/ML',
  description: 'Building intelligent systems from first principles — strong math/physics foundations powering cutting-edge ML research',
};

// ============ BRANCHES: Category Groupings ============
export const treeBranches: BranchNode[] = [
  { id: 'research-ai', type: 'branch', name: 'AI Research', description: 'Generative modeling, diffusion policies, neural architectures', rootIds: ['ml-theory', 'deep-learning', 'generative-models'] },
  { id: 'robotics', type: 'branch', name: 'Robotics & Control', description: 'Manipulation, sensor fusion, control theory', rootIds: ['rl', 'deep-learning', 'physics'] },
  { id: 'scientific', type: 'branch', name: 'Scientific Computing', description: 'Simulation, numerical methods, visualization', rootIds: ['scientific-computing', 'math', 'physics'] },
  { id: 'cosmology', type: 'branch', name: 'Cosmology & Instrumentation', description: 'CMB, satellite missions, metamaterials', rootIds: ['physics', 'scientific-computing'] },
  { id: 'teaching-impact', type: 'branch', name: 'Teaching & Social Impact', description: 'Education, mentorship, nonprofit leadership', rootIds: ['leadership'] },
];

// ============ LEAVES: Evidence Only (Projects, Experiences, Publications) ============
export const treeLeaves: LeafNode[] = [
  // AI Research branch - projects
  { id: 'leaf-dflow', type: 'leaf', name: 'D-Flow Framework', summary: 'Reduced sampling time 10x for diffusion/flow models', branchId: 'research-ai', evidenceType: 'project', evidenceId: 'dflow', isFruit: true },
  { id: 'leaf-ddpm', type: 'leaf', name: 'DDPM from Scratch', summary: 'Transformer diffusion model with attention', branchId: 'research-ai', evidenceType: 'project', evidenceId: 'ddpm' },
  { id: 'leaf-kan', type: 'leaf', name: 'KAN Channel Estimation', summary: 'CPU-efficient denoising outperforming MLPs', branchId: 'research-ai', evidenceType: 'project', evidenceId: 'kan' },
  
  // Robotics branch
  { id: 'leaf-thesis', type: 'leaf', name: 'Robotics Thesis', summary: 'Tactile + vision diffusion policies for manipulation', branchId: 'robotics', evidenceType: 'experience', evidenceId: 'thesis-internship', isFruit: true },
  { id: 'leaf-dqn', type: 'leaf', name: 'DQN Lunar Lander', summary: 'Stable autonomous landing with dueling DQN', branchId: 'robotics', evidenceType: 'project', evidenceId: 'dqn' },
  
  // Scientific Computing branch
  { id: 'leaf-raytracer', type: 'leaf', name: 'Ray Tracer', summary: '3D rendering with smooth shadows', branchId: 'scientific', evidenceType: 'project', evidenceId: 'raytracer' },
  { id: 'leaf-metamaterial', type: 'leaf', name: 'Metamaterial Generator', summary: 'STL export for 3D printing absorbers', branchId: 'scientific', evidenceType: 'project', evidenceId: 'metamaterial' },
  
  // Cosmology branch
  { id: 'leaf-litebird', type: 'leaf', name: 'LiteBIRD CMB Absorbers', summary: 'Microwave absorbers for JAXA satellite mission', branchId: 'cosmology', evidenceType: 'experience', evidenceId: 'okc-internship', isFruit: true },
  { id: 'leaf-spie', type: 'leaf', name: 'SPIE Publication', summary: 'mm-Wave absorber reflectance measurements', branchId: 'cosmology', evidenceType: 'publication', evidenceId: 'spie-2024' },
  { id: 'leaf-milkyway', type: 'leaf', name: 'Milky Way Analysis', summary: 'Hydrogen-line regression for galaxy structure', branchId: 'cosmology', evidenceType: 'experience', evidenceId: 'su-internship' },
  
  // Teaching & Impact branch
  { id: 'leaf-mattecentrum', type: 'leaf', name: 'Mattecentrum Leadership', summary: '30 classrooms, 180k SEK budget, 4.9M users', branchId: 'teaching-impact', evidenceType: 'experience', evidenceId: 'mattecentrum-finance', isFruit: true },
  { id: 'leaf-ta', type: 'leaf', name: 'KTH Teaching Assistant', summary: 'Python, algorithms, scientific computing', branchId: 'teaching-impact', evidenceType: 'experience', evidenceId: 'ta-kth' },
];

// ============ TREE EDGES ============
export const treeEdges: TreeEdge[] = [
  // Roots → Trunk (all roots feed into trunk)
  ...treeRoots.map(root => ({ id: `edge-${root.id}-trunk`, source: root.id, target: 'trunk', type: 'feeds' as EdgeType })),
  
  // Trunk → Branches
  ...treeBranches.map(branch => ({ id: `edge-trunk-${branch.id}`, source: 'trunk', target: branch.id, type: 'feeds' as EdgeType })),
  
  // Branches → Leaves
  ...treeLeaves.map(leaf => ({ id: `edge-${leaf.branchId}-${leaf.id}`, source: leaf.branchId, target: leaf.id, type: 'produces' as EdgeType })),
];

// ============ HELPER FUNCTIONS ============

export function getLeavesByBranch(branchId: string): LeafNode[] {
  return treeLeaves.filter(leaf => leaf.branchId === branchId);
}

export function getBranchesByRoot(rootId: string): BranchNode[] {
  return treeBranches.filter(branch => branch.rootIds.includes(rootId));
}

export function getRootsForBranch(branchId: string): RootNode[] {
  const branch = treeBranches.find(b => b.id === branchId);
  if (!branch) return [];
  return treeRoots.filter(root => branch.rootIds.includes(root.id));
}

export function getFruitLeaves(): LeafNode[] {
  return treeLeaves.filter(leaf => leaf.isFruit);
}

export function getProjectById(projectId: string): Project | undefined {
  return projects.find(p => p.id === projectId);
}

export function getExperienceById(expId: string): Experience | undefined {
  return [...experiences, ...volunteerExperiences].find(e => e.id === expId);
}

export function getPublicationById(pubId: string): Publication | undefined {
  return publications.find(p => p.id === pubId);
}

export function getLeafEvidence(leaf: LeafNode) {
  switch (leaf.evidenceType) {
    case 'project': return getProjectById(leaf.evidenceId);
    case 'experience': return getExperienceById(leaf.evidenceId);
    case 'publication': return getPublicationById(leaf.evidenceId);
  }
}

export function getCoursesByTheme(theme: CourseTheme): Course[] {
  return courses.filter(c => c.theme === theme);
}

export function getCourseStats() {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const byTheme = courses.reduce((acc, c) => {
    acc[c.theme] = (acc[c.theme] || 0) + c.credits;
    return acc;
  }, {} as Record<CourseTheme, number>);
  
  return { totalCredits, byTheme };
}

// Course theme display names
export const courseThemeNames: Record<CourseTheme, string> = {
  'mathematics': 'Mathematics',
  'physics': 'Physics',
  'ml-ai': 'Machine Learning & AI',
  'computing': 'Computing',
  'control': 'Control Systems',
  'engineering': 'Engineering',
  'research': 'Research Methods',
  'other': 'Other',
};

// ============ BACKWARD COMPATIBILITY (deprecated, use tree* exports) ============
export const skillRoots = treeRoots.map(r => ({
  id: r.id,
  name: r.name,
  description: r.description,
  color: r.category === 'math' || r.category === 'physics' ? 'primary' : 
         r.category === 'ml' ? 'secondary' : 'tertiary' as const,
}));

export const skillLeaves = treeLeaves.map(l => ({
  id: l.id,
  name: l.name,
  rootIds: getRootsForBranch(l.branchId).map(r => r.id),
  evidence: l.summary,
  type: l.evidenceType === 'publication' ? 'project' : l.evidenceType as 'project' | 'experience',
  link: undefined,
}));

export function getLeavesByRoot(rootId: string) {
  const branches = getBranchesByRoot(rootId);
  return treeLeaves.filter(leaf => branches.some(b => b.id === leaf.branchId));
}

export function getRootsByLeaf(leafId: string) {
  const leaf = treeLeaves.find(l => l.id === leafId);
  if (!leaf) return [];
  return getRootsForBranch(leaf.branchId);
}
