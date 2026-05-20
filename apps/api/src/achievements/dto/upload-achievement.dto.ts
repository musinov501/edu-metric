import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { AchievementType } from '@prisma/client';

export class UploadAchievementDto {
  @ApiProperty({ enum: AchievementType })
  @IsEnum(AchievementType)
  type!: AchievementType;

  @ApiProperty({ example: 'PDP Online Certificate' })
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  /** Cloudinary URL or other persistent file URL. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_tld: false })
  fileUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_tld: false })
  externalLink?: string;

  /** Hash of the uploaded file — used by duplicate detection. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileHash?: string;

  /**
   * One of ACTIVITY_POINTS keys, e.g. PDP_ONLINE_CERTIFICATE.
   * Optional — admin can edit on approval. We use it as a hint and
   * the canonical points lookup is server-side.
   */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pointsKey?: string;
}
