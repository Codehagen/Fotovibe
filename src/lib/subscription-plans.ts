export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
  description?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyMonthlyPrice: number;
  currency: string;
  photosPerMonth: number;
  videosPerMonth: number;
  maxLocations: number;
  features: PlanFeature[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 10000,
    yearlyMonthlyPrice: 8333,
    currency: "NOK",
    photosPerMonth: 50,
    videosPerMonth: 5,
    maxLocations: 1,
    features: [
      { name: "Professional Photographers", included: true },
      { name: "Professional Photo Editing", included: true },
      { name: "24/7 Support", included: true },
      { name: "Multiple Locations", included: false },
      { name: "Priority Booking", included: false },
      { name: "Custom Branding", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 15000,
    yearlyMonthlyPrice: 12500,
    currency: "NOK",
    photosPerMonth: 100,
    videosPerMonth: 10,
    maxLocations: 3,
    features: [
      { name: "Professional Photographers", included: true },
      { name: "Professional Photo Editing", included: true },
      { name: "24/7 Support", included: true },
      { name: "Multiple Locations", included: true },
      { name: "Priority Booking", included: true },
      { name: "Custom Branding", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 20000,
    yearlyMonthlyPrice: 16667,
    currency: "NOK",
    photosPerMonth: 200,
    videosPerMonth: 20,
    maxLocations: 10,
    features: [
      { name: "Professional Photographers", included: true },
      { name: "Professional Photo Editing", included: true },
      { name: "24/7 Support", included: true },
      { name: "Multiple Locations", included: true },
      { name: "Priority Booking", included: true },
      { name: "Custom Branding", included: true },
    ],
  },
];

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function getMonthlyPrice(planId: string, isYearly: boolean): number {
  const plan = getPlanById(planId);
  if (!plan) return 0;
  return isYearly ? plan.yearlyMonthlyPrice : plan.monthlyPrice;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
