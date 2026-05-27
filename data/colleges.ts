export type College = {
  id: number;
  name: string;
  city: string;
  stream: "Engineering" | "Medical" | "Law" | "Commerce";
  placement: number; // avg LPA
  nirf: number;
  fees: number; // annual in INR
  type: "Government" | "Private";
};

export const colleges: College[] = [
  // Engineering — Government
  {
    id: 1,
    name: "IIT Delhi",
    city: "New Delhi",
    stream: "Engineering",
    placement: 32,
    nirf: 2,
    fees: 240000,
    type: "Government",
  },
  {
    id: 2,
    name: "IIT Bombay",
    city: "Mumbai",
    stream: "Engineering",
    placement: 35,
    nirf: 3,
    fees: 250000,
    type: "Government",
  },
  {
    id: 3,
    name: "IIT Madras",
    city: "Chennai",
    stream: "Engineering",
    placement: 30,
    nirf: 1,
    fees: 240000,
    type: "Government",
  },
  {
    id: 4,
    name: "NIT Trichy",
    city: "Tiruchirappalli",
    stream: "Engineering",
    placement: 22,
    nirf: 9,
    fees: 180000,
    type: "Government",
  },
  {
    id: 5,
    name: "NIT Warangal",
    city: "Warangal",
    stream: "Engineering",
    placement: 20,
    nirf: 26,
    fees: 170000,
    type: "Government",
  },
  {
    id: 6,
    name: "IIIT Hyderabad",
    city: "Hyderabad",
    stream: "Engineering",
    placement: 26,
    nirf: 30,
    fees: 300000,
    type: "Government",
  },

  // Engineering — Private
  {
    id: 7,
    name: "BITS Pilani",
    city: "Pilani",
    stream: "Engineering",
    placement: 28,
    nirf: 25,
    fees: 520000,
    type: "Private",
  },
  {
    id: 8,
    name: "VIT Vellore",
    city: "Vellore",
    stream: "Engineering",
    placement: 14,
    nirf: 11,
    fees: 350000,
    type: "Private",
  },
  {
    id: 9,
    name: "Manipal Institute of Technology",
    city: "Manipal",
    stream: "Engineering",
    placement: 12,
    nirf: 52,
    fees: 420000,
    type: "Private",
  },
  {
    id: 10,
    name: "SRM Institute of Science and Technology",
    city: "Chennai",
    stream: "Engineering",
    placement: 10,
    nirf: 41,
    fees: 380000,
    type: "Private",
  },

  // Medical — Government
  {
    id: 11,
    name: "AIIMS Delhi",
    city: "New Delhi",
    stream: "Medical",
    placement: 18,
    nirf: 1,
    fees: 6000,
    type: "Government",
  },
  {
    id: 12,
    name: "AIIMS Jodhpur",
    city: "Jodhpur",
    stream: "Medical",
    placement: 15,
    nirf: 17,
    fees: 6000,
    type: "Government",
  },
  {
    id: 13,
    name: "Maulana Azad Medical College",
    city: "New Delhi",
    stream: "Medical",
    placement: 14,
    nirf: 6,
    fees: 15000,
    type: "Government",
  },
  {
    id: 14,
    name: "Grant Medical College",
    city: "Mumbai",
    stream: "Medical",
    placement: 13,
    nirf: 22,
    fees: 55000,
    type: "Government",
  },

  // Medical — Private
  {
    id: 15,
    name: "Kasturba Medical College",
    city: "Manipal",
    stream: "Medical",
    placement: 14,
    nirf: 12,
    fees: 1600000,
    type: "Private",
  },
  {
    id: 16,
    name: "Amrita School of Medicine",
    city: "Coimbatore",
    stream: "Medical",
    placement: 13,
    nirf: 8,
    fees: 1200000,
    type: "Private",
  },

  // Law
  {
    id: 17,
    name: "NLU Delhi",
    city: "New Delhi",
    stream: "Law",
    placement: 16,
    nirf: 2,
    fees: 190000,
    type: "Government",
  },
  {
    id: 18,
    name: "NALSAR University of Law",
    city: "Hyderabad",
    stream: "Law",
    placement: 14,
    nirf: 3,
    fees: 210000,
    type: "Government",
  },
  {
    id: 19,
    name: "NLSIU Bangalore",
    city: "Bengaluru",
    stream: "Law",
    placement: 17,
    nirf: 1,
    fees: 220000,
    type: "Government",
  },

  // Commerce
  {
    id: 20,
    name: "Shri Ram College of Commerce",
    city: "New Delhi",
    stream: "Commerce",
    placement: 12,
    nirf: 3,
    fees: 28000,
    type: "Government",
  },
  {
    id: 21,
    name: "Christ University",
    city: "Bengaluru",
    stream: "Commerce",
    placement: 8,
    nirf: 22,
    fees: 150000,
    type: "Private",
  },
  {
    id: 22,
    name: "Loyola College",
    city: "Chennai",
    stream: "Commerce",
    placement: 7,
    nirf: 35,
    fees: 45000,
    type: "Private",
  },
];
// Add this helper to the bottom of data/colleges.ts
export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}