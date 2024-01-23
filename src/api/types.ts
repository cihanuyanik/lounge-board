import { Timestamp } from "firebase/firestore";
import { User as AuthUser } from "firebase/auth";
export type New = {
  id: string;
  text: string;
  createdAt: Timestamp;
  isSelected: boolean;
};

export type Event = {
  id: string;
  text: string;
  startsAt: Timestamp;
  endsAt?: Timestamp | null;
  isSelected: boolean;
  createdAt: Timestamp;
};

export type ResearchGroup = {
  id: string;
  name: string;
  image: string;
  bannerImage: string;
  createdAt: Timestamp;
};

export type Member = {
  id: string;
  name: string;
  role: string;
  image: string;
  createdAt: Timestamp;
  isSelected: boolean;
};

export type Meta = {
  id: string;
  createdAt: Timestamp;
  membersDisplayOrder: string[];
};

export type User = AuthUser;
