<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function directPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class)->withTimestamps();
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    public function coAuthoredArticles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class)->withTimestamps();
    }

    /**
     * Get all effective permissions (from roles + direct).
     *
     * @return \Illuminate\Support\Collection<int, string>
     */
    public function getEffectivePermissions(): \Illuminate\Support\Collection
    {
        $rolePermissions = $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name');

        $directPermissions = $this->directPermissions()->pluck('name');

        return $rolePermissions->merge($directPermissions)->unique()->values();
    }

    public function hasPermission(string $permissionName): bool
    {
        return $this->getEffectivePermissions()->contains($permissionName);
    }
}
