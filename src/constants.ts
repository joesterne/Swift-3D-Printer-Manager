import { Model, PrinterProfile, PrintLog } from './types';

export const MOCK_MODELS: Model[] = [
  { 
    id: 1, 
    name: "Articulated Dragon", 
    author: "McGgyver", 
    source: "Printables", 
    downloads: "125k", 
    likes: "45k", 
    image: "https://picsum.photos/seed/dragon/800/600",
    images: [
      "https://picsum.photos/seed/dragon/800/600",
      "https://picsum.photos/seed/dragon1/800/600",
      "https://picsum.photos/seed/dragon2/800/600"
    ],
    description: "A fully articulated dragon that prints in one piece without supports. This model is a masterpiece of print-in-place engineering, featuring over 40 moving joints. Perfect for testing your printer's bed adhesion and tolerances.",
    comments: [
      { user: "PrintMaster", text: "Amazing model! Printed perfectly on my X1-C.", date: "2 days ago" },
      { user: "MakerGirl", text: "The joints are so smooth. I used dual-color silk PLA.", date: "1 week ago" }
    ],
    url: "https://www.printables.com/model/123456-articulated-dragon"
  },
  { 
    id: 2, 
    name: "3DBenchy", 
    author: "CreativeTools", 
    source: "Thingiverse", 
    downloads: "2.5M", 
    likes: "150k", 
    image: "https://picsum.photos/seed/benchy/800/600",
    images: [
      "https://picsum.photos/seed/benchy/800/600",
      "https://picsum.photos/seed/benchy1/800/600",
      "https://picsum.photos/seed/benchy2/800/600"
    ],
    description: "The jolly 3D printing torture-test by Creative Tools. It is designed to test and benchmark 3D printers by focusing on specific difficult-to-print features.",
    comments: [
      { user: "BenchyFan", text: "Classic. Every printer needs one.", date: "3 days ago" },
      { user: "NewbieMaker", text: "My first print! Came out great.", date: "5 days ago" }
    ],
    url: "https://www.thingiverse.com/thing:763622"
  },
  { 
    id: 3, 
    name: "Tool-less Cable Clip", 
    author: "Sneaks", 
    source: "Printables", 
    downloads: "12k", 
    likes: "2.1k", 
    image: "https://picsum.photos/seed/clip/800/600",
    images: [
      "https://picsum.photos/seed/clip/800/600",
      "https://picsum.photos/seed/clip1/800/600"
    ],
    description: "A simple, effective cable clip that requires no tools for installation. Great for cable management behind desks.",
    comments: [
      { user: "OrganizedLife", text: "Finally, my cables are tidy.", date: "1 day ago" }
    ],
    url: "https://www.printables.com/model/234567-tool-less-cable-clip"
  },
  { 
    id: 4, 
    name: "Modular Drawer System", 
    author: "Ondřej Stříteský", 
    source: "Printables", 
    downloads: "85k", 
    likes: "12k", 
    image: "https://picsum.photos/seed/drawer/800/600",
    images: [
      "https://picsum.photos/seed/drawer/800/600",
      "https://picsum.photos/seed/drawer1/800/600",
      "https://picsum.photos/seed/drawer2/800/600"
    ],
    description: "A modular drawer system that can be expanded as needed. Perfect for organizing small parts, screws, and electronics.",
    comments: [
      { user: "WorkshopKing", text: "Built a whole wall of these. Love the modularity.", date: "4 days ago" }
    ],
    url: "https://www.printables.com/model/345678-modular-drawer-system"
  },
  { 
    id: 5, 
    name: "Low Poly Fox", 
    author: "Manaberry", 
    source: "Thingiverse", 
    downloads: "450k", 
    likes: "22k", 
    image: "https://picsum.photos/seed/fox/800/600",
    images: ["https://picsum.photos/seed/fox/800/600"],
    description: "A beautiful low poly fox model. Prints great without supports and looks amazing in any color.",
    comments: [],
    url: "https://www.thingiverse.com/thing:456789"
  },
  { 
    id: 6, 
    name: "Parametric Rugged Box", 
    author: "Whity", 
    source: "Printables", 
    downloads: "310k", 
    likes: "68k", 
    image: "https://picsum.photos/seed/box/800/600",
    images: ["https://picsum.photos/seed/box/800/600"],
    description: "A very popular rugged box that can be customized to any size. Features a seal for water resistance.",
    comments: [],
    url: "https://www.printables.com/model/567890-parametric-rugged-box"
  },
];

export const MOCK_LOGS: PrintLog[] = [
  { id: 1, name: "Articulated Dragon", date: "2024-04-12", time: "12h 45m", filament: "245g", cost: "$4.50", status: "Success" },
  { id: 2, name: "Benchy", date: "2024-04-11", time: "1h 30m", filament: "12g", cost: "$0.25", status: "Success" },
  { id: 3, name: "Tool Holder", date: "2024-04-10", time: "4h 20m", filament: "85g", cost: "$1.60", status: "Failed" },
  { id: 4, name: "Phone Stand", date: "2024-04-09", time: "2h 15m", filament: "35g", cost: "$0.70", status: "Success" },
  { id: 5, name: "Cable Clip x10", date: "2024-04-08", time: "3h 00m", filament: "50g", cost: "$1.00", status: "Success" },
];

export const DEFAULT_PROFILES: PrinterProfile[] = [
  { id: '1', name: 'Bambu X1C - Standard', nozzleSize: 0.4, bedTemp: 55, fanSpeed: 100 },
  { id: '2', name: 'Bambu P1P - Detail', nozzleSize: 0.2, bedTemp: 60, fanSpeed: 80 },
];
