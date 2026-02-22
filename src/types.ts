export interface PitchDeckData {
  title: string;
  description: string;
  targetMarket: string;
  revenueModel: string;
}

export interface User {
  name: string;
  email: string;
  role: "founder" | "investor";
}
