<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Article extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_IN_REVIEW = 'in_review';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    public const ALLOWED_TRANSITIONS = [
        self::STATUS_DRAFT => [self::STATUS_IN_REVIEW],
        self::STATUS_IN_REVIEW => [self::STATUS_DRAFT, self::STATUS_PUBLISHED],
        self::STATUS_PUBLISHED => [self::STATUS_ARCHIVED],
        self::STATUS_ARCHIVED => [self::STATUS_DRAFT],
    ];

    protected $fillable = [
        'title',
        'slug',
        'body',
        'excerpt',
        'status',
        'author_id',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function canTransitionTo(string $newStatus): bool
    {
        $allowed = self::ALLOWED_TRANSITIONS[$this->status] ?? [];

        return in_array($newStatus, $allowed, true);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function coAuthors(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ArticleHistory::class)->orderByDesc('created_at');
    }

    public function lock(): HasOne
    {
        return $this->hasOne(ArticleLock::class);
    }

    public function isLockedBy(User $user): bool
    {
        $lock = $this->lock;

        return $lock
            && $lock->user_id === $user->id
            && $lock->expires_at->isFuture();
    }

    public function isLocked(): bool
    {
        $lock = $this->lock;

        return $lock && $lock->expires_at->isFuture();
    }

    public function isAuthorOrCoAuthor(User $user): bool
    {
        return $this->author_id === $user->id
            || $this->coAuthors()->where('user_id', $user->id)->exists();
    }
}
