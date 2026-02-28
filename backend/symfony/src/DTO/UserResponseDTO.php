<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\User;

readonly class UserResponseDTO
{
    /**
     * @param array<string> $roles
     * @param array<string> $permissions
     * @param array<string> $effectivePermissions
     */
    public function __construct(
        public string $id,
        public string $email,
        public string $firstName,
        public string $lastName,
        public array $roles,
        public array $permissions,
        public array $effectivePermissions,
        public string $createdAt,
        public string $updatedAt,
    ) {
    }

    public static function fromEntity(User $user): self
    {
        return new self(
            id: $user->getId()->toRfc4122(),
            email: $user->getEmail() ?? '',
            firstName: $user->getFirstName() ?? '',
            lastName: $user->getLastName() ?? '',
            roles: $user->getRoles(),
            permissions: $user->getPermissions(),
            effectivePermissions: $user->getEffectivePermissions(),
            createdAt: $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            updatedAt: $user->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        );
    }
}
