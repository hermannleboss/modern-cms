import { IsString, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;
}
