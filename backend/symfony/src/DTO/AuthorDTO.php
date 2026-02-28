<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\User;

readonly class AuthorDTO
{
    public function __construct(
        public string $id,
        public string $email,
        public string $firstName,
        public string $lastName,
    ) {
    }

    public static function fromEntity(User $user): self
    {
        return new self(
            id: $user->getId()->toRfc4122(),
            email: $user->getEmail() ?? '',
            firstName: $user->getFirstName() ?? '',
            lastName: $user->getLastName() ?? '',
        );
    }
}
