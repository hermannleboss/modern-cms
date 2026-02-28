<?php

declare(strict_types=1);

namespace App\DTO;

class UpdateTagDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly ?string $slug = null,
    ) {
    }
}
