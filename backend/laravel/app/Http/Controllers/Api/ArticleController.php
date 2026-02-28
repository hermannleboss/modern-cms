<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleHistory;
use App\Models\ArticleLock;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    use AuthorizesRequests;

    private const LOCK_DURATION_MINUTES = 30;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Article::class);

        $query = Article::with(['author', 'tags', 'categories', 'coAuthors']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('author_id')) {
            $query->where('author_id', $request->input('author_id'));
        }

        $articles = $query->orderByDesc('created_at')->paginate(
            $request->input('per_page', 15)
        );

        return response()->json($articles);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Article::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in([Article::STATUS_DRAFT])],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'co_author_ids' => ['nullable', 'array'],
            'co_author_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $article = Article::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(6),
            'body' => $validated['body'],
            'excerpt' => $validated['excerpt'] ?? null,
            'status' => Article::STATUS_DRAFT,
            'author_id' => $request->user()->id,
        ]);

        if (! empty($validated['tag_ids'])) {
            $article->tags()->sync($validated['tag_ids']);
        }

        if (! empty($validated['category_ids'])) {
            $article->categories()->sync($validated['category_ids']);
        }

        if (! empty($validated['co_author_ids'])) {
            $coAuthorIds = array_diff($validated['co_author_ids'], [$request->user()->id]);
            $article->coAuthors()->sync($coAuthorIds);
        }

        ArticleHistory::create([
            'article_id' => $article->id,
            'user_id' => $request->user()->id,
            'action' => 'created',
            'new_values' => $article->only(['title', 'body', 'excerpt', 'status']),
        ]);

        return response()->json(
            $article->load(['author', 'tags', 'categories', 'coAuthors']),
            201
        );
    }

    public function show(Request $request, Article $article): JsonResponse
    {
        $this->authorize('view', $article);

        $article->load(['author', 'tags', 'categories', 'coAuthors', 'lock']);

        return response()->json($article);
    }

    public function update(Request $request, Article $article): JsonResponse
    {
        $this->authorize('update', $article);

        if ($article->isLocked() && ! $article->isLockedBy($request->user())) {
            return response()->json([
                'message' => 'Article is locked by another user.',
            ], 423);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'body' => ['sometimes', 'required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'co_author_ids' => ['nullable', 'array'],
            'co_author_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $oldValues = $article->only(['title', 'body', 'excerpt']);

        $articleData = collect($validated)->only(['title', 'body', 'excerpt'])->toArray();
        if (isset($articleData['title'])) {
            $articleData['slug'] = Str::slug($articleData['title']) . '-' . Str::random(6);
        }

        $article->update($articleData);

        if (array_key_exists('tag_ids', $validated)) {
            $article->tags()->sync($validated['tag_ids'] ?? []);
        }

        if (array_key_exists('category_ids', $validated)) {
            $article->categories()->sync($validated['category_ids'] ?? []);
        }

        if (array_key_exists('co_author_ids', $validated)) {
            $coAuthorIds = array_diff($validated['co_author_ids'] ?? [], [$article->author_id]);
            $article->coAuthors()->sync($coAuthorIds);
        }

        ArticleHistory::create([
            'article_id' => $article->id,
            'user_id' => $request->user()->id,
            'action' => 'updated',
            'old_values' => $oldValues,
            'new_values' => $article->only(['title', 'body', 'excerpt']),
        ]);

        return response()->json(
            $article->fresh()->load(['author', 'tags', 'categories', 'coAuthors'])
        );
    }

    public function destroy(Request $request, Article $article): JsonResponse
    {
        $this->authorize('delete', $article);

        ArticleHistory::create([
            'article_id' => $article->id,
            'user_id' => $request->user()->id,
            'action' => 'deleted',
            'old_values' => $article->only(['title', 'body', 'excerpt', 'status']),
        ]);

        $article->delete();

        return response()->json(['message' => 'Article deleted successfully.']);
    }

    public function updateStatus(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([
                Article::STATUS_DRAFT,
                Article::STATUS_IN_REVIEW,
                Article::STATUS_PUBLISHED,
                Article::STATUS_ARCHIVED,
            ])],
        ]);

        $newStatus = $validated['status'];

        // Check permission based on target status
        if ($newStatus === Article::STATUS_PUBLISHED) {
            $this->authorize('publish', $article);
        } elseif ($newStatus === Article::STATUS_ARCHIVED) {
            $this->authorize('archive', $article);
        } else {
            $this->authorize('update', $article);
        }

        if (! $article->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => "Cannot transition from '{$article->status}' to '{$newStatus}'.",
            ], 422);
        }

        $oldStatus = $article->status;
        $article->status = $newStatus;

        if ($newStatus === Article::STATUS_PUBLISHED && ! $article->published_at) {
            $article->published_at = Carbon::now();
        }

        $article->save();

        ArticleHistory::create([
            'article_id' => $article->id,
            'user_id' => $request->user()->id,
            'action' => 'status_changed',
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $newStatus],
        ]);

        return response()->json(
            $article->fresh()->load(['author', 'tags', 'categories', 'coAuthors'])
        );
    }

    public function history(Article $article): JsonResponse
    {
        $this->authorize('view', $article);

        $histories = $article->histories()->with('user')->paginate(20);

        return response()->json($histories);
    }

    public function lock(Request $request, Article $article): JsonResponse
    {
        $this->authorize('lock', $article);

        if ($article->isLocked() && ! $article->isLockedBy($request->user())) {
            return response()->json([
                'message' => 'Article is already locked by another user.',
                'lock' => $article->lock->load('user'),
            ], 423);
        }

        ArticleLock::updateOrCreate(
            ['article_id' => $article->id],
            [
                'user_id' => $request->user()->id,
                'locked_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMinutes(self::LOCK_DURATION_MINUTES),
            ]
        );

        return response()->json([
            'message' => 'Article locked successfully.',
            'lock' => $article->fresh()->lock->load('user'),
        ]);
    }

    public function unlock(Request $request, Article $article): JsonResponse
    {
        $lock = $article->lock;

        if (! $lock) {
            return response()->json(['message' => 'Article is not locked.'], 422);
        }

        if ($lock->user_id !== $request->user()->id) {
            $this->authorize('forceUnlock', $article);
        }

        $lock->delete();

        return response()->json(['message' => 'Article unlocked successfully.']);
    }
}
