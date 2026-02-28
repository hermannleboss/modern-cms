import crypto from 'crypto';
import prisma from '../../utils/prisma';
import { comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { getEffectivePermissions } from '../../permissions/can';
import { AppError } from '../../middlewares/error.middleware';
import { LoginDto } from './auth.dto';

export class AuthService {
  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await comparePassword(dto.password, user.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokenId = crypto.randomUUID();
    const accessToken = signAccessToken({ userId: user.id, email: user.email });

    // Calculate refresh expiration
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    const refreshToken = signRefreshToken({ userId: user.id, tokenId });

    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    const permissions = await getEffectivePermissions(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        permissions,
      },
    };
  }

  async refresh(refreshTokenStr: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: { include: { role: true } } },
    });

    if (!storedToken || storedToken.token !== refreshTokenStr) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expired', 401);
    }

    if (!storedToken.user.isActive) {
      throw new AppError('User is inactive', 401);
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newTokenId = crypto.randomUUID();
    const accessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    const newRefreshToken = signRefreshToken({
      userId: storedToken.user.id,
      tokenId: newTokenId,
    });

    await prisma.refreshToken.create({
      data: {
        id: newTokenId,
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    const permissions = await getEffectivePermissions(storedToken.user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        firstName: storedToken.user.firstName,
        lastName: storedToken.user.lastName,
        role: storedToken.user.role.name,
        permissions,
      },
    };
  }

  async logout(refreshTokenStr: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenStr },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const permissions = await getEffectivePermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
