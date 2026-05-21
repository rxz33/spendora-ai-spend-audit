import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { pricingData } from "@/data/pricing"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlanPrice(toolName: string, planName: string): number | null {
  const tool = pricingData.find(t => t.tool.toLowerCase() === toolName.toLowerCase());
  const plan = tool?.plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
  return plan ? plan.monthlyPrice : null;
}
