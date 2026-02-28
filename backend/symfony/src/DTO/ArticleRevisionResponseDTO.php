<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\ArticleRevision;

readonly class ArticleRevisionResponseDTO
{
    public function __construct(
        public string $id,
        public AuthorDTO $editor,
        public string $title,
        public string $content,
        public string $createdAt,
    ) {
    }

    public static function fromEntity(ArticleRevision $revision): self
    {
        return new self(
            id: $revision->getId()->toRfc4122(),
            editor: AuthorDTO::fromEntity($revision->getEditor()),
            title: $revision->getTitle() ?? '',
            content: $revision->getContent() ?? '',
            createdAt: $revision->getCreatedAt()->format(\DateTimeInterface::ATOM),
        );
    }
}
