<?php

declare(strict_types=1);

namespace App\Controller;

use App\DTO\UserResponseDTO;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Security\Voter\UserVoter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/users')]
class UserController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $this->denyAccessUnlessGranted(UserVoter::READ);

        $users = $this->userRepository->findAll();

        $data = array_map(
            fn(User $user) => UserResponseDTO::fromEntity($user),
            $users,
        );

        return $this->json($data);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $this->denyAccessUnlessGranted(UserVoter::READ);

        $user = $this->userRepository->find($id);
        if ($user === null) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(UserResponseDTO::fromEntity($user));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(UserVoter::INVITE);

        $data = json_decode($request->getContent(), true) ?? [];

        $email = $data['email'] ?? null;
        $firstName = $data['firstName'] ?? null;
        $lastName = $data['lastName'] ?? null;
        $password = $data['password'] ?? null;
        $roles = $data['roles'] ?? [];

        if (empty($email) || empty($firstName) || empty($lastName) || empty($password)) {
            return $this->json(
                ['error' => 'Fields email, firstName, lastName, and password are required'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $existing = $this->userRepository->findOneBy(['email' => $email]);
        if ($existing !== null) {
            return $this->json(['error' => 'A user with this email already exists'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $user->setRoles($roles);

        $this->em->persist($user);
        $this->em->flush();

        return $this->json(UserResponseDTO::fromEntity($user), Response::HTTP_CREATED);
    }

    #[Route('/{id}/roles', methods: ['PUT'])]
    public function assignRoles(string $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(UserVoter::ASSIGN_ROLE);

        $user = $this->userRepository->find($id);
        if ($user === null) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $roles = $data['roles'] ?? null;

        if (!is_array($roles)) {
            return $this->json(['error' => 'Field "roles" must be an array'], Response::HTTP_BAD_REQUEST);
        }

        $user->setRoles($roles);
        $this->em->flush();

        return $this->json(UserResponseDTO::fromEntity($user));
    }

    #[Route('/{id}/permissions', methods: ['PUT'])]
    public function assignPermissions(string $id, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(UserVoter::ASSIGN_ROLE);

        $user = $this->userRepository->find($id);
        if ($user === null) {
            return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $permissions = $data['permissions'] ?? null;

        if (!is_array($permissions)) {
            return $this->json(
                ['error' => 'Field "permissions" must be an array'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $user->setPermissions($permissions);
        $this->em->flush();

        return $this->json(UserResponseDTO::fromEntity($user));
    }
}
