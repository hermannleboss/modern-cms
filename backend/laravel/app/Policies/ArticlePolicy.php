<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('article.read');
    }

    public function view(?User $user, Article $article): bool
    {
        if ($article->status === Article::STATUS_PUBLISHED) {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->hasPermission('article.read')
            || $article->isAuthorOrCoAuthor($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('article.create');
    }

    public function update(User $user, Article $article): bool
    {
        if ($user->hasPermission('article.update.any')) {
            return true;
        }

        if ($user->hasPermission('article.update.own') && $article->isAuthorOrCoAuthor($user)) {
            return true;
        }

        return false;
    }

    public function delete(User $user, Article $article): bool
    {
        if ($user->hasPermission('article.delete.any')) {
            return true;
        }

        if ($user->hasPermission('article.delete.own') && $article->author_id === $user->id) {
            return true;
        }

        return false;
    }

    public function publish(User $user, Article $article): bool
    {
        return $user->hasPermission('article.publish');
    }

    public function archive(User $user, Article $article): bool
    {
        return $user->hasPermission('article.archive');
    }

    public function lock(User $user, Article $article): bool
    {
        return $this->update($user, $article);
    }

    public function forceUnlock(User $user, Article $article): bool
    {
        return $user->hasPermission('article.update.any');
    }
}
