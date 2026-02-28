<?php

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class CategoryVoter extends Voter
{
    public const CREATE = 'category.create';
    public const UPDATE = 'category.update';
    public const DELETE = 'category.delete';

    private const SUPPORTED_ATTRIBUTES = [
        self::CREATE,
        self::UPDATE,
        self::DELETE,
    ];

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, self::SUPPORTED_ATTRIBUTES, true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        $permissions = $user->getEffectivePermissions();

        return in_array($attribute, $permissions, true);
    }
}
