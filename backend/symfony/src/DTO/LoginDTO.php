<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class LoginDTO
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        public readonly ?string $email = null,

        #[Assert\NotBlank]
        public readonly ?string $password = null,
    ) {
    }
}
