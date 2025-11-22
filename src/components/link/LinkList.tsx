'use client';

import { Link } from '@/types/database';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LinkListProps {
  links: Link[];
  onEdit?: (link: Link) => void;
  onDelete?: (link: Link) => void;
  readOnly?: boolean;
}

// 기본 카테고리
const DEFAULT_CATEGORIES = [
  '회의록',
  '수강생 공유자료',
  '가이드',
  '후속코칭 시트',
  '기타',
];

export default function LinkList({
  links,
  onEdit,
  onDelete,
  readOnly = false,
}: LinkListProps) {
  // 카테고리별 그룹핑
  const groupedLinks = links.reduce((acc, link) => {
    const category = link.category || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  // 카테고리 정렬 (기본 카테고리 우선, 그 외 알파벳 순)
  const sortedCategories = Object.keys(groupedLinks).sort((a, b) => {
    const aIndex = DEFAULT_CATEGORIES.indexOf(a);
    const bIndex = DEFAULT_CATEGORIES.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  if (links.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">등록된 링크가 없습니다.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={sortedCategories} className="space-y-2">
      {sortedCategories.map((category) => {
        const categoryLinks = groupedLinks[category];
        return (
          <AccordionItem
            key={category}
            value={category}
            className="bg-white border border-gray-200 rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{category}</span>
                <Badge variant="secondary">{categoryLinks.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {categoryLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`p-3 rounded-md border flex items-start justify-between gap-3 ${
                      link.is_admin_created
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {link.title}
                        </h4>
                        {link.is_admin_created && (
                          <Badge variant="outline" className="text-xs">
                            운영진
                          </Badge>
                        )}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>

                    {!readOnly && (
                      <div className="flex gap-1 flex-shrink-0">
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => onEdit(link)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => onDelete(link)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
