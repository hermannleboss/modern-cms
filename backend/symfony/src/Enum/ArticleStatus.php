<?php

declare(strict_types=1);

namespace App\Enum;

enum ArticleStatus: string
{
    case DRAFT = 'draft';
    case IN_REVIEW = 'in_review';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
}
