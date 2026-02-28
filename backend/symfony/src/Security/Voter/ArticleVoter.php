<?php

namespace App\Security\Voter;

use App\Entity\Article;
use App\Entity\User;
use App\Enum\ArticleStatus;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ArticleVoter extends Voter
{
    public const CREATE = 'article.create';
    public const READ = 'article.read';
    public const UPDATE_OWN = 'article.update.own';
    public const UPDATE_ANY = 'article.update.any';
    public const PUBLISH = 'article.publish';
    public const ARCHIVE = 'article.archive';

    private const ROLE_ADMIN = 'ROLE_ADMIN';

    private const SUPPORTED_ATTRIBUTES = [
        self::CREATE,
        self::READ,
        self::UPDATE_OWN,
        self::UPDATE_ANY,
        self::PUBLISH,
        self::ARCHIVE,
    ];

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, self::SUPPORTED_ATTRIBUTES, true)) {
            return false;
        }

        if (in_array($attribute, [self::UPDATE_OWN, self::UPDATE_ANY, self::PUBLISH, self::ARCHIVE], true)
            && !$subject instanceof Article) {
            return false;
        }

        if ($attribute === self::READ && $subject !== null && !$subject instanceof Article) {
            return false;
        }

        return true;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        $permissions = $user->getEffectivePermissions();

        return match ($attribute) {
            self::CREATE => in_array(self::CREATE, $permissions, true),
            self::READ => $this->canRead($user, $subject, $permissions),
            self::UPDATE_OWN => $this->canUpdateOwn($user, $subject, $permissions),
            self::UPDATE_ANY => $this->canUpdateAny($user, $subject, $permissions),
            self::PUBLISH => $this->canPublish($subject, $permissions),
            self::ARCHIVE => $this->canArchive($subject, $permissions),
            default => false,
        };
    }

    private function canRead(User $user, ?Article $article, array $permissions): bool
    {
        if (in_array(self::READ, $permissions, true)) {
            return true;
        }

        if ($article === null) {
            return false;
        }

        // Published articles are always readable
        if ($article->getStatus() === ArticleStatus::PUBLISHED) {
            return true;
        }

        // Authors and co-authors can always read their articles
        if ($this->isAuthorOrCoAuthor($user, $article)) {
            return true;
        }

        return false;
    }

    private function canUpdateOwn(User $user, Article $article, array $permissions): bool
    {
        if (!in_array(self::UPDATE_OWN, $permissions, true)) {
            return false;
        }

        if (!$this->isAuthorOrCoAuthor($user, $article)) {
            return false;
        }

        if (!$this->canBypassLock($user, $article)) {
            return false;
        }

        return true;
    }

    private function canUpdateAny(User $user, Article $article, array $permissions): bool
    {
        if (!in_array(self::UPDATE_ANY, $permissions, true)) {
            return false;
        }

        if (!$this->canBypassLock($user, $article)) {
            return false;
        }

        return true;
    }

    private function canPublish(Article $article, array $permissions): bool
    {
        if (!in_array(self::PUBLISH, $permissions, true)) {
            return false;
        }

        return $article->getStatus() === ArticleStatus::IN_REVIEW;
    }

    private function canArchive(Article $article, array $permissions): bool
    {
        if (!in_array(self::ARCHIVE, $permissions, true)) {
            return false;
        }

        return $article->getStatus() === ArticleStatus::PUBLISHED;
    }

    private function isAuthorOrCoAuthor(User $user, Article $article): bool
    {
        if ($article->getAuthor() === $user) {
            return true;
        }

        return $article->getCoAuthors()->contains($user);
    }

    /**
     * Returns true if the user can edit despite collaborative locking.
     * Admins can force unlock; otherwise, deny if locked by another non-expired user.
     */
    private function canBypassLock(User $user, Article $article): bool
    {
        if (!$article->isLockedByOther($user)) {
            return true;
        }

        if ($article->isLockExpired()) {
            return true;
        }

        // Admins can force unlock
        return in_array(self::ROLE_ADMIN, $user->getRoles(), true);
    }
}
