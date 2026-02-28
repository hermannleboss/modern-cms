<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateCategoryDTO
{
    public function __construct(
        #[Assert\NotBlank]
        public readonly ?string $name = null,

        #[Assert\NotBlank]
        public readonly ?string $slug = null,

        public readonly ?string $description = null,

        public readonly ?string $parentId = null,
    ) {
    }
}
