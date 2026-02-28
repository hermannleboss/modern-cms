<?php

declare(strict_types=1);

namespace App\DTO;

use App\Entity\Article;

readonly class ArticleResponseDTO
{
    /**
     * @param array<AuthorDTO> $coAuthors
     * @param array<TagResponseDTO> $tags
     */
    public function __construct(
        public string $id,
        public string $title,
        public string $slug,
        public string $content,
        public ?string $excerpt,
        public string $status,
        public AuthorDTO $author,
        public array $coAuthors,
        public ?CategoryResponseDTO $category,
        public array $tags,
        public ?AuthorDTO $lockedBy,
        public ?string $lockedAt,
        public string $createdAt,
        public string $updatedAt,
        public ?string $publishedAt,
    ) {
    }

    public static function fromEntity(Article $article): self
    {
        $coAuthors = [];
        foreach ($article->getCoAuthors() as $coAuthor) {
            $coAuthors[] = AuthorDTO::fromEntity($coAuthor);
        }

        $tags = [];
        foreach ($article->getTags() as $tag) {
            $tags[] = TagResponseDTO::fromEntity($tag);
        }

        return new self(
            id: $article->getId()->toRfc4122(),
            title: $article->getTitle() ?? '',
            slug: $article->getSlug() ?? '',
            content: $article->getContent() ?? '',
            excerpt: $article->getExcerpt(),
            status: $article->getStatus()->value,
            author: AuthorDTO::fromEntity($article->getAuthor()),
            coAuthors: $coAuthors,
            category: $article->getCategory() !== null
                ? CategoryResponseDTO::fromEntity($article->getCategory(), false)
                : null,
            tags: $tags,
            lockedBy: $article->getLockedBy() !== null
                ? AuthorDTO::fromEntity($article->getLockedBy())
                : null,
            lockedAt: $article->getLockedAt()?->format(\DateTimeInterface::ATOM),
            createdAt: $article->getCreatedAt()->format(\DateTimeInterface::ATOM),
            updatedAt: $article->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            publishedAt: $article->getPublishedAt()?->format(\DateTimeInterface::ATOM),
        );
    }
}
