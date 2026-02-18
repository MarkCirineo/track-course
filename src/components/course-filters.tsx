"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for inputs to allow immediate typing
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [ratingMin, setRatingMin] = useState(searchParams.get("ratingMin") ?? "");
  const [ratingMax, setRatingMax] = useState(searchParams.get("ratingMax") ?? "");
  const [slopeMin, setSlopeMin] = useState(searchParams.get("slopeMin") ?? "");
  const [slopeMax, setSlopeMax] = useState(searchParams.get("slopeMax") ?? "");

  // Debounce values
  const debouncedQ = useDebounce(q, 400);
  const debouncedRatingMin = useDebounce(ratingMin, 400);
  const debouncedRatingMax = useDebounce(ratingMax, 400);
  const debouncedSlopeMin = useDebounce(slopeMin, 400);
  const debouncedSlopeMax = useDebounce(slopeMax, 400);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      }
      next.set("page", "1"); // Reset directly to page 1 on filter change
      
      startTransition(() => {
        router.replace(`/courses?${next.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  // Effect to trigger update when debounced values change
  useEffect(() => {
    // Only update if the value is different from what's in the URL
    // This prevents unnecessary pushes if the user navigates back/forward
    const currentQ = searchParams.get("q") ?? "";
    const currentRatingMin = searchParams.get("ratingMin") ?? "";
    const currentRatingMax = searchParams.get("ratingMax") ?? "";
    const currentSlopeMin = searchParams.get("slopeMin") ?? "";
    const currentSlopeMax = searchParams.get("slopeMax") ?? "";

    if (
        debouncedQ !== currentQ ||
        debouncedRatingMin !== currentRatingMin ||
        debouncedRatingMax !== currentRatingMax ||
        debouncedSlopeMin !== currentSlopeMin ||
        debouncedSlopeMax !== currentSlopeMax
    ) {
        updateParams({
            q: debouncedQ,
            ratingMin: debouncedRatingMin,
            ratingMax: debouncedRatingMax,
            slopeMin: debouncedSlopeMin,
            slopeMax: debouncedSlopeMax,
        });
    }
  }, [
    debouncedQ,
    debouncedRatingMin,
    debouncedRatingMax,
    debouncedSlopeMin,
    debouncedSlopeMax,
    updateParams,
    searchParams
  ]);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4 bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="q" className="text-sm font-medium">
          Search
        </label>
        <Input
          id="q"
          name="q"
          type="search"
          placeholder="Name or location..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ratingMin" className="text-sm font-medium">
          Rating (min)
        </label>
        <Input
          id="ratingMin"
          name="ratingMin"
          type="number"
          step={0.1}
          placeholder="e.g. 68"
          value={ratingMin}
          onChange={(e) => setRatingMin(e.target.value)}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ratingMax" className="text-sm font-medium">
          Rating (max)
        </label>
        <Input
          id="ratingMax"
          name="ratingMax"
          type="number"
          step={0.1}
          placeholder="e.g. 76"
          value={ratingMax}
          onChange={(e) => setRatingMax(e.target.value)}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="slopeMin" className="text-sm font-medium">
          Slope (min)
        </label>
        <Input
          id="slopeMin"
          name="slopeMin"
          type="number"
          placeholder="e.g. 110"
          value={slopeMin}
          onChange={(e) => setSlopeMin(e.target.value)}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="slopeMax" className="text-sm font-medium">
          Slope (max)
        </label>
        <Input
          id="slopeMax"
          name="slopeMax"
          type="number"
          placeholder="e.g. 140"
          value={slopeMax}
          onChange={(e) => setSlopeMax(e.target.value)}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="teeType" className="text-sm font-medium">
          Tee type
        </label>
        <Select
          defaultValue={searchParams.get("teeType") ?? "all"}
          onValueChange={(v) => updateParams({ teeType: v === "all" ? undefined : v })}
        >
          <SelectTrigger id="teeType" className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="MALE">Men&apos;s</SelectItem>
            <SelectItem value="FEMALE">Women&apos;s</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="holes" className="text-sm font-medium">
          Holes
        </label>
        <Select
          defaultValue={searchParams.get("holes") ?? "all"}
          onValueChange={(v) => updateParams({ holes: v === "all" ? undefined : v })}
        >
          <SelectTrigger id="holes" className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="9">9 holes</SelectItem>
            <SelectItem value="18">18 holes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isPending && (
        <div className="flex h-10 items-center">
          <span className="animate-pulse text-xs text-muted-foreground">Updating...</span>
        </div>
      )}
    </div>
  );
}
