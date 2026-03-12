export interface Plan {
  id: string;
  name: string;
  displayName: string;
  maxProperties: number;
  maxRoomsPerProperty: number;
  maxUsers: number;
  maxWorkflows: number;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  name: string;
  displayName: string;
  maxProperties: number;
  maxRoomsPerProperty: number;
  maxUsers: number;
  maxWorkflows: number;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
}

export interface UpdatePlanDto {
  name?: string;
  displayName?: string;
  maxProperties?: number;
  maxRoomsPerProperty?: number;
  maxUsers?: number;
  maxWorkflows?: number;
  features?: string[];
  priceMonthly?: number;
  priceYearly?: number;
  isActive?: boolean;
}

export interface ListPlansQuery {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}
