import { type ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { trackGuard } from '../lifecycle/track-guard.js';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  override canActivate(context: ExecutionContext): Promise<boolean> {
    return trackGuard(context, () => super.canActivate(context));
  }
}
