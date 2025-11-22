'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

export type FilterState = {
  search: string;
  status: string;
  sortBy: string;
};

interface CourseFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function CourseFilter({
  filters,
  onFilterChange,
}: CourseFilterProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="고객사명 또는 강사 이메일 검색..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 진행 상황 필터 */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="진행 상황" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="before">교육 전</SelectItem>
            <SelectItem value="ongoing">교육 중</SelectItem>
            <SelectItem value="completed">교육 완료</SelectItem>
          </SelectContent>
        </Select>

        {/* 정렬 */}
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="date-asc">날짜순 (오름차순)</SelectItem>
            <SelectItem value="date-desc">날짜순 (내림차순)</SelectItem>
            <SelectItem value="client">고객사명순</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
