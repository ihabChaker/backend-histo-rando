import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const PromoteToAdminSchema = z.object({
  email: z.string().email(),
  secretKey: z.string().min(10),
});

export class PromoteToAdminDto extends createZodDto(PromoteToAdminSchema) {}
