<?php

declare(strict_types=1);

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateArticleDTO
{
    /**
     * @param array<string> $tagIds
     * @param array<string> $coAuthorIds
     */
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 255)]
        public readonly ?string $title = null,

        #[Assert\NotBlank]
        public readonly ?string $content = null,

        public readonly ?string $excerpt = null,

        #[Assert\NotBlank]
        #[Assert\Length(max: 280)]
        public readonly ?string $slug = null,

        public readonly ?string $categoryId = null,

        public readonly array $tagIds = [],

        public readonly array $coAuthorIds = [],
    ) {
    }
}
