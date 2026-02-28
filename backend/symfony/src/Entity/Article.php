<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\ArticleStatus;
use App\Repository\ArticleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ArticleRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Article
{
    private const int LOCK_TIMEOUT_MINUTES = 15;

    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 280, unique: true)]
    private ?string $slug = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $content = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $excerpt = null;

    #[ORM\Column(length: 20, enumType: ArticleStatus::class)]
    private ArticleStatus $status = ArticleStatus::DRAFT;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'articles')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $author = null;

    /** @var Collection<int, User> */
    #[ORM\ManyToMany(targetEntity: User::class)]
    #[ORM\JoinTable(name: 'article_co_authors')]
    private Collection $coAuthors;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $lockedBy = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $lockedAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $publishedAt = null;

    #[ORM\ManyToOne(targetEntity: Category::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Category $category = null;

    /** @var Collection<int, Tag> */
    #[ORM\ManyToMany(targetEntity: Tag::class, inversedBy: 'articles')]
    #[ORM\JoinTable(name: 'article_tag')]
    private Collection $tags;

    /** @var Collection<int, ArticleRevision> */
    #[ORM\OneToMany(targetEntity: ArticleRevision::class, mappedBy: 'article', cascade: ['persist', 'remove'])]
    #[ORM\OrderBy(['createdAt' => 'DESC'])]
    private Collection $revisions;

    public function __construct()
    {
        $this->coAuthors = new ArrayCollection();
        $this->tags = new ArrayCollection();
        $this->revisions = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getExcerpt(): ?string
    {
        return $this->excerpt;
    }

    public function setExcerpt(?string $excerpt): static
    {
        $this->excerpt = $excerpt;

        return $this;
    }

    public function getStatus(): ArticleStatus
    {
        return $this->status;
    }

    public function setStatus(ArticleStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    /** @return Collection<int, User> */
    public function getCoAuthors(): Collection
    {
        return $this->coAuthors;
    }

    public function addCoAuthor(User $user): static
    {
        if (!$this->coAuthors->contains($user)) {
            $this->coAuthors->add($user);
        }

        return $this;
    }

    public function removeCoAuthor(User $user): static
    {
        $this->coAuthors->removeElement($user);

        return $this;
    }

    public function getLockedBy(): ?User
    {
        return $this->lockedBy;
    }

    public function setLockedBy(?User $lockedBy): static
    {
        $this->lockedBy = $lockedBy;

        return $this;
    }

    public function getLockedAt(): ?\DateTimeImmutable
    {
        return $this->lockedAt;
    }

    public function setLockedAt(?\DateTimeImmutable $lockedAt): static
    {
        $this->lockedAt = $lockedAt;

        return $this;
    }

    public function isLockedByOther(User $user): bool
    {
        if ($this->lockedBy === null) {
            return false;
        }

        if ($this->isLockExpired()) {
            return false;
        }

        return $this->lockedBy->getId()?->toRfc4122() !== $user->getId()?->toRfc4122();
    }

    public function isLockExpired(): bool
    {
        if ($this->lockedAt === null) {
            return true;
        }

        $expiresAt = $this->lockedAt->modify(sprintf('+%d minutes', self::LOCK_TIMEOUT_MINUTES));

        return new \DateTimeImmutable() > $expiresAt;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getPublishedAt(): ?\DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function setPublishedAt(?\DateTimeImmutable $publishedAt): static
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;

        return $this;
    }

    /** @return Collection<int, Tag> */
    public function getTags(): Collection
    {
        return $this->tags;
    }

    public function addTag(Tag $tag): static
    {
        if (!$this->tags->contains($tag)) {
            $this->tags->add($tag);
        }

        return $this;
    }

    public function removeTag(Tag $tag): static
    {
        $this->tags->removeElement($tag);

        return $this;
    }

    /** @return Collection<int, ArticleRevision> */
    public function getRevisions(): Collection
    {
        return $this->revisions;
    }

    public function addRevision(ArticleRevision $revision): static
    {
        if (!$this->revisions->contains($revision)) {
            $this->revisions->add($revision);
            $revision->setArticle($this);
        }

        return $this;
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}
