<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\ArticleResponseDTO;
use App\DTO\ArticleRevisionResponseDTO;
use App\DTO\CreateArticleDTO;
use App\DTO\UpdateArticleDTO;
use App\Entity\Article;
use App\Entity\ArticleRevision;
use App\Enum\ArticleStatus;
use App\Repository\ArticleRepository;
use App\Repository\CategoryRepository;
use App\Repository\TagRepository;
use App\Repository\UserRepository;
use App\Security\Voter\ArticleVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/articles')]
class ArticleController extends AbstractController
{
    public function __construct(
        private readonly ArticleRepository $articleRepository,
        private readonly CategoryRepository $categoryRepository,
        private readonly TagRepository $tagRepository,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(100, max(1, $request->query->getInt('limit', 20)));
        $status = $request->query->get('status');
        $categoryId = $request->query->get('categoryId');
        $tagId = $request->query->get('tagId');

        $qb = $this->articleRepository->createQueryBuilder('a')
            ->orderBy('a.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        // Public users only see published; authenticated users with article.read see all
        if (!$this->isGranted(ArticleVoter::READ)) {
            $qb->andWhere('a.status = :published')
                ->setParameter('published', ArticleStatus::PUBLISHED);
        }

        if ($status !== null) {
            $articleStatus = ArticleStatus::tryFrom($status);
            if ($articleStatus !== null) {
                $qb->andWhere('a.status = :status')
                    ->setParameter('status', $articleStatus);
            }
        }

        if ($categoryId !== null) {
            $qb->andWhere('a.category = :categoryId')
                ->setParameter('categoryId', $categoryId);
        }

        if ($tagId !== null) {
            $qb->join('a.tags', 't')
                ->andWhere('t.id = :tagId')
                ->setParameter('tagId', $tagId);
        }

        $articles = $qb->getQuery()->getResult();

        $data = array_map(
            fn(Article $article) => ArticleResponseDTO::fromEntity($article),
            $articles,
        );

        return $this->json([
            'data' => $data,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(ArticleVoter::READ, $article);

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(ArticleVoter::CREATE);

        $data = json_decode($request->getContent(), true) ?? [];
        $dto = new CreateArticleDTO(
            title: $data['title'] ?? null,
            content: $data['content'] ?? null,
            excerpt: $data['excerpt'] ?? null,
            slug: $data['slug'] ?? null,
            categoryId: $data['categoryId'] ?? null,
            tagIds: $data['tagIds'] ?? [],
            coAuthorIds: $data['coAuthorIds'] ?? [],
        );

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], Response::HTTP_BAD_REQUEST);
        }

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        $article = new Article();
        $article->setTitle($dto->title);
        $article->setSlug($dto->slug);
        $article->setContent($dto->content);
        $article->setExcerpt($dto->excerpt);
        $article->setAuthor($user);

        if ($dto->categoryId !== null) {
            $category = $this->categoryRepository->find($dto->categoryId);
            if ($category === null) {
                return $this->json(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
            }
            $article->setCategory($category);
        }

        foreach ($dto->tagIds as $tagId) {
            $tag = $this->tagRepository->find($tagId);
            if ($tag !== null) {
                $article->addTag($tag);
            }
        }

        foreach ($dto->coAuthorIds as $coAuthorId) {
            $coAuthor = $this->userRepository->find($coAuthorId);
            if ($coAuthor !== null) {
                $article->addCoAuthor($coAuthor);
            }
        }

        // Create initial revision
        $revision = new ArticleRevision();
        $revision->setTitle($dto->title);
        $revision->setContent($dto->content);
        $revision->setEditor($user);
        $article->addRevision($revision);

        $this->em->persist($article);
        $this->em->flush();

        return $this->json(ArticleResponseDTO::fromEntity($article), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        // Grant if either update.own or update.any passes
        if (!$this->isGranted(ArticleVoter::UPDATE_OWN, $article)
            && !$this->isGranted(ArticleVoter::UPDATE_ANY, $article)) {
            $this->denyAccessUnlessGranted(ArticleVoter::UPDATE_ANY, $article);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $dto = new UpdateArticleDTO(
            title: $data['title'] ?? null,
            content: $data['content'] ?? null,
            excerpt: $data['excerpt'] ?? null,
            slug: $data['slug'] ?? null,
            status: $data['status'] ?? null,
            categoryId: $data['categoryId'] ?? null,
            tagIds: $data['tagIds'] ?? null,
            coAuthorIds: $data['coAuthorIds'] ?? null,
        );

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], Response::HTTP_BAD_REQUEST);
        }

        if ($dto->title !== null) {
            $article->setTitle($dto->title);
        }
        if ($dto->content !== null) {
            $article->setContent($dto->content);
        }
        if ($dto->excerpt !== null) {
            $article->setExcerpt($dto->excerpt);
        }
        if ($dto->slug !== null) {
            $article->setSlug($dto->slug);
        }
        if ($dto->status !== null) {
            $article->setStatus(ArticleStatus::from($dto->status));
        }
        if ($dto->categoryId !== null) {
            $category = $this->categoryRepository->find($dto->categoryId);
            if ($category === null) {
                return $this->json(['error' => 'Category not found'], Response::HTTP_BAD_REQUEST);
            }
            $article->setCategory($category);
        }
        if ($dto->tagIds !== null) {
            foreach ($article->getTags()->toArray() as $tag) {
                $article->removeTag($tag);
            }
            foreach ($dto->tagIds as $tagId) {
                $tag = $this->tagRepository->find($tagId);
                if ($tag !== null) {
                    $article->addTag($tag);
                }
            }
        }
        if ($dto->coAuthorIds !== null) {
            foreach ($article->getCoAuthors()->toArray() as $coAuthor) {
                $article->removeCoAuthor($coAuthor);
            }
            foreach ($dto->coAuthorIds as $coAuthorId) {
                $coAuthor = $this->userRepository->find($coAuthorId);
                if ($coAuthor !== null) {
                    $article->addCoAuthor($coAuthor);
                }
            }
        }

        // Create revision on update
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        $revision = new ArticleRevision();
        $revision->setTitle($article->getTitle());
        $revision->setContent($article->getContent());
        $revision->setEditor($user);
        $article->addRevision($revision);

        $this->em->flush();

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($article);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/publish', methods: ['POST'])]
    public function publish(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(ArticleVoter::PUBLISH, $article);

        if ($article->getStatus() !== ArticleStatus::IN_REVIEW) {
            return $this->json(
                ['error' => 'Article must be in review to publish'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $article->setStatus(ArticleStatus::PUBLISHED);
        $article->setPublishedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    #[Route('/{id}/archive', methods: ['POST'])]
    public function archive(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(ArticleVoter::ARCHIVE, $article);

        if ($article->getStatus() !== ArticleStatus::PUBLISHED) {
            return $this->json(
                ['error' => 'Article must be published to archive'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $article->setStatus(ArticleStatus::ARCHIVED);
        $this->em->flush();

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    #[Route('/{id}/submit-review', methods: ['POST'])]
    public function submitReview(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        $isAuthorOrCoAuthor = $article->getAuthor() === $user
            || $article->getCoAuthors()->contains($user);

        if (!$isAuthorOrCoAuthor) {
            return $this->json(
                ['error' => 'Only the author or co-authors can submit for review'],
                Response::HTTP_FORBIDDEN,
            );
        }

        if ($article->getStatus() !== ArticleStatus::DRAFT) {
            return $this->json(
                ['error' => 'Article must be a draft to submit for review'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $article->setStatus(ArticleStatus::IN_REVIEW);
        $this->em->flush();

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    #[Route('/{id}/lock', methods: ['POST'])]
    public function lock(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        if ($article->isLockedByOther($user)) {
            return $this->json(
                ['error' => 'Article is already locked by another user'],
                Response::HTTP_CONFLICT,
            );
        }

        $article->setLockedBy($user);
        $article->setLockedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    #[Route('/{id}/unlock', methods: ['POST'])]
    public function unlock(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        // Only the lock holder or an admin can unlock
        $isLockHolder = $article->getLockedBy() !== null
            && $article->getLockedBy() === $user;
        $isAdmin = $this->isGranted('ROLE_ADMIN');

        if (!$isLockHolder && !$isAdmin) {
            return $this->json(
                ['error' => 'Only the lock holder or an admin can unlock'],
                Response::HTTP_FORBIDDEN,
            );
        }

        $article->setLockedBy(null);
        $article->setLockedAt(null);
        $this->em->flush();

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    #[Route('/{id}/revisions', methods: ['GET'])]
    public function revisions(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(ArticleVoter::READ, $article);

        $data = array_map(
            fn(ArticleRevision $r) => ArticleRevisionResponseDTO::fromEntity($r),
            $article->getRevisions()->toArray(),
        );

        return $this->json($data);
    }

    #[Route('/{id}/preview', methods: ['GET'])]
    public function preview(string $id): JsonResponse
    {
        $article = $this->articleRepository->find($id);
        if ($article === null) {
            return $this->json(['error' => 'Article not found'], Response::HTTP_NOT_FOUND);
        }

        /** @var \App\Entity\User|null $user */
        $user = $this->getUser();
        $isAuthorOrCoAuthor = $user !== null
            && ($article->getAuthor() === $user || $article->getCoAuthors()->contains($user));

        if (!$isAuthorOrCoAuthor && !$this->isGranted(ArticleVoter::READ, $article)) {
            return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $this->json(ArticleResponseDTO::fromEntity($article));
    }

    /**
     * @return array<int, array{field: string, message: string}>
     */
    private function formatErrors($errors): array
    {
        $formatted = [];
        foreach ($errors as $error) {
            $formatted[] = [
                'field' => $error->getPropertyPath(),
                'message' => $error->getMessage(),
            ];
        }

        return $formatted;
    }
}
