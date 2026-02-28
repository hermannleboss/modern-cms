<?php

declare(strict_types=1);

namespace App\DTO;

class UpdateCategoryDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $slug = null,
        public readonly ?string $description = null,
        public readonly ?string $parentId = null,
    ) {
    }
}
