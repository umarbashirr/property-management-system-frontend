export type ProfileType = "individual" | "corporate" | "travel_agent";
export type IdType =
  | "passport"
  | "aadhaar"
  | "driving_license"
  | "voter_id"
  | "pan_card"
  | "other";
export type ProfileSource =
  | "walk_in"
  | "direct"
  | "ota"
  | "corporate"
  | "travel_agent"
  | "referral";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export interface ProfileAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Profile {
  id: string;
  tenantId: string;
  propertyId: string | null;
  type: ProfileType;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  alternatePhone: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  nationality: string | null;
  idType: IdType | null;
  idNumber: string | null;
  address: ProfileAddress | null;
  isVip: boolean;
  isBlacklisted: boolean;
  blacklistReason: string | null;
  source: ProfileSource;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProfileDto {
  type?: ProfileType;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  nationality?: string;
  idType?: IdType;
  idNumber?: string;
  address?: ProfileAddress;
  source?: ProfileSource;
  notes?: string;
  propertyId?: string;
}

export interface UpdateProfileDto {
  type?: ProfileType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  nationality?: string;
  idType?: IdType;
  idNumber?: string;
  address?: ProfileAddress;
  source?: ProfileSource;
  notes?: string;
}

export interface SetBlacklistDto {
  isBlacklisted: boolean;
  blacklistReason?: string;
}

export interface SetVipDto {
  isVip: boolean;
}

export interface ListProfilesQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProfileType;
  isVip?: boolean;
  isBlacklisted?: boolean;
  source?: ProfileSource;
  propertyId?: string;
}

export interface CreateProfileResult {
  profile: Profile;
  isDuplicate: boolean;
}
