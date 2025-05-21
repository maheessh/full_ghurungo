//This type uses a generic (<T>).  For more information on generics see: https://www.typescriptlang.org/docs/handbook/2/generics.html

import { ReactNode } from "react";

//You probably wont need this for the scope of this class :)
export type ApiResponse<T> = {
  data: T;
  errors: ApiError[];
  hasErrors: boolean;
};

export type ApiError = {
  property: string;
  message: string;
};

export type AnyObject = {
  [index: string]: any;
};

export type UserDto = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
};

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface EventGetDto {
  endDate: string | number | Date;
  imageUrl: string;
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organization_id: number;
  created_by: number;
  created_at: string;
}

export interface EventParticipant {
  id: number;
  user_id: number;
  name: string; 
  event_id: number;
  status: string; // 'interested', 'attending', 'not_attending'
  created_at: string;
}

// Get DTO for organizations
export interface OrganizationGetDto {
  logoUrl: string;
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  members?: MemberGetDto[]; 
}

// Create/Update DTO for organizations
export interface OrganizationCreateUpdateDto {
  name: string;
  description: string;
  createdBy: string; // User or user identifier who created the organization
  createdAt: Date | string; // Initial date or formatted date string
}

// Member DTO for organization members
export interface MemberGetDto {
  organizationId: number;
  name: ReactNode;
  id: number;
  userId: number;
  joinedAt: string;
  role: string; 
}

export interface MemberCreateDto {
  userId: number;
  organizationId: number;
  name: string;
  role: string; // Role of the member in the organization, e.g., 'admin', 'member'
  joinedAt: Date; // Use Date type for better date handling
  createdAt: Date; // Add createdAt property
}

// Get DTO for reviews
export interface ReviewGetDto {
  id: number;
  eventId: number;
  comments: string; 
  rating: number; 
  userId: number; 
  createdAt: string; 
}

// Create/Update DTO for reviews
export interface ReviewCreateUpdateDto {
  eventId: number;
  comments: string; // Matches 'Comments' in the backend but in camelCase for TypeScript convention
  rating: number;
  userId?: number; // Optional if the user ID is set server-side
}

export interface ChatMessageGetDto {
  Id: number;
  Message: string;
  userId: number; // Identifier of the user who sent the message
  chatRoomId: number; // Identifier of the chat room the message belongs to
  createdBy: string; // Username or identifier of the creator
  createdAt: string; // Date the message was created
}

// Create/Update DTO for ChatMessage
export interface ChatMessageCreateUpdateDto {
  message: string;
  userId: number; // Identifier of the user who sends the message
  chatRoomId: number; // Identifier of the chat room
  createdBy: string; // Username or identifier of the creator
}



export interface EventParticipantGetDto {
  id: number;
  userId: number;
  name: string; 
  eventId: number;
  status: string;
  createdAt: string;
}

export interface EventParticipantCreateDto {
  userId: number;
  name: string; 
  eventId: number;
  status: string;
}

export interface ChatMessageGetDto {
  id: number;
  message: string;
  userId: number; // ID of the user who sent the message
  chatRoomId: number; // ID of the chat room the message belongs to
  createdAt: string; // Timestamp of when the message was created
}

export interface ChatMessageCreateDto {
  message: string;
  userId: number; // ID of the user sending the message
  chatRoomId: number;
  createdBy: string; // ID of the chat room where the message is sent
}

export interface ChatRoomGetDto {
  id: number; // Unique identifier for the chat room
  name: string; // Name of the chat room
  eventId: number; // ID of the associated event
  createdAt: string; // Timestamp of when the chat room was created
}

