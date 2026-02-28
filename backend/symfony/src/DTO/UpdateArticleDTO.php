<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateArticleDTO
{
    /**
     * @param array<string>|null $tagIds
     * @param array<string>|null $coAuthorIds
     */
    public function __construct(
        #[Assert\Length(max: 255)]
        public readonly ?string $title = null,

        public readonly ?string $content = null,

        public readonly ?string $excerpt = null,

        #[Assert\Length(max: 280)]
        public readonly ?string $slug = null,

        #[Assert\Choice(choices: ['draft', 'in_review', 'published', 'archived'])]
        public readonly ?string $status = null,

        public readonly ?string $categoryId = null,

        public readonly ?array $tagIds = null,

        public readonly ?array $coAuthorIds = null,
    ) {
    }
}
