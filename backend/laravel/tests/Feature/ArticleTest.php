<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\ArticleLock;
use App\Models\Category;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $author;
    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->roles()->attach(Role::where('name', 'admin')->first());

        $this->editor = User::factory()->create();
        $this->editor->roles()->attach(Role::where('name', 'editor')->first());

        $this->author = User::factory()->create();
        $this->author->roles()->attach(Role::where('name', 'author')->first());
    }

    // ---- INDEX ----

    public function test_admin_can_list_articles(): void
    {
        Article::factory()->count(3)->create(['author_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin)->getJson('/api/articles');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_unauthenticated_cannot_list_articles(): void
    {
        $response = $this->getJson('/api/articles');

        $response->assertUnauthorized();
    }

    // ---- STORE ----

    public function test_author_can_create_article(): void
    {
        $response = $this->actingAs($this->author)->postJson('/api/articles', [
            'title' => 'My First Article',
            'body' => 'This is the body of the article.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('title', 'My First Article')
            ->assertJsonPath('status', 'draft')
            ->assertJsonPath('author_id', $this->author->id);

        $this->assertDatabaseHas('articles', ['title' => 'My First Article']);
    }

    public function test_article_creation_records_history(): void
    {
        $this->actingAs($this->author)->postJson('/api/articles', [
            'title' => 'Article With History',
            'body' => 'Body content.',
        ]);

        $this->assertDatabaseHas('article_histories', [
            'action' => 'created',
            'user_id' => $this->author->id,
        ]);
    }

    public function test_article_can_be_created_with_tags_and_categories(): void
    {
        $tag = Tag::create(['name' => 'PHP', 'slug' => 'php']);
        $category = Category::create(['name' => 'Tech', 'slug' => 'tech']);

        $response = $this->actingAs($this->author)->postJson('/api/articles', [
            'title' => 'Tagged Article',
            'body' => 'Body content.',
            'tag_ids' => [$tag->id],
            'category_ids' => [$category->id],
        ]);

        $response->assertCreated();
        $this->assertCount(1, $response->json('tags'));
        $this->assertCount(1, $response->json('categories'));
    }

    public function test_article_can_be_created_with_co_authors(): void
    {
        $coAuthor = User::factory()->create();

        $response = $this->actingAs($this->author)->postJson('/api/articles', [
            'title' => 'Collab Article',
            'body' => 'Body content.',
            'co_author_ids' => [$coAuthor->id],
        ]);

        $response->assertCreated();
        $this->assertCount(1, $response->json('co_authors'));
    }

    // ---- SHOW ----

    public function test_can_view_published_article(): void
    {
        $article = Article::factory()->create([
            'author_id' => $this->author->id,
            'status' => Article::STATUS_PUBLISHED,
        ]);

        $response = $this->actingAs($this->author)->getJson("/api/articles/{$article->id}");

        $response->assertOk()
            ->assertJsonPath('id', $article->id);
    }

    // ---- UPDATE ----

    public function test_author_can_update_own_article(): void
    {
        $article = Article::factory()->create(['author_id' => $this->author->id]);

        $response = $this->actingAs($this->author)->putJson("/api/articles/{$article->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertOk()
            ->assertJsonPath('title', 'Updated Title');
    }

    public function test_author_cannot_update_other_article(): void
    {
        $otherAuthor = User::factory()->create();
        $otherAuthor->roles()->attach(Role::where('name', 'author')->first());

        $article = Article::factory()->create(['author_id' => $otherAuthor->id]);

        $response = $this->actingAs($this->author)->putJson("/api/articles/{$article->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_any_article(): void
    {
        $article = Article::factory()->create(['author_id' => $this->author->id]);

        $response = $this->actingAs($this->admin)->putJson("/api/articles/{$article->id}", [
            'title' => 'Admin Updated Title',
        ]);

        $response->assertOk()
            ->assertJsonPath('title', 'Admin Updated Title');
    }

    public function test_update_records_history(): void
    {
        $article = Article::factory()->create(['author_id' => $this->author->id]);

        $this->actingAs($this->author)->putJson("/api/articles/{$article->id}", [
            'title' => 'Updated Title',
        ]);

        $this->assertDatabaseHas('article_histories', [
            'article_id' => $article->id,
            'action' => 'updated',
            'user_id' => $this->author->id,
        ]);
    }

    // ---- DELETE ----

    public function test_author_can_delete_own_article(): void
    {
        $article = Article::factory()->create(['author_id' => $this->author->id]);

        $response = $this->actingAs($this->author)->deleteJson("/api/articles/{$article->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('articles', ['id' => $article->id]);
    }

    public function test_author_cannot_delete_other_article(): void
    {
        $article = Article::factory()->create(['author_id' => $this->admin->id]);

        $response = $this->actingAs($this->author)->deleteJson("/api/articles/{$article->id}");

        $response->assertForbidden();
    }

    // ---- STATUS TRANSITIONS ----

    public function test_draft_can_transition_to_in_review(): void
    {
        $article = Article::factory()->create([
            'author_id' => $this->author->id,
            'status' => Article::STATUS_DRAFT,
        ]);

        $response = $this->actingAs($this->author)->patchJson("/api/articles/{$article->id}/status", [
            'status' => 'in_review',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'in_review');
    }

    public function test_in_review_can_transition_to_published(): void
    {
        $article = Article::factory()->create([
            'author_id' => $this->editor->id,
            'status' => Article::STATUS_IN_REVIEW,
        ]);

        $response = $this->actingAs($this->editor)->patchJson("/api/articles/{$article->id}/status", [
            'status' => 'published',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'published');
    }

    public function test_invalid_status_transition_is_rejected(): void
    {
        $article = Article::factory()->create([
            'author_id' => $this->author->id,
            'status' => Article::STATUS_DRAFT,
        ]);

        $response = $this->actingAs($this->admin)->patchJson("/api/articles/{$article->id}/status", [
            'status' => 'published',
        ]);

        $response->assertStatus(422);
    }

    public function test_author_cannot_publish_article(): void
    {
        $article = Article::factory()->create([
            'author_id' => $this->author->id,
            'status' => Article::STATUS_IN_REVIEW,
        ]);

        $response = $this->actingAs($this->author)->patchJson("/api/articles/{$article->id}/status", [
            'status' => 'published',
        ]);

        $response->assertForbidden();
    }

    // ---- LOCKING ----

    public function test_author_can_lock_own_article(): void
    {
        $article = Article::factory()->create(['author_id' => $this->author->id]);

        $response = $this->actingAs($this->author)->postJson("/api/articles/{$article->id}/lock");

        $response->assertOk()
            ->assertJsonPath('message', 'Article locked successfully.');

        $this->assertDatabaseHas('article_locks', [
            'article_id' => $article->id,
            'user_id' => $this->author->id,
        ]);
    }

    public function test_cannot_lock_article_locked_by_another(): void
    {
        $otherAdmin = User::factory()->create();
        $otherAdmin->roles()->attach(Role::where('name', 'admin')->first());

        $article = Article::factory()->create(['author_id' => $this->admin->id]);

        ArticleLock::create([
            'article_id' => $article->id,
            'user_id' => $this->admin->id,
            'locked_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(30),
        ]);

        $response = $this->actingAs($otherAdmin)->postJson("/api/articles/{$article->id}/lock");

        $response->assertStatus(423);
    }

    public function test_cannot_update_locked_article(): void
    {
        $article = Article::factory()->create(['author_id' => $this->admin->id]);

        ArticleLock::create([
            'article_id' => $article->id,
            'user_id' => $this->admin->id,
            'locked_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(30),
        ]);

        $response = $this->actingAs($this->editor)->putJson("/api/articles/{$article->id}", [
            'title' => 'Blocked Update',
        ]);

        // Editor doesn't have article.update.any, so it's forbidden
        $response->assertForbidden();
    }

    public function test_admin_can_force_unlock(): void
    {
        $article = Article::factory()->create(['author_id' => $this->author->id]);

        ArticleLock::create([
            'article_id' => $article->id,
            'user_id' => $this->author->id,
            'locked_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(30),
        ]);

        $response = $this->actingAs($this->admin)->deleteJson("/api/articles/{$article->id}/lock");

        $response->assertOk()
            ->assertJson(['message' => 'Article unlocked successfully.']);

        $this->assertDatabaseMissing('article_locks', ['article_id' => $article->id]);
    }

    public function test_author_cannot_force_unlock_others_lock(): void
    {
        $otherAuthor = User::factory()->create();
        $otherAuthor->roles()->attach(Role::where('name', 'author')->first());

        $article = Article::factory()->create(['author_id' => $otherAuthor->id]);

        ArticleLock::create([
            'article_id' => $article->id,
            'user_id' => $otherAuthor->id,
            'locked_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMinutes(30),
        ]);

        $response = $this->actingAs($this->author)->deleteJson("/api/articles/{$article->id}/lock");

        $response->assertForbidden();
    }

    // ---- HISTORY ----

    public function test_can_view_article_history(): void
    {
        $article = Article::factory()->create(['author_id' => $this->author->id]);

        // Create some history
        $article->histories()->create([
            'user_id' => $this->author->id,
            'action' => 'created',
            'new_values' => ['title' => $article->title],
        ]);

        $response = $this->actingAs($this->author)->getJson("/api/articles/{$article->id}/history");

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }
}
