<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::random(6),
            'body' => fake()->paragraphs(3, true),
            'excerpt' => fake()->sentence(),
            'status' => Article::STATUS_DRAFT,
            'author_id' => User::factory(),
        ];
    }
}
