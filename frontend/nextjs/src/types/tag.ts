export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDTO {
  name: string;
}

export interface UpdateTagDTO {
  name: string;
}
