<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Category;

readonly class CategoryResponseDTO
{
    /**
     * @param array<CategoryResponseDTO> $children
     */
    public function __construct(
        public string $id,
        public string $name,
        public string $slug,
        public ?string $description,
        public ?string $parentId,
        public array $children,
        public string $createdAt,
        public string $updatedAt,
    ) {
    }

    public static function fromEntity(Category $category, bool $includeChildren = true): self
    {
        $children = [];
        if ($includeChildren) {
            foreach ($category->getChildren() as $child) {
                $children[] = self::fromEntity($child, true);
            }
        }

        return new self(
            id: $category->getId()->toRfc4122(),
            name: $category->getName() ?? '',
            slug: $category->getSlug() ?? '',
            description: $category->getDescription(),
            parentId: $category->getParent()?->getId()?->toRfc4122(),
            children: $children,
            createdAt: $category->getCreatedAt()->format(\DateTimeInterface::ATOM),
            updatedAt: $category->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        );
    }
}
