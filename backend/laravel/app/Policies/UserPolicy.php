<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('user.read');
    }

    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasPermission('user.read');
    }

    public function invite(User $user): bool
    {
        return $user->hasPermission('user.invite');
    }

    public function assignRole(User $user, User $model): bool
    {
        return $user->hasPermission('user.assign_role');
    }
}
