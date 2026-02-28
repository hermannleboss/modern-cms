<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\CreateTagDTO;
use App\DTO\TagResponseDTO;
use App\DTO\UpdateTagDTO;
use App\Entity\Tag;
use App\Repository\TagRepository;
use App\Security\Voter\TagVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tags')]
class TagController extends AbstractController
{
    public function __construct(
        private readonly TagRepository $tagRepository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $tags = $this->tagRepository->findAll();

        $data = array_map(
            fn(Tag $tag) => TagResponseDTO::fromEntity($tag),
            $tags,
        );

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $tag = $this->tagRepository->find($id);
        if ($tag === null) {
            return $this->json(['error' => 'Tag not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(TagResponseDTO::fromEntity($tag));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(TagVoter::CREATE);

        $data = json_decode($request->getContent(), true) ?? [];
        $dto = new CreateTagDTO(
            name: $data['name'] ?? null,
            slug: $data['slug'] ?? null,
        );

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(['errors' => $this->formatErrors($errors)], Response::HTTP_BAD_REQUEST);
        }

        $tag = new Tag();
        $tag->setName($dto->name);
        $tag->setSlug($dto->slug);

        $this->em->persist($tag);
        $this->em->flush();

        return $this->json(TagResponseDTO::fromEntity($tag), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(TagVoter::UPDATE);

        $tag = $this->tagRepository->find($id);
        if ($tag === null) {
            return $this->json(['error' => 'Tag not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $dto = new UpdateTagDTO(
            name: $data['name'] ?? null,
            slug: $data['slug'] ?? null,
        );

        if ($dto->name !== null) {
            $tag->setName($dto->name);
        }
        if ($dto->slug !== null) {
            $tag->setSlug($dto->slug);
        }

        $this->em->flush();

        return $this->json(TagResponseDTO::fromEntity($tag));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->denyAccessUnlessGranted(TagVoter::DELETE);

        $tag = $this->tagRepository->find($id);
        if ($tag === null) {
            return $this->json(['error' => 'Tag not found'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($tag);
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
