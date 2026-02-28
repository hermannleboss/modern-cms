<?php

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class UserVoter extends Voter
{
    public const READ = 'user.read';
    public const INVITE = 'user.invite';
    public const ASSIGN_ROLE = 'user.assign_role';

    private const SUPPORTED_ATTRIBUTES = [
        self::READ,
        self::INVITE,
        self::ASSIGN_ROLE,
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
