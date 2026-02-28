<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\CategoryResponseDTO;
use App\DTO\CreateCategoryDTO;
use App\DTO\UpdateCategoryDTO;
use App\Entity\Category;
use App\Repository\CategoryRepository;
use App\Security\Voter\CategoryVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/categories')]
class CategoryController extends AbstractController
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $categories = $this->categoryRepository->findAll();

        $data = array_map(
            fn(Category $c) => CategoryResponseDTO::fromEntity($c),
            $categories,
        );

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $category = $this->categoryRepository->find($id);
        if ($category === null) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(CategoryResponseDTO::fromEntity($category));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(CategoryVoter::CREATE);

        $data = json_decode($request->getContent(), true) ?? [];
        $dto = new CreateCategoryDTO(
            name: $data['name'] ?? null,
            slug: $data['slug'] ?? null,
            description: $data['description'] ?? null,
            parentId: $data['parentId'] ?? null,
        );

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], Response::HTTP_BAD_REQUEST);
        }

        $category = new Category();
        $category->setName($dto->name);
        $category->setSlug($dto->slug);
        $category->setDescription($dto->description);

        if ($dto->parentId !== null) {
            $parent = $this->categoryRepository->find($dto->parentId);
            if ($parent === null) {
                return $this->json(['error' => 'Parent category not found'], Response::HTTP_BAD_REQUEST);
            }
            $category->setParent($parent);
        }

        $this->em->persist($category);
        $this->em->flush();

        return $this->json(CategoryResponseDTO::fromEntity($category), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(CategoryVoter::UPDATE);

        $category = $this->categoryRepository->find($id);
        if ($category === null) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $dto = new UpdateCategoryDTO(
            name: $data['name'] ?? null,
            slug: $data['slug'] ?? null,
            description: $data['description'] ?? null,
            parentId: $data['parentId'] ?? null,
        );

        if ($dto->name !== null) {
            $category->setName($dto->name);
        }
        if ($dto->slug !== null) {
            $category->setSlug($dto->slug);
        }
        if ($dto->description !== null) {
            $category->setDescription($dto->description);
        }
        if ($dto->parentId !== null) {
            $parent = $this->categoryRepository->find($dto->parentId);
            if ($parent === null) {
                return $this->json(['error' => 'Parent category not found'], Response::HTTP_BAD_REQUEST);
            }
            $category->setParent($parent);
        }

        $this->em->flush();

        return $this->json(CategoryResponseDTO::fromEntity($category));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->denyAccessUnlessGranted(CategoryVoter::DELETE);

        $category = $this->categoryRepository->find($id);
        if ($category === null) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($category);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
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
