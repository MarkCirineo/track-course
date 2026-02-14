"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      }
      router.push(`/courses?${next.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-lg border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value;
        const ratingMin = (form.querySelector('[name="ratingMin"]') as HTMLInputElement)?.value;
        const ratingMax = (form.querySelector('[name="ratingMax"]') as HTMLInputElement)?.value;
        const slopeMin = (form.querySelector('[name="slopeMin"]') as HTMLInputElement)?.value;
        const slopeMax = (form.querySelector('[name="slopeMax"]') as HTMLInputElement)?.value;
        const teeType = searchParams.get("teeType");
        const holes = searchParams.get("holes");
        updateParams({
          q: q?.trim() || undefined,
          ratingMin: ratingMin || undefined,
          ratingMax: ratingMax || undefined,
          slopeMin: slopeMin || undefined,
          slopeMax: slopeMax || undefined,
          teeType: teeType && teeType !== "all" ? teeType : undefined,
          holes: holes && holes !== "all" ? holes : undefined,
        });
      }}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="q" className="text-sm font-medium">
          Search
        </label>
        <Input
          id="q"
          name="q"
          type="search"
          placeholder="Course name..."
          defaultValue={searchParams.get("q") ?? ""}
          className="w-48"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="ratingMin" className="text-sm font-medium">
          Rating (min)
        </label>
        <Input
          id="ratingMin"
          name="ratingMin"
          type="number"
          step={0.1}
          placeholder="e.g. 68"
          defaultValue={searchParams.get("ratingMin") ?? ""}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="ratingMax" className="text-sm font-medium">
          Rating (max)
        </label>
        <Input
          id="ratingMax"
          name="ratingMax"
          type="number"
          step={0.1}
          placeholder="e.g. 76"
          defaultValue={searchParams.get("ratingMax") ?? ""}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="slopeMin" className="text-sm font-medium">
          Slope (min)
        </label>
        <Input
          id="slopeMin"
          name="slopeMin"
          type="number"
          placeholder="e.g. 110"
          defaultValue={searchParams.get("slopeMin") ?? ""}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="slopeMax" className="text-sm font-medium">
          Slope (max)
        </label>
        <Input
          id="slopeMax"
          name="slopeMax"
          type="number"
          placeholder="e.g. 140"
          defaultValue={searchParams.get("slopeMax") ?? ""}
          className="w-24"
        />
      </div>
      <div className="flex flex-col gap-1">
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
      <div className="flex flex-col gap-1">
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
      <Button type="submit">Apply</Button>
    </form>
  );
}
