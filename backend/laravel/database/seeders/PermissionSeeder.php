<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'article.create',
            'article.read',
            'article.update.own',
            'article.update.any',
            'article.delete.own',
            'article.delete.any',
            'article.publish',
            'article.archive',
            'user.read',
            'user.invite',
            'user.assign_role',
            'category.create',
            'category.update',
            'category.delete',
            'tag.create',
            'tag.update',
            'tag.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Admin role with all permissions
        $admin = Role::firstOrCreate(['name' => 'admin', 'description' => 'Administrator']);
        $admin->permissions()->sync(Permission::all());

        // Editor role
        $editor = Role::firstOrCreate(['name' => 'editor', 'description' => 'Editor']);
        $editor->permissions()->sync(
            Permission::whereIn('name', [
                'article.create',
                'article.read',
                'article.update.own',
                'article.publish',
                'article.archive',
                'category.create',
                'category.update',
                'tag.create',
                'tag.update',
            ])->pluck('id')
        );

        // Author role
        $author = Role::firstOrCreate(['name' => 'author', 'description' => 'Author']);
        $author->permissions()->sync(
            Permission::whereIn('name', [
                'article.create',
                'article.read',
                'article.update.own',
                'article.delete.own',
            ])->pluck('id')
        );
    }
}
