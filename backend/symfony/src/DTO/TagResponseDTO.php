<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Tag;

readonly class TagResponseDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public string $slug,
        public string $createdAt,
    ) {
    }

    public static function fromEntity(Tag $tag): self
    {
        return new self(
            id: $tag->getId()->toRfc4122(),
            name: $tag->getName() ?? '',
            slug: $tag->getSlug() ?? '',
            createdAt: $tag->getCreatedAt()->format(\DateTimeInterface::ATOM),
        );
    }
}
