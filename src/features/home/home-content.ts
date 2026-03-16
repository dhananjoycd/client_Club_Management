import { BriefcaseBusiness, Code2, Lightbulb, Network, Rocket, Trophy, Users2, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type HomeContentItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export type HomeCommitteeItem = {
  name: string;
  role: string;
  department: string;
  bio?: string;
  photoUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  whatsapp?: string;
  email?: string;
};

export type HomeTestimonialItem = {
  quote: string;
  author: string;
  meta: string;
};

export const announcementItems = [
  "Registration for the next member intake is open",
  "Weekly coding sessions run every Friday afternoon",
  "Featured events update automatically from the backend",
];

export const activityItems: HomeContentItem[] = [
  {
    title: "Coding Workshops",
    description: "Hands-on sessions that help students move from theory into real implementation with guided practice.",
    icon: Code2,
  },
  {
    title: "Hackathons",
    description: "Competitive and collaborative build days where members solve problems and ship working prototypes.",
    icon: Rocket,
  },
  {
    title: "Team Projects",
    description: "Small group product work that strengthens teamwork, planning, review discipline, and delivery skills.",
    icon: Wrench,
  },
  {
    title: "Tech Talks",
    description: "Focused talks from club leaders, alumni, and professionals on tools, careers, and industry direction.",
    icon: Lightbulb,
  },
  {
    title: "Career Support",
    description: "CV reviews, portfolio advice, interview preparation, and practical direction for early career growth.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Competitions",
    description: "Structured preparation for programming contests, innovation challenges, and inter-university tech events.",
    icon: Trophy,
  },
];

export const benefitItems: HomeContentItem[] = [
  {
    title: "Learn Practical Skills",
    description: "Members work through real tools, structured practice, and guided sessions that build technical confidence.",
    icon: Code2,
  },
  {
    title: "Build Real Projects",
    description: "The club encourages visible output, not just attendance, so members leave with work they can demonstrate.",
    icon: Wrench,
  },
  {
    title: "Grow Your Network",
    description: "Students connect with peers, mentors, seniors, and collaborators across multiple academic years.",
    icon: Network,
  },
  {
    title: "Develop Leadership",
    description: "Organizing sessions, coordinating teams, and leading initiatives helps members grow beyond technical skills.",
    icon: Users2,
  },
];

export const committeePreview: HomeCommitteeItem[] = [
  { name: "Ayesha Rahman", role: "President", department: "Computer Science & Engineering", bio: "Leads club planning, partnerships, and the execution of major student activities.", email: "ayesha@xyztechclub.org", linkedinUrl: "https://linkedin.com", facebookUrl: "https://facebook.com", whatsapp: "+8801711000001" },
  { name: "Nafis Ahmed", role: "Vice President", department: "Information Technology", bio: "Supports operations, coordination, and continuity across committees and event cycles.", email: "nafis@xyztechclub.org", linkedinUrl: "https://linkedin.com", facebookUrl: "https://facebook.com", whatsapp: "+8801711000002" },
  { name: "Mahin Chowdhury", role: "General Secretary", department: "Software Engineering", bio: "Handles internal communication, records, and workflow alignment for the club team.", email: "mahin@xyztechclub.org", linkedinUrl: "https://linkedin.com", facebookUrl: "https://facebook.com", whatsapp: "+8801711000003" },
  { name: "Tasnim Islam", role: "Technical Secretary", department: "Computer Science & Engineering", bio: "Supports technical sessions, workshop structure, and hands-on learning initiatives.", email: "tasnim@xyztechclub.org", linkedinUrl: "https://linkedin.com", facebookUrl: "https://facebook.com", whatsapp: "+8801711000004" },
];

export const testimonialItems: HomeTestimonialItem[] = [
  {
    quote: "The club gave me my first serious project experience and the confidence to present my work publicly.",
    author: "Farhan Hossain",
    meta: "Member, Web Team",
  },
  {
    quote: "Workshops here felt practical from day one. I learned faster because the sessions were built around doing, not just listening.",
    author: "Nusrat Jahan",
    meta: "Bootcamp Participant",
  },
  {
    quote: "Our committee culture pushes students to be organized, accountable, and collaborative. That matters a lot beyond campus.",
    author: "Sadia Karim",
    meta: "Alumni Mentor",
  },
];

export const faqItems: HomeFaqItem[] = [
  {
    question: "Who can join the club?",
    answer: "Any interested student can apply, especially those who want to learn, build, and contribute to technical activities.",
  },
  {
    question: "Do I need prior coding experience?",
    answer: "No. Beginners can start through workshops and guided sessions, while advanced members can join projects and event teams.",
  },
  {
    question: "How often are events arranged?",
    answer: "The club typically runs recurring sessions, workshops, and special events throughout the semester based on the calendar.",
  },
  {
    question: "Can first-year students apply?",
    answer: "Yes. Early participation is encouraged because it helps students build skill and network from the beginning of university life.",
  },
];
